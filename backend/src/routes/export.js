const express = require("express");
const csv = require("fast-csv");
const Task = require("../models/Task");
const User = require("../models/User");
const { authenticateToken, requireLead, requireVerified } = require("../middleware/auth");

const router = express.Router();

// Export tasks to CSV (Lead only)
router.get("/tasks", authenticateToken, requireLead, requireVerified, async (req, res) => {
  try {
    const { status, projectTag, assigneeId } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (projectTag) filters.projectTag = projectTag;
    if (assigneeId) filters.assigneeId = assigneeId;

    const tasks = await Task.findByOrg(req.user.parentOrgId, filters);
    
    // Get detailed information for each task
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await Task.getAssignees(task.id);
        const attachments = await Task.getAttachments(task.id);
        const comments = await Task.getComments(task.id);
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
          projectTag: task.projectTag,
          createdBy: task.createdBy,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          assignees: assignees.map(a => `${a.first_name} ${a.last_name} (${a.email})`).join("; "),
          attachments: attachments.map(a => a.original_name).join("; "),
          commentsCount: comments.length,
          deadlineColor: task.getDeadlineColor()
        };
      })
    );

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="tasks-${new Date().toISOString().split("T")[0]}.csv"`);

    // Create CSV
    csv.write(tasksWithDetails, { headers: true })
      .pipe(res);
  } catch (error) {
    console.error("Export tasks error:", error);
    res.status(500).json({ message: "Failed to export tasks" });
  }
});

module.exports = router;
