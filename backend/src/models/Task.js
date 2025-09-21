const db = require('../config/database');

class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status; // 'backlogged', 'defined', 'in-progress', 'review', 'completed'
    this.dueDate = data.due_date;
    this.projectTag = data.project_tag;
    this.createdBy = data.created_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.archivedAt = data.archived_at;
  }

  static async create(taskData) {
    const { title, description, dueDate, projectTag, createdBy } = taskData;
    const query = `
      INSERT INTO tasks (title, description, due_date, project_tag, created_by, status)
      VALUES (?, ?, ?, ?, ?, 'backlogged')
    `;
    const [result] = await db.execute(query, [title, description, dueDate, projectTag, createdBy]);
    return result.insertId;
  }

  static async findById(id) {
    const query = 'SELECT * FROM tasks WHERE id = ? AND archived_at IS NULL';
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? new Task(rows[0]) : null;
  }

  static async findByOrg(parentOrgId, filters = {}) {
    let query = `
      SELECT t.* FROM tasks t
      JOIN users u ON t.created_by = u.id
      WHERE (u.parent_org_id = ? OR u.id = ?) AND t.archived_at IS NULL
    `;
    const params = [parentOrgId, parentOrgId];

    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }

    if (filters.projectTag) {
      query += ' AND t.project_tag = ?';
      params.push(filters.projectTag);
    }

    if (filters.assigneeId) {
      query += ' AND EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?)';
      params.push(filters.assigneeId);
    }

    query += ' ORDER BY t.due_date ASC, t.created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows.map(row => new Task(row));
  }

  static async updateStatus(id, status, userId, userRole) {
    // Validate transition based on user role
    const task = await Task.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const validTransitions = {
      lead: ['backlogged', 'defined', 'in-progress', 'review', 'completed'],
      member: ['defined', 'in-progress', 'review']
    };

    const currentStatusIndex = validTransitions.lead.indexOf(task.status);
    const newStatusIndex = validTransitions.lead.indexOf(status);

    if (userRole === 'member') {
      // Members can only move defined → in-progress and in-progress → review
      if (!(task.status === 'defined' && status === 'in-progress') &&
          !(task.status === 'in-progress' && status === 'review')) {
        throw new Error('Invalid status transition for member');
      }
    } else if (userRole === 'lead') {
      // Leads can move between any states, but only leads can move review → completed
      if (task.status === 'review' && status === 'completed') {
        // Only leads can complete tasks
      } else if (newStatusIndex <= currentStatusIndex) {
        // Allow moving backwards
      } else if (newStatusIndex > currentStatusIndex + 1) {
        // Don't allow skipping states
        throw new Error('Cannot skip status transitions');
      }
    }

    const query = 'UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?';
    await db.execute(query, [status, id]);
    return true;
  }

  static async softDelete(id) {
    const query = 'UPDATE tasks SET archived_at = NOW() WHERE id = ?';
    await db.execute(query, [id]);
  }

  static async addAssignee(taskId, userId) {
    const query = 'INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)';
    await db.execute(query, [taskId, userId]);
  }

  static async removeAssignee(taskId, userId) {
    const query = 'DELETE FROM task_assignees WHERE task_id = ? AND user_id = ?';
    await db.execute(query, [taskId, userId]);
  }

  static async getAssignees(taskId) {
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM task_assignees ta
      JOIN users u ON ta.user_id = u.id
      WHERE ta.task_id = ?
    `;
    const [rows] = await db.execute(query, [taskId]);
    return rows;
  }

  static async addAttachment(taskId, filename, originalName, fileSize) {
    const query = `
      INSERT INTO task_attachments (task_id, filename, original_name, file_size)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [taskId, filename, originalName, fileSize]);
    return result.insertId;
  }

  static async getAttachments(taskId) {
    const query = 'SELECT * FROM task_attachments WHERE task_id = ?';
    const [rows] = await db.execute(query, [taskId]);
    return rows;
  }

  static async addComment(taskId, userId, content) {
    const query = 'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [taskId, userId, content]);
    return result.insertId;
  }

  static async getComments(taskId) {
    const query = `
      SELECT tc.*, u.first_name, u.last_name
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ?
      ORDER BY tc.created_at ASC
    `;
    const [rows] = await db.execute(query, [taskId]);
    return rows;
  }

  getDeadlineColor() {
    if (!this.dueDate) return 'gray';
    
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) return 'red'; // Past due
    if (diffHours <= 48) return 'yellow'; // Within 48 hours
    return 'green'; // More than 48 hours
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      dueDate: this.dueDate,
      projectTag: this.projectTag,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deadlineColor: this.getDeadlineColor()
    };
  }
}

module.exports = Task;
