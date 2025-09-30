using Microsoft.EntityFrameworkCore;
using TaskMan.Api.Data;
using TaskMan.Api.DTOs;
using TaskMan.Api.Models;
using TaskModel = TaskMan.Api.Models.Task;

namespace TaskMan.Api.Services;

public interface ITaskService
{
    System.Threading.Tasks.Task<List<TaskDto>> GetTasksByOrgAsync(int parentOrgId, TaskFilters? filters = null);
    System.Threading.Tasks.Task<TaskDto?> GetTaskByIdAsync(int taskId);
    System.Threading.Tasks.Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, int createdBy);
    System.Threading.Tasks.Task<TaskDto> UpdateTaskStatusAsync(int taskId, string status, int userId, string userRole);
    System.Threading.Tasks.Task SoftDeleteTaskAsync(int taskId);
    System.Threading.Tasks.Task AddAssigneesAsync(int taskId, List<int> assigneeIds);
    System.Threading.Tasks.Task RemoveAssigneeAsync(int taskId, int assigneeId);
    System.Threading.Tasks.Task<List<TaskAttachmentDto>> AddAttachmentsAsync(int taskId, List<IFormFile> files);
    System.Threading.Tasks.Task<TaskCommentDto> AddCommentAsync(int taskId, int userId, string content);
    System.Threading.Tasks.Task<List<TaskCommentDto>> GetCommentsAsync(int taskId);
}

public class TaskService : ITaskService
{
    private readonly TaskManDbContext _context;

    public TaskService(TaskManDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<TaskDto>> GetTasksByOrgAsync(int parentOrgId, TaskFilters? filters = null)
    {
        var query = _context.Tasks
            .Include(t => t.Creator)
            .Include(t => t.Assignees)
                .ThenInclude(ta => ta.User)
            .Include(t => t.Attachments)
            .Include(t => t.Comments)
                .ThenInclude(tc => tc.User)
            .Where(t => (t.Creator.ParentOrgId == parentOrgId || t.Creator.Id == parentOrgId) && 
                       t.ArchivedAt == null);

        if (filters != null)
        {
            if (!string.IsNullOrEmpty(filters.Status))
            {
                query = query.Where(t => t.Status == filters.Status);
            }

            if (!string.IsNullOrEmpty(filters.ProjectTag))
            {
                query = query.Where(t => t.ProjectTag == filters.ProjectTag);
            }

            if (filters.AssigneeId.HasValue)
            {
                query = query.Where(t => t.Assignees.Any(ta => ta.UserId == filters.AssigneeId.Value));
            }
        }

        var tasks = await query
            .OrderBy(t => t.DueDate)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tasks.Select(MapToTaskDto).ToList();
    }

    public async System.Threading.Tasks.Task<TaskDto?> GetTaskByIdAsync(int taskId)
    {
        var task = await _context.Tasks
            .Include(t => t.Creator)
            .Include(t => t.Assignees)
                .ThenInclude(ta => ta.User)
            .Include(t => t.Attachments)
            .Include(t => t.Comments)
                .ThenInclude(tc => tc.User)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.ArchivedAt == null);

        return task != null ? MapToTaskDto(task) : null;
    }

    public async System.Threading.Tasks.Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, int createdBy)
    {
        if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Description))
        {
            throw new ArgumentException("Title and description are required");
        }

        var task = new TaskModel
        {
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            ProjectTag = request.ProjectTag,
            CreatedBy = createdBy,
            Status = "backlogged"
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // Add assignees if provided
        if (request.AssigneeIds != null && request.AssigneeIds.Any())
        {
            foreach (var assigneeId in request.AssigneeIds)
            {
                var taskAssignee = new TaskAssignee
                {
                    TaskId = task.Id,
                    UserId = assigneeId
                };
                _context.TaskAssignees.Add(taskAssignee);
            }
            await _context.SaveChangesAsync();
        }

        return await GetTaskByIdAsync(task.Id) ?? throw new InvalidOperationException("Failed to retrieve created task");
    }

    public async System.Threading.Tasks.Task<TaskDto> UpdateTaskStatusAsync(int taskId, string status, int userId, string userRole)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
        {
            throw new ArgumentException("Task not found");
        }

        // Validate transition based on user role
        var validTransitions = new Dictionary<string, string[]>
        {
            { "lead", new[] { "backlogged", "defined", "in-progress", "review", "completed" } },
            { "member", new[] { "defined", "in-progress", "review" } }
        };

        var currentStatusIndex = Array.IndexOf(validTransitions["lead"], task.Status);
        var newStatusIndex = Array.IndexOf(validTransitions["lead"], status);

        if (userRole == "member")
        {
            // Members can only move defined → in-progress and in-progress → review
            if (!(task.Status == "defined" && status == "in-progress") &&
                !(task.Status == "in-progress" && status == "review"))
            {
                throw new InvalidOperationException("Invalid status transition for member");
            }
        }
        else if (userRole == "lead")
        {
            // Leads can move between any states, but only leads can move review → completed
            if (task.Status == "review" && status == "completed")
            {
                // Only leads can complete tasks
            }
            else if (newStatusIndex <= currentStatusIndex)
            {
                // Allow moving backwards
            }
            else if (newStatusIndex > currentStatusIndex + 1)
            {
                // Don't allow skipping states
                throw new InvalidOperationException("Cannot skip status transitions");
            }
        }

        task.Status = status;
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetTaskByIdAsync(taskId) ?? throw new InvalidOperationException("Failed to retrieve updated task");
    }

    public async System.Threading.Tasks.Task SoftDeleteTaskAsync(int taskId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task != null)
        {
            task.ArchivedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task AddAssigneesAsync(int taskId, List<int> assigneeIds)
    {
        foreach (var assigneeId in assigneeIds)
        {
            var existingAssignment = await _context.TaskAssignees
                .FirstOrDefaultAsync(ta => ta.TaskId == taskId && ta.UserId == assigneeId);

            if (existingAssignment == null)
            {
                var taskAssignee = new TaskAssignee
                {
                    TaskId = taskId,
                    UserId = assigneeId
                };
                _context.TaskAssignees.Add(taskAssignee);
            }
        }
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task RemoveAssigneeAsync(int taskId, int assigneeId)
    {
        var assignment = await _context.TaskAssignees
            .FirstOrDefaultAsync(ta => ta.TaskId == taskId && ta.UserId == assigneeId);

        if (assignment != null)
        {
            _context.TaskAssignees.Remove(assignment);
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task<List<TaskAttachmentDto>> AddAttachmentsAsync(int taskId, List<IFormFile> files)
    {
        var attachments = new List<TaskAttachmentDto>();
        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        if (!Directory.Exists(uploadPath))
        {
            Directory.CreateDirectory(uploadPath);
        }

        foreach (var file in files)
        {
            var uniqueFileName = $"{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new TaskAttachment
            {
                TaskId = taskId,
                Filename = uniqueFileName,
                OriginalName = file.FileName,
                FileSize = file.Length
            };

            _context.TaskAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            attachments.Add(new TaskAttachmentDto
            {
                Id = attachment.Id,
                Filename = attachment.Filename,
                OriginalName = attachment.OriginalName,
                FileSize = attachment.FileSize,
                Url = attachment.Url,
                UploadedAt = attachment.UploadedAt
            });
        }

        return attachments;
    }

    public async System.Threading.Tasks.Task<TaskCommentDto> AddCommentAsync(int taskId, int userId, string content)
    {
        if (string.IsNullOrEmpty(content))
        {
            throw new ArgumentException("Comment content is required");
        }

        var comment = new TaskComment
        {
            TaskId = taskId,
            UserId = userId,
            Content = content
        };

        _context.TaskComments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);
        return new TaskCommentDto
        {
            Id = comment.Id,
            TaskId = comment.TaskId,
            UserId = comment.UserId,
            UserName = user?.FullName ?? "Unknown User",
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }

    public async System.Threading.Tasks.Task<List<TaskCommentDto>> GetCommentsAsync(int taskId)
    {
        var comments = await _context.TaskComments
            .Include(tc => tc.User)
            .Where(tc => tc.TaskId == taskId)
            .OrderBy(tc => tc.CreatedAt)
            .ToListAsync();

        return comments.Select(c => new TaskCommentDto
        {
            Id = c.Id,
            TaskId = c.TaskId,
            UserId = c.UserId,
            UserName = c.User.FullName,
            Content = c.Content,
            CreatedAt = c.CreatedAt
        }).ToList();
    }

    private static TaskDto MapToTaskDto(TaskModel task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            DueDate = task.DueDate,
            ProjectTag = task.ProjectTag,
            CreatedBy = task.CreatedBy,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            DeadlineColor = task.DeadlineColor,
            IsOverdue = task.IsOverdue,
            Assignees = task.Assignees.Select(ta => new UserDto
            {
                Id = ta.User.Id,
                Email = ta.User.Email,
                FirstName = ta.User.FirstName,
                LastName = ta.User.LastName,
                FullName = ta.User.FullName,
                Role = ta.User.Role,
                ParentOrgId = ta.User.ParentOrgId,
                IsVerified = ta.User.IsVerified,
                CreatedAt = ta.User.CreatedAt,
                UpdatedAt = ta.User.UpdatedAt
            }).ToList(),
            Attachments = task.Attachments.Select(ta => new TaskAttachmentDto
            {
                Id = ta.Id,
                Filename = ta.Filename,
                OriginalName = ta.OriginalName,
                FileSize = ta.FileSize,
                Url = ta.Url,
                UploadedAt = ta.UploadedAt
            }).ToList(),
            Comments = task.Comments.Select(tc => new TaskCommentDto
            {
                Id = tc.Id,
                TaskId = tc.TaskId,
                UserId = tc.UserId,
                UserName = tc.User.FullName,
                Content = tc.Content,
                CreatedAt = tc.CreatedAt
            }).ToList()
        };
    }
}

public class TaskFilters
{
    public string? Status { get; set; }
    public string? ProjectTag { get; set; }
    public int? AssigneeId { get; set; }
}

