# TaskMan .NET Backend

A .NET 8 Web API backend for the TaskMan task management application.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Task Management**: Full CRUD operations with status transitions and role-based permissions
- **File Attachments**: Upload and manage task attachments
- **Comments System**: Add comments to tasks
- **CSV Export**: Export tasks to CSV format
- **Organization Hierarchy**: Support for organizational structure with leads and members
- **Rate Limiting**: Built-in rate limiting for API protection
- **Database Support**: SQLite for development, SQL Server for production
- **Swagger Documentation**: Auto-generated API documentation

## Technology Stack

- **.NET 8**: Latest LTS version
- **Entity Framework Core**: ORM for database operations
- **JWT Authentication**: Secure token-based authentication
- **BCrypt**: Password hashing
- **MailKit**: Email functionality
- **CsvHelper**: CSV export functionality
- **Serilog**: Structured logging
- **Swagger/OpenAPI**: API documentation

## Project Structure

```
backend-dotnet/
├── Controllers/          # API controllers
├── Data/                 # Database context and configuration
├── Database/             # Database schema files
├── DTOs/                 # Data transfer objects
├── Middleware/           # Custom middleware
├── Models/               # Entity models
├── Services/             # Business logic services
├── Program.cs            # Application entry point
├── appsettings.json      # Configuration
└── TaskMan.Api.csproj    # Project file
```

## Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server (for production) or SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-dotnet
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Configure the database**
   - For development: SQLite database will be created automatically
   - For production: Update connection string in `appsettings.json`

4. **Update configuration**
   - Update `appsettings.json` with your settings:
     - JWT secret key
     - Email settings (if using email features)
     - Database connection strings

5. **Run the application**
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:7000` (HTTPS) or `http://localhost:5000` (HTTP).

### API Documentation

Once the application is running, visit:
- Swagger UI: `https://localhost:7000/swagger`
- Health check: `https://localhost:7000/api/health`
- Demo info: `https://localhost:7000/api/demo`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Tasks
- `GET /api/tasks` - Get all tasks for organization
- `GET /api/tasks/{id}` - Get specific task
- `POST /api/tasks` - Create new task (Lead only)
- `PATCH /api/tasks/{id}/status` - Update task status
- `POST /api/tasks/{id}/assignees` - Add assignees (Lead only)
- `DELETE /api/tasks/{id}/assignees/{assigneeId}` - Remove assignee (Lead only)
- `POST /api/tasks/{id}/attachments` - Upload attachments
- `POST /api/tasks/{id}/comments` - Add comment
- `DELETE /api/tasks/{id}` - Soft delete task (Lead only)

### Users
- `GET /api/users` - Get all users in organization
- `GET /api/users/leads` - Get all leads in organization
- `GET /api/users/members` - Get all members in organization
- `GET /api/users/{id}` - Get specific user

### Invites
- `POST /api/invites` - Send invite (Lead only)
- `GET /api/invites` - Get invites

### Export
- `GET /api/export/tasks/csv` - Export tasks to CSV

## Configuration

### JWT Settings
```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "TaskMan.Api",
    "Audience": "TaskMan.Client",
    "ExpirationInDays": 7
  }
}
```

### Database Connection
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=demo.db",
    "SqlServerConnection": "Server=localhost;Database=taskman;User Id=sa;Password=YourPassword;TrustServerCertificate=true;"
  }
}
```

### Email Settings
```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "noreply@taskman.com",
    "FromName": "TaskMan"
  }
}
```

## Database Schema

The application uses Entity Framework Core with the following main entities:

- **Users**: User accounts with role-based access
- **Tasks**: Task management with status transitions
- **TaskAssignees**: Many-to-many relationship between tasks and users
- **TaskAttachments**: File attachments for tasks
- **TaskComments**: Comments on tasks
- **Invites**: User invitation system

## Development vs Production

### Development
- Uses SQLite database (auto-created)
- Detailed error messages
- Swagger UI enabled
- Console logging

### Production
- Uses SQL Server database
- Minimal error details
- Swagger UI disabled
- File logging with Serilog

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt for password security
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Model validation and sanitization
- **SQL Injection Protection**: Entity Framework parameterized queries

## Error Handling

The application includes comprehensive error handling:
- Global exception middleware
- Structured error responses
- Development vs production error details
- Logging with Serilog

## Testing

To test the API endpoints:

1. **Register a user**:
   ```bash
   curl -X POST https://localhost:7000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","role":"lead"}'
   ```

2. **Login**:
   ```bash
   curl -X POST https://localhost:7000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Use the JWT token** in subsequent requests:
   ```bash
   curl -X GET https://localhost:7000/api/tasks \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.