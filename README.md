# TaskMan Application

A comprehensive task management application built with Angular frontend and .NET backend, featuring role-based access control, file attachments, comments, and CSV export functionality.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control (Lead/Member)
- **Task Management**: Full CRUD operations with status transitions and deadline tracking
- **File Attachments**: Upload and manage task attachments with file size limits
- **Comments System**: Add comments to tasks with user attribution
- **CSV Export**: Export tasks to CSV format for reporting
- **Organization Hierarchy**: Support for organizational structure with leads and members
- **Real-time Updates**: Live task status updates and notifications
- **Responsive Design**: Mobile-friendly interface with modern UI/UX

## 🏗️ Architecture

### Frontend (Angular)
- **Framework**: Angular 17+ with standalone components
- **Styling**: SCSS with modern CSS features
- **State Management**: Services with RxJS observables
- **Authentication**: JWT token-based authentication
- **HTTP Client**: Angular HttpClient with interceptors

### Backend (.NET)
- **Framework**: .NET 8 Web API
- **Database**: Entity Framework Core with SQLite (dev) / SQL Server (prod)
- **Authentication**: JWT Bearer authentication
- **Security**: Rate limiting, CORS, input validation
- **Documentation**: Swagger/OpenAPI integration

## 📁 Project Structure

```
taskMan-application/
├── frontend/                 # Angular frontend application
│   └── taskman-frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/    # UI components
│       │   │   ├── guards/        # Route guards
│       │   │   ├── interceptors/  # HTTP interceptors
│       │   │   ├── models/        # TypeScript models
│       │   │   └── services/     # Business logic services
│       │   └── main.ts
│       ├── package.json
│       └── angular.json
├── backend-dotnet/           # .NET Web API backend
│   ├── Controllers/          # API controllers
│   ├── Data/                 # Entity Framework DbContext
│   ├── Models/               # Entity models
│   ├── Services/             # Business logic services
│   ├── DTOs/                 # Data transfer objects
│   ├── Middleware/           # Custom middleware
│   ├── Program.cs            # Application entry point
│   └── TaskMan.Api.csproj    # Project file
├── README.md                 # This file
└── SETUP_GUIDE.md           # Detailed setup instructions
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **.NET 8 SDK**
- **Visual Studio Code** or **Visual Studio 2022**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskMan-application
```

### 2. Backend Setup

```bash
cd backend-dotnet
dotnet restore
dotnet run
```

The API will be available at:
- **HTTPS**: `https://localhost:7000`
- **HTTP**: `http://localhost:5000`
- **Swagger UI**: `https://localhost:7000/swagger`

### 3. Frontend Setup

```bash
cd frontend/taskman-frontend
npm install
ng serve
```

The frontend will be available at `http://localhost:4200`

### 4. Access the Application

- **Frontend**: http://localhost:4200
- **API Documentation**: https://localhost:7000/swagger
- **Health Check**: https://localhost:7000/api/health

## 🔧 Configuration

### Backend Configuration

Update `backend-dotnet/appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=demo.db"
  },
  "FrontendUrl": "http://localhost:4200"
}
```

### Frontend Configuration

Update API base URL in `frontend/taskman-frontend/src/app/services/` if needed.

## 📊 Task Management Features

### Task Status Workflow
1. **Backlogged** → **Defined** (Lead only)
2. **Defined** → **In Progress** (Member/Lead)
3. **In Progress** → **Review** (Member/Lead)
4. **Review** → **Completed** (Lead only)

### Role-Based Permissions
- **Leads**: Can create, assign, complete, and delete tasks
- **Members**: Can update task status (defined → in-progress → review)

### File Attachments
- Upload multiple files per task
- File size limits and type validation
- Secure file storage and retrieval

### Comments System
- Add comments to tasks
- User attribution and timestamps
- Real-time comment updates

## 🔐 Authentication

### User Registration
- Email and password required
- Role assignment (Lead/Member)
- Auto-verification for demo purposes

### Login Process
1. Submit email and password
2. Receive JWT token
3. Token stored in browser localStorage
4. Token included in API requests

## 📈 Export Features

### CSV Export
- Export tasks with filters
- Include assignees, comments, and attachments count
- Formatted for Excel compatibility

## 🛠️ Development

### Backend Development
```bash
cd backend-dotnet
dotnet watch run  # Hot reload enabled
```

### Frontend Development
```bash
cd frontend/taskman-frontend
ng serve --watch  # Hot reload enabled
```

### Database Management
- **Development**: SQLite database (auto-created)
- **Production**: SQL Server database
- **Migrations**: Entity Framework migrations

## 🚀 Deployment

### Backend Deployment
```bash
cd backend-dotnet
dotnet publish -c Release
# Deploy the publish folder to your hosting platform
```

### Frontend Deployment
```bash
cd frontend/taskman-frontend
ng build --configuration production
# Deploy the dist folder to your hosting platform
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Task Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (Lead only)
- `PATCH /api/tasks/{id}/status` - Update task status
- `POST /api/tasks/{id}/attachments` - Upload attachments
- `POST /api/tasks/{id}/comments` - Add comment

### User Endpoints
- `GET /api/users` - Get organization users
- `GET /api/users/leads` - Get leads
- `GET /api/users/members` - Get members

### Export Endpoints
- `GET /api/export/tasks/csv` - Export tasks to CSV

## 🧪 Testing

### Backend Testing
```bash
cd backend-dotnet
dotnet test
```

### Frontend Testing
```bash
cd frontend/taskman-frontend
ng test
```

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Backend Documentation](backend-dotnet/README.md) - Backend-specific documentation
- [Frontend Documentation](frontend/taskman-frontend/README.md) - Frontend-specific documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [Setup Guide](SETUP_GUIDE.md) for common issues
2. Review the API documentation at `/swagger`
3. Check the logs for error details
4. Verify configuration settings

## 🔄 Recent Updates

- **Migrated from Node.js to .NET 8** for better performance and enterprise readiness
- **Enhanced security** with built-in ASP.NET Core features
- **Improved error handling** with global exception middleware
- **Better documentation** with Swagger/OpenAPI integration
- **Structured logging** with Serilog
- **Rate limiting** for API protection