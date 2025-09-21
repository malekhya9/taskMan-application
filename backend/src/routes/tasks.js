const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const { authenticateToken, requireVerified } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: parseInt(process.env.MAX_FILES_PER_TASK) || 3
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for MVP
    cb(null, true);
  }
});

// Get all tasks for user's organization
router.get('/', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { status, projectTag, assigneeId } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (projectTag) filters.projectTag = projectTag;
    if (assigneeId) filters.assigneeId = assigneeId;

    const tasks = await Task.findByOrg(req.user.parentOrgId, filters);
    
    // Get assignees and attachments for each task
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await Task.getAssignees(task.id);
        const attachments = await Task.getAttachments(task.id);
        const comments = await Task.getComments(task.id);
        
        return {
          ...task.toJSON(),
          assignees,
          attachments,
          comments
        };
      })
    );

    res.json({ tasks: tasksWithDetails });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', authenticateToken, requireVerified, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const assignees = await Task.getAssignees(task.id);
    const attachments = await Task.getAttachments(task.id);
    const comments = await Task.getComments(task.id);

    res.json({
      ...task.toJSON(),
      assignees,
      attachments,
      comments
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
});

// Create task (Lead only)
router.post('/', authenticateToken, requireVerified, async (req, res) => {
  try {
    if (req.user.role !== 'lead') {
      return res.status(403).json({ message: 'Only leads can create tasks' });
    }

    const { title, description, dueDate, projectTag, assigneeIds } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const taskId = await Task.create({
      title,
      description,
      dueDate,
      projectTag,
      createdBy: req.user.id
    });

    // Add assignees if provided
    if (assigneeIds && Array.isArray(assigneeIds)) {
      for (const assigneeId of assigneeIds) {
        await Task.addAssignee(taskId, assigneeId);
      }
    }

    const task = await Task.findById(taskId);
    res.status(201).json({ message: 'Task created successfully', task: task.toJSON() });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task status
router.patch('/:id/status', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    await Task.updateStatus(taskId, status, req.user.id, req.user.role);
    
    const task = await Task.findById(taskId);
    res.json({ message: 'Task status updated', task: task.toJSON() });
  } catch (error) {
    console.error('Update status error:', error);
    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update task status' });
  }
});

// Add assignees to task (Lead only)
router.post('/:id/assignees', authenticateToken, requireVerified, async (req, res) => {
  try {
    if (req.user.role !== 'lead') {
      return res.status(403).json({ message: 'Only leads can assign tasks' });
    }

    const { assigneeIds } = req.body;
    const taskId = req.params.id;

    if (!assigneeIds || !Array.isArray(assigneeIds)) {
      return res.status(400).json({ message: 'Assignee IDs array is required' });
    }

    for (const assigneeId of assigneeIds) {
      await Task.addAssignee(taskId, assigneeId);
    }

    const assignees = await Task.getAssignees(taskId);
    res.json({ message: 'Assignees added successfully', assignees });
  } catch (error) {
    console.error('Add assignees error:', error);
    res.status(500).json({ message: 'Failed to add assignees' });
  }
});

// Remove assignee from task (Lead only)
router.delete('/:id/assignees/:assigneeId', authenticateToken, requireVerified, async (req, res) => {
  try {
    if (req.user.role !== 'lead') {
      return res.status(403).json({ message: 'Only leads can remove assignees' });
    }

    const { id: taskId, assigneeId } = req.params;
    await Task.removeAssignee(taskId, assigneeId);

    res.json({ message: 'Assignee removed successfully' });
  } catch (error) {
    console.error('Remove assignee error:', error);
    res.status(500).json({ message: 'Failed to remove assignee' });
  }
});

// Upload attachments
router.post('/:id/attachments', authenticateToken, requireVerified, upload.array('files'), async (req, res) => {
  try {
    const taskId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const attachments = [];
    for (const file of files) {
      const attachmentId = await Task.addAttachment(
        taskId,
        file.filename,
        file.originalname,
        file.size
      );
      attachments.push({
        id: attachmentId,
        filename: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        url: `/uploads/${file.filename}`
      });
    }

    res.json({ message: 'Files uploaded successfully', attachments });
  } catch (error) {
    console.error('Upload attachments error:', error);
    res.status(500).json({ message: 'Failed to upload files' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { content } = req.body;
    const taskId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const commentId = await Task.addComment(taskId, req.user.id, content);
    const comments = await Task.getComments(taskId);

    res.json({ message: 'Comment added successfully', comments });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Soft delete task (Lead only)
router.delete('/:id', authenticateToken, requireVerified, async (req, res) => {
  try {
    if (req.user.role !== 'lead') {
      return res.status(403).json({ message: 'Only leads can delete tasks' });
    }

    await Task.softDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

module.exports = router;
