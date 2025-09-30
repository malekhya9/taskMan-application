using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskMan.Api.Models;

public class TaskAssignee
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int TaskId { get; set; }

    [ForeignKey("TaskId")]
    public Task Task { get; set; } = null!;

    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}

