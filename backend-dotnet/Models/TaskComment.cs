using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskMan.Api.Models;

public class TaskComment
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

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

