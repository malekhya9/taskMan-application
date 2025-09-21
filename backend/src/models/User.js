const db = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.role = data.role; // 'lead' or 'member'
    this.parentOrgId = data.parent_org_id;
    this.isVerified = data.is_verified;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(userData) {
    const { email, password, firstName, lastName, role, parentOrgId } = userData;
    const query = `
      INSERT INTO users (email, password, first_name, last_name, role, parent_org_id, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [email, password, firstName, lastName, role, parentOrgId, false]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async updateVerificationStatus(id, isVerified) {
    const query = 'UPDATE users SET is_verified = ? WHERE id = ?';
    await db.execute(query, [isVerified, id]);
  }

  static async getUsersByOrg(parentOrgId) {
    const query = 'SELECT * FROM users WHERE parent_org_id = ? OR id = ?';
    const [rows] = await db.execute(query, [parentOrgId, parentOrgId]);
    return rows.map(row => new User(row));
  }

  static async getLeadsByOrg(parentOrgId) {
    const query = 'SELECT * FROM users WHERE parent_org_id = ? AND role = "lead"';
    const [rows] = await db.execute(query, [parentOrgId]);
    return rows.map(row => new User(row));
  }

  static async getMembersByOrg(parentOrgId) {
    const query = 'SELECT * FROM users WHERE parent_org_id = ? AND role = "member"';
    const [rows] = await db.execute(query, [parentOrgId]);
    return rows.map(row => new User(row));
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      parentOrgId: this.parentOrgId,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
