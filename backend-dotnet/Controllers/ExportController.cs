using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CsvHelper;
using System.Globalization;
using TaskMan.Api.DTOs;
using TaskMan.Api.Services;

namespace TaskMan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly ITaskService _taskService;

    public ExportController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet("tasks/csv")]
    public async Task<IActionResult> ExportTasksToCsv([FromQuery] string? status, [FromQuery] string? projectTag)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var parentOrgIdClaim = User.FindFirst("parentOrgId")?.Value;
            if (string.IsNullOrEmpty(parentOrgIdClaim) || !int.TryParse(parentOrgIdClaim, out var parentOrgId))
            {
                parentOrgId = userId;
            }

            var filters = new TaskFilters
            {
                Status = status,
                ProjectTag = projectTag
            };

            var tasks = await _taskService.GetTasksByOrgAsync(parentOrgId, filters);

            // Create CSV content
            using var memoryStream = new MemoryStream();
            using var writer = new StreamWriter(memoryStream);
            using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

            // Write CSV headers
            csv.WriteField("ID");
            csv.WriteField("Title");
            csv.WriteField("Description");
            csv.WriteField("Status");
            csv.WriteField("Due Date");
            csv.WriteField("Project Tag");
            csv.WriteField("Created By");
            csv.WriteField("Created At");
            csv.WriteField("Updated At");
            csv.WriteField("Assignees");
            csv.WriteField("Comments Count");
            csv.WriteField("Attachments Count");
            csv.NextRecord();

            // Write task data
            foreach (var task in tasks)
            {
                csv.WriteField(task.Id);
                csv.WriteField(task.Title);
                csv.WriteField(task.Description);
                csv.WriteField(task.Status);
                csv.WriteField(task.DueDate?.ToString("yyyy-MM-dd HH:mm"));
                csv.WriteField(task.ProjectTag ?? "");
                csv.WriteField(task.CreatedBy);
                csv.WriteField(task.CreatedAt.ToString("yyyy-MM-dd HH:mm"));
                csv.WriteField(task.UpdatedAt.ToString("yyyy-MM-dd HH:mm"));
                csv.WriteField(string.Join(", ", task.Assignees.Select(a => a.FullName)));
                csv.WriteField(task.Comments.Count);
                csv.WriteField(task.Attachments.Count);
                csv.NextRecord();
            }

            await csv.FlushAsync();
            await writer.FlushAsync();

            var csvBytes = memoryStream.ToArray();
            var fileName = $"tasks_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

            return File(csvBytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to export tasks" });
        }
    }
}

