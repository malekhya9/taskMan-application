# TaskMan Backend

A Node.js/Express backend API for the TaskMan task management application.

## Features

- User authentication with JWT tokens
- Email verification with 6-digit OTP
- Role-based access control (Lead/Member)
- Task management with status transitions
- File attachments support
- CSV export functionality
- Organization hierarchy support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=taskman

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (using Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# File upload
MAX_FILE_SIZE=10485760
MAX_FILES_PER_TASK=3
```

3. Set up MySQL database:
```bash
mysql -u root -p < database/schema.sql
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new lead
- `POST /api/auth/verify` - Verify email with OTP
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/resend-otp` - Resend verification OTP

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (Lead only)
- `PATCH /api/tasks/:id/status` - Update task status
- `POST /api/tasks/:id/assignees` - Add assignees (Lead only)
- `DELETE /api/tasks/:id/assignees/:assigneeId` - Remove assignee (Lead only)
- `POST /api/tasks/:id/attachments` - Upload attachments
- `POST /api/tasks/:id/comments` - Add comment
- `DELETE /api/tasks/:id` - Soft delete task (Lead only)

### Users
- `GET /api/users` - Get all users in organization
- `GET /api/users/leads` - Get leads in organization
- `GET /api/users/members` - Get members in organization
- `POST /api/users/leads` - Create new lead (Lead only)
- `POST /api/users/members` - Create member account (Lead only)
- `PATCH /api/users/profile` - Update profile
- `PATCH /api/users/password` - Change password

### Invites
- `POST /api/invites/send` - Send invitation (Lead only)
- `POST /api/invites/accept` - Accept invitation
- `GET /api/invites/status/:email` - Get invitation status

### Export
- `GET /api/export/tasks` - Export tasks to CSV (Lead only)
- `GET /api/export/users` - Export users to CSV (Lead only)

## Task Status Transitions

### Lead Role
- Can move between any states
- Only leads can move `review → completed`

### Member Role
- Can only move `defined → in-progress`
- Can only move `in-progress → review`

## Deadline Colors

- **Green**: Due date > 48 hours away
- **Yellow**: Due date within 48 hours
- **Red**: Past due date
