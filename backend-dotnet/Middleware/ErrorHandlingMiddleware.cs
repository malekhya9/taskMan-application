using System.Net;
using System.Text.Json;

namespace TaskMan.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            message = "Something went wrong!",
            error = new { message = "", stackTrace = "" }
        };

        switch (exception)
        {
            case ArgumentException argEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    message = argEx.Message,
                    error = new { message = "", stackTrace = "" }
                };
                break;
            case UnauthorizedAccessException authEx:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = new
                {
                    message = authEx.Message,
                    error = new { message = "", stackTrace = "" }
                };
                break;
            case InvalidOperationException opEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    message = opEx.Message,
                    error = new { message = "", stackTrace = "" }
                };
                break;
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        // In development, include more error details
        if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
        {
            response = new
            {
                message = response.message,
                error = new
                {
                    message = exception.Message,
                    stackTrace = exception.StackTrace
                }
            };
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

