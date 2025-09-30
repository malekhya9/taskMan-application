using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskMan.Api.DTOs;
using TaskMan.Api.Services;

namespace TaskMan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetTasks([FromQuery] string? status, [FromQuery] string? projectTag, [FromQuery] int? assigneeId)
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
                // If no parentOrgId claim, use userId as parentOrgId
                parentOrgId = userId;
            }

            var filters = new TaskFilters
            {
                Status = status,
                ProjectTag = projectTag,
                AssigneeId = assigneeId
            };

            var tasks = await _taskService.GetTasksByOrgAsync(parentOrgId, filters);
            return Ok(new { tasks });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch tasks" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(int id)
    {
        try
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }

            return Ok(task);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch task" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskRequest request)
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
                return Forbid("Only leads can create tasks");
            }

            var task = await _taskService.CreateTaskAsync(request, userId);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, new { message = "Task created successfully", task });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create task" });
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<TaskDto>> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var roleClaim = User.FindFirst("role")?.Value ?? "member";

            var task = await _taskService.UpdateTaskStatusAsync(id, request.Status, userId, roleClaim);
            return Ok(new { message = "Task status updated", task });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update task status" });
        }
    }

    [HttpPost("{id}/assignees")]
    public async Task<ActionResult> AddAssignees(int id, [FromBody] AddAssigneesRequest request)
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
                return Forbid("Only leads can assign tasks");
            }

            await _taskService.AddAssigneesAsync(id, request.AssigneeIds);
            return Ok(new { message = "Assignees added successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to add assignees" });
        }
    }

    [HttpDelete("{id}/assignees/{assigneeId}")]
    public async Task<ActionResult> RemoveAssignee(int id, int assigneeId)
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
                return Forbid("Only leads can remove assignees");
            }

            await _taskService.RemoveAssigneeAsync(id, assigneeId);
            return Ok(new { message = "Assignee removed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to remove assignee" });
        }
    }

    [HttpPost("{id}/attachments")]
    public async Task<ActionResult<List<TaskAttachmentDto>>> UploadAttachments(int id, [FromForm] List<IFormFile> files)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "No files uploaded" });
            }

            var attachments = await _taskService.AddAttachmentsAsync(id, files);
            return Ok(new { message = "Files uploaded successfully", attachments });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to upload files" });
        }
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<TaskCommentDto>> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var comment = await _taskService.AddCommentAsync(id, userId, request.Content);
            return Ok(new { message = "Comment added successfully", comment });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to add comment" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(int id)
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
                return Forbid("Only leads can delete tasks");
            }

            await _taskService.SoftDeleteTaskAsync(id);
            return Ok(new { message = "Task deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to delete task" });
        }
    }
}

