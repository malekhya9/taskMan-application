using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskMan.Api.Models;

public class TaskAttachment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int TaskId { get; set; }

    [ForeignKey("TaskId")]
    public Task Task { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string Filename { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string OriginalName { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public string Url => $"/uploads/{Filename}";
}

