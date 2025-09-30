using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using TaskMan.Api.DTOs;
using TaskMan.Api.Services;

namespace TaskMan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvitesController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IEmailService _emailService;

    public InvitesController(IUserService userService, IEmailService emailService)
    {
        _userService = userService;
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<ActionResult> SendInvite([FromBody] SendInviteRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var roleClaim = User.FindFirst("role")?.Value;
            if (roleClaim != "lead")
            {
                return Forbid("Only leads can send invites");
            }

            // For demo purposes, just return success
            // In a real implementation, you would create an invite record and send email
            return Ok(new { message = "Invite sent successfully (demo mode)" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to send invite" });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<InviteDto>>> GetInvites()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            // For demo purposes, return empty list
            return Ok(new { invites = new List<InviteDto>() });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch invites" });
        }
    }
}

public class SendInviteRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = "member";

    public string? Message { get; set; }
}

public class InviteDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsExpired { get; set; }
    public bool IsAccepted { get; set; }
}

