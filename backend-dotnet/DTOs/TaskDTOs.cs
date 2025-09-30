using System.ComponentModel.DataAnnotations;

namespace TaskMan.Api.DTOs;

public class CreateTaskRequest
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }

    [MaxLength(100)]
    public string? ProjectTag { get; set; }

    public List<int>? AssigneeIds { get; set; }
}

public class UpdateTaskStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}

public class AddAssigneesRequest
{
    [Required]
    public List<int> AssigneeIds { get; set; } = new();
}

public class AddCommentRequest
{
    [Required]
    public string Content { get; set; } = string.Empty;
}

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string? ProjectTag { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string DeadlineColor { get; set; } = string.Empty;
    public bool IsOverdue { get; set; }
    public List<UserDto> Assignees { get; set; } = new();
    public List<TaskAttachmentDto> Attachments { get; set; } = new();
    public List<TaskCommentDto> Comments { get; set; } = new();
}

public class TaskAttachmentDto
{
    public int Id { get; set; }
    public string Filename { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string Url { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}

public class TaskCommentDto
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

