# TaskMan - Task Management Web Application

A comprehensive task management web application built with Angular frontend and Node.js/Express backend, designed according to the provided PRD specifications.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with email verification
- **Role-Based Access Control**: Lead and Member roles with different permissions
- **Task Management**: Complete task lifecycle from backlogged to completed
- **Status Transitions**: Enforced business rules for task status changes
- **Deadline Highlighting**: Color-coded deadlines (green/yellow/red)
- **File Attachments**: Support for task attachments (up to 10MB, 3 files per task)
- **Comments System**: Task commenting functionality
- **CSV Export**: Export tasks and users data (Lead only)
- **Organization Hierarchy**: Multi-level organization support

### Task Lifecycle
- **States**: `backlogged` → `defined` → `in-progress` → `review` → `completed`
- **Lead Permissions**: Can move between any states, only leads can complete tasks
- **Member Permissions**: Can only move `defined` → `in-progress` and `in-progress` → `review`
- **Soft Delete**: Completed tasks are archived, not permanently deleted

### User Roles
- **Lead/Admin**: 
  - Create and assign tasks
  - Invite members
  - Create other leads
  - Export data
  - Full task management permissions
- **Member**: 
  - Limited task status changes
  - Add comments
  - View assigned tasks

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with TypeScript support
- **Database**: MySQL with comprehensive schema
- **Authentication**: JWT tokens with email verification
- **File Upload**: Multer for handling attachments
- **Email Service**: Nodemailer for OTP and invitations
- **Security**: Helmet, CORS, rate limiting
- **Export**: CSV generation with fast-csv

### Frontend (Angular)
- **Framework**: Angular 18+ with standalone components
- **Styling**: Custom SCSS with responsive design
- **State Management**: Services with RxJS observables
- **Routing**: Angular Router with guards
- **HTTP Client**: Interceptors for authentication
- **UI Components**: Custom components with Material Design principles

## 📁 Project Structure

```
taskMan/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & validation
│   │   ├── utils/          # Email service
│   │   ├── config/         # Database config
│   │   └── app.js          # Main server file
│   ├── database/
│   │   └── schema.sql      # Database schema
│   ├── uploads/            # File upload directory
│   └── package.json
├── frontend/
│   └── taskman-frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/  # Angular components
│       │   │   ├── services/     # API services
│       │   │   ├── models/      # TypeScript interfaces
│       │   │   ├── guards/      # Route guards
│       │   │   └── interceptors/ # HTTP interceptors
│       │   └── styles.scss      # Global styles
│       └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:4200
   
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=taskman
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Email (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   
   # File upload
   MAX_FILE_SIZE=10485760
   MAX_FILES_PER_TASK=3
   ```

4. **Set up MySQL database**:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend/taskman-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   ng serve
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:4200`

## 🔧 Configuration

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in your `.env` file

### Database Configuration
The application uses MySQL with the following key tables:
- `users`: User accounts and roles
- `tasks`: Task information and status
- `task_assignees`: Many-to-many relationship for task assignments
- `task_attachments`: File attachments
- `task_comments`: Task comments

## 📱 Usage

### Getting Started
1. **Register as Lead**: Create a new account with email verification
2. **Verify Email**: Check your email for 6-digit OTP code
3. **Login**: Access the dashboard after verification
4. **Create Tasks**: Add tasks with descriptions, due dates, and assignees
5. **Invite Members**: Send invitations to team members
6. **Manage Tasks**: Update status, add comments, upload files

### Task Management
- **Create Task**: Leads can create tasks with title, description, due date, project tag
- **Assign Tasks**: Add multiple assignees to tasks
- **Status Updates**: Follow the defined workflow for status changes
- **File Attachments**: Upload relevant files (max 10MB, 3 files per task)
- **Comments**: Add context and updates to tasks

### Export Features
- **CSV Export**: Leads can export tasks and users data
- **Filtered Export**: Export specific subsets based on filters
- **Scheduled Reports**: Use export for regular reporting

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: 6-digit OTP for account verification
- **Role-Based Access**: Strict permission controls
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size restrictions
- **CORS Protection**: Configured for specific origins

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Update all production values
2. **Database**: Use production MySQL instance
3. **File Storage**: Consider cloud storage for uploads
4. **Email Service**: Use production email service (SendGrid, etc.)
5. **SSL**: Enable HTTPS for production
6. **Monitoring**: Add logging and monitoring

### Docker Deployment (Optional)
```bash
# Build backend
cd backend
docker build -t taskman-backend .

# Build frontend
cd frontend/taskman-frontend
docker build -t taskman-frontend .

# Run with docker-compose
docker-compose up -d
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend/taskman-frontend
ng test
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new lead
- `POST /api/auth/verify` - Verify email with OTP
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Task Endpoints
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create task (Lead only)
- `PATCH /api/tasks/:id/status` - Update task status
- `POST /api/tasks/:id/assignees` - Add assignees
- `POST /api/tasks/:id/attachments` - Upload files
- `POST /api/tasks/:id/comments` - Add comment

### User Management
- `GET /api/users` - Get organization users
- `POST /api/users/leads` - Create lead (Lead only)
- `POST /api/users/members` - Create member (Lead only)

### Export
- `GET /api/export/tasks` - Export tasks to CSV
- `GET /api/export/users` - Export users to CSV

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Check the console for error messages
- Ensure all environment variables are set correctly

## 🔄 Future Enhancements

- Real-time notifications
- Kanban board view
- Advanced reporting
- Mobile app
- Integration with external tools
- Advanced file management
- Task templates
- Time tracking
