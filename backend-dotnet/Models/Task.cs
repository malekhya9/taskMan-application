using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskMan.Api.Models;

public class Task
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "backlogged"; // 'backlogged', 'defined', 'in-progress', 'review', 'completed'

    public DateTime? DueDate { get; set; }

    [MaxLength(100)]
    public string? ProjectTag { get; set; }

    [Required]
    public int CreatedBy { get; set; }

    [ForeignKey("CreatedBy")]
    public User Creator { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ArchivedAt { get; set; }

    // Navigation properties
    public ICollection<TaskAssignee> Assignees { get; set; } = new List<TaskAssignee>();
    public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();

    // Computed properties
    [NotMapped]
    public string DeadlineColor
    {
        get
        {
            if (!DueDate.HasValue) return "gray";

            var now = DateTime.UtcNow;
            var due = DueDate.Value;
            var diffHours = (due - now).TotalHours;

            if (diffHours < 0) return "red"; // Past due
            if (diffHours <= 48) return "yellow"; // Within 48 hours
            return "green"; // More than 48 hours
        }
    }

    [NotMapped]
    public bool IsArchived => ArchivedAt.HasValue;

    [NotMapped]
    public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && Status != "completed";
}

