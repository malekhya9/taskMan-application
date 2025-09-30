# TaskMan Frontend

Angular frontend application for the TaskMan task management system, featuring modern UI/UX with role-based access control, real-time updates, and responsive design.

## 🚀 Features

- **Modern Angular Architecture**: Built with Angular 17+ using standalone components
- **JWT Authentication**: Secure token-based authentication with automatic token refresh
- **Role-Based Access Control**: Different interfaces for Leads and Members
- **Task Management**: Create, update, and manage tasks with status transitions
- **File Attachments**: Upload and download task attachments
- **Comments System**: Real-time comments on tasks
- **CSV Export**: Export tasks to CSV format
- **Responsive Design**: Mobile-friendly interface with modern SCSS styling
- **Real-time Updates**: Live task status updates and notifications

## 🏗️ Architecture

### Technology Stack
- **Angular 17+**: Latest Angular framework with standalone components
- **TypeScript**: Type-safe JavaScript development
- **SCSS**: Modern CSS preprocessing with variables and mixins
- **RxJS**: Reactive programming for state management
- **Angular Material**: Material Design components (optional)

### Project Structure
```
src/
├── app/
│   ├── components/          # UI components
│   │   ├── dashboard/      # Main dashboard
│   │   ├── login/          # Login component
│   │   ├── register/       # Registration component
│   │   ├── task-list/      # Task listing
│   │   ├── task-detail/    # Task details
│   │   └── invite/         # User invitation
│   ├── guards/             # Route guards
│   │   └── auth.guard.ts   # Authentication guard
│   ├── interceptors/       # HTTP interceptors
│   │   └── auth.interceptor.ts  # JWT token interceptor
│   ├── models/             # TypeScript interfaces
│   │   ├── task.model.ts   # Task data model
│   │   └── user.model.ts   # User data model
│   ├── services/           # Business logic services
│   │   ├── auth.service.ts     # Authentication service
│   │   ├── task.service.ts     # Task management service
│   │   ├── user.service.ts      # User management service
│   │   └── invite.service.ts   # Invitation service
│   ├── app.config.ts       # Application configuration
│   ├── app.routes.ts        # Routing configuration
│   └── app.ts              # Main application component
├── index.html              # Main HTML template
├── main.ts                 # Application entry point
└── styles.scss             # Global styles
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Angular CLI**: `npm install -g @angular/cli`

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend/taskman-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   ng serve
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:4200`

## 🔧 Configuration

### API Configuration

The frontend is configured to connect to the .NET backend API. Update the API base URL in services if needed:

```typescript
// In service files
private apiUrl = 'https://localhost:7000/api';
```

### Environment Configuration

Create environment files for different configurations:

**src/environments/environment.ts** (development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7000/api'
};
```

**src/environments/environment.prod.ts** (production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

## 🎨 UI Components

### Dashboard
- **Task Overview**: Summary of tasks by status
- **Quick Actions**: Create tasks, invite users
- **Recent Activity**: Latest task updates and comments

### Task Management
- **Task List**: Filterable and sortable task list
- **Task Detail**: Detailed task view with attachments and comments
- **Status Updates**: Drag-and-drop status transitions
- **File Attachments**: Upload and download files

### User Management
- **User Registration**: Self-registration for leads
- **User Invitation**: Invite members to organization
- **Role Management**: Lead/Member role assignments

## 🔐 Authentication Flow

### Login Process
1. User enters email and password
2. Frontend sends credentials to `/api/auth/login`
3. Backend returns JWT token and user data
4. Token stored in localStorage
5. Token included in all subsequent API requests

### Route Protection
- **Auth Guard**: Protects routes requiring authentication
- **Role Guard**: Restricts access based on user role
- **Token Refresh**: Automatic token refresh before expiration

### Logout Process
1. Clear localStorage token
2. Redirect to login page
3. Notify backend of logout (optional)

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- **Touch-friendly**: Large touch targets
- **Swipe gestures**: Task status updates
- **Offline support**: Basic offline functionality
- **Progressive Web App**: PWA capabilities

## 🛠️ Development

### Development Server
```bash
# Start with hot reload
ng serve

# Start on specific port
ng serve --port 4201

# Start with specific host
ng serve --host 0.0.0.0
```

### Building
```bash
# Development build
ng build

# Production build
ng build --configuration production

# Build with specific environment
ng build --configuration production --environment=prod
```

### Testing
```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Test coverage
ng test --code-coverage
```

### Linting
```bash
# Run linting
ng lint

# Fix linting issues
ng lint --fix
```

## 📦 Key Dependencies

### Core Dependencies
- **@angular/core**: Angular framework
- **@angular/common**: Common Angular utilities
- **@angular/router**: Routing functionality
- **@angular/forms**: Form handling
- **@angular/http**: HTTP client

### Development Dependencies
- **@angular/cli**: Angular CLI tools
- **@angular-devkit/build-angular**: Build tools
- **typescript**: TypeScript compiler
- **karma**: Test runner
- **jasmine**: Testing framework

## 🔄 State Management

### Service-Based State
- **AuthService**: User authentication state
- **TaskService**: Task data and operations
- **UserService**: User management
- **InviteService**: Invitation handling

### Reactive Programming
- **RxJS Observables**: Data streams and subscriptions
- **BehaviorSubject**: Shared state between components
- **Async Pipe**: Automatic subscription management

## 🎯 Best Practices

### Code Organization
- **Feature modules**: Organize by feature
- **Shared modules**: Reusable components
- **Lazy loading**: Load modules on demand
- **Tree shaking**: Remove unused code

### Performance
- **OnPush strategy**: Optimize change detection
- **TrackBy functions**: Optimize list rendering
- **Lazy loading**: Reduce initial bundle size
- **AOT compilation**: Ahead-of-time compilation

### Security
- **Input validation**: Validate all user inputs
- **XSS protection**: Sanitize user content
- **CSRF protection**: Cross-site request forgery
- **Content Security Policy**: Restrict resource loading

## 🚀 Deployment

### Build for Production
```bash
ng build --configuration production
```

### Static Hosting
Deploy the `dist/` folder to:
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **AWS S3**: Static website hosting
- **Azure Static Web Apps**: Integrated deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/taskman-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 Testing Strategy

### Unit Testing
- **Component testing**: Test component logic
- **Service testing**: Test business logic
- **Pipe testing**: Test data transformations
- **Guard testing**: Test route protection

### Integration Testing
- **API integration**: Test API calls
- **Authentication flow**: Test login/logout
- **Data persistence**: Test data storage

### E2E Testing
- **User workflows**: Complete user journeys
- **Cross-browser testing**: Test on different browsers
- **Mobile testing**: Test responsive design

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. API Connection Issues
- Check API base URL configuration
- Verify CORS settings
- Check network connectivity
- Review browser console for errors

#### 3. Authentication Issues
- Verify JWT token format
- Check token expiration
- Clear localStorage and re-login
- Review auth interceptor configuration

#### 4. Styling Issues
- Check SCSS compilation
- Verify CSS imports
- Check for conflicting styles
- Review responsive breakpoints

### Debugging Tools
- **Angular DevTools**: Browser extension
- **Chrome DevTools**: Network and console
- **Angular CLI**: Detailed error messages
- **Source maps**: Debug TypeScript code

## 📚 Resources

### Documentation
- [Angular Documentation](https://angular.io/docs)
- [Angular CLI Guide](https://angular.io/cli)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Learning Resources
- [Angular University](https://angular-university.io/)
- [Angular.io Tutorial](https://angular.io/tutorial)
- [RxJS Marbles](https://rxmarbles.com/)
- [Angular Material](https://material.angular.io/)

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
1. Check the browser console for errors
2. Review the API documentation
3. Test API endpoints directly
4. Check network connectivity
5. Verify configuration settings

The TaskMan frontend provides a modern, responsive interface for task management with enterprise-grade features and security.