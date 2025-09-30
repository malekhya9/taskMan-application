using MailKit.Net.Smtp;
using MimeKit;
using TaskMan.Api.Models;
using TaskModel = TaskMan.Api.Models.Task;

namespace TaskMan.Api.Services;

public interface IEmailService
{
    System.Threading.Tasks.Task SendEmailAsync(string to, string subject, string body);
    System.Threading.Tasks.Task SendInviteEmailAsync(Invite invite);
    System.Threading.Tasks.Task SendVerificationEmailAsync(User user, string verificationToken);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async System.Threading.Tasks.Task SendEmailAsync(string to, string subject, string body)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var smtpServer = emailSettings["SmtpServer"] ?? throw new InvalidOperationException("SMTP Server not configured");
        var smtpPort = emailSettings.GetValue<int>("SmtpPort");
        var smtpUsername = emailSettings["SmtpUsername"] ?? throw new InvalidOperationException("SMTP Username not configured");
        var smtpPassword = emailSettings["SmtpPassword"] ?? throw new InvalidOperationException("SMTP Password not configured");
        var fromEmail = emailSettings["FromEmail"] ?? throw new InvalidOperationException("From Email not configured");
        var fromName = emailSettings["FromName"] ?? "TaskMan";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = body
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpServer, smtpPort, false);
        await client.AuthenticateAsync(smtpUsername, smtpPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    public async System.Threading.Tasks.Task SendInviteEmailAsync(Invite invite)
    {
        var subject = "You've been invited to join TaskMan";
        var body = $@"
            <html>
            <body>
                <h2>You've been invited to join TaskMan</h2>
                <p>Hello!</p>
                <p>You have been invited to join TaskMan as a {invite.Role}.</p>
                <p>Invitation details:</p>
                <ul>
                    <li>Role: {invite.Role}</li>
                    <li>Expires: {invite.ExpiresAt:yyyy-MM-dd HH:mm} UTC</li>
                </ul>
                {(!string.IsNullOrEmpty(invite.Message) ? $"<p>Message from inviter: {invite.Message}</p>" : "")}
                <p>To accept this invitation, please contact your organization lead.</p>
                <p>Best regards,<br>TaskMan Team</p>
            </body>
            </html>";

        await SendEmailAsync(invite.Email, subject, body);
    }

    public async System.Threading.Tasks.Task SendVerificationEmailAsync(User user, string verificationToken)
    {
        var subject = "Verify your TaskMan account";
        var body = $@"
            <html>
            <body>
                <h2>Welcome to TaskMan!</h2>
                <p>Hello {user.FirstName},</p>
                <p>Thank you for registering with TaskMan. Please verify your email address to complete your registration.</p>
                <p>Verification Token: {verificationToken}</p>
                <p>This token will expire in 24 hours.</p>
                <p>If you didn't create this account, please ignore this email.</p>
                <p>Best regards,<br>TaskMan Team</p>
            </body>
            </html>";

        await SendEmailAsync(user.Email, subject, body);
    }
}

