# Vue Frontend Integration with Go Backend

## Overview
This Vue.js frontend is fully integrated with the Go backend API for a complete todo application with authentication and task management.

## Features Implemented

### Authentication
- ✅ JWT-based login with mock users
- ✅ Protected routes with automatic redirect
- ✅ Token storage and management
- ✅ Automatic logout on token expiration

### Task Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Task filtering by status
- ✅ Task search functionality
- ✅ Responsive task cards with status indicators
- ✅ Modal-based task creation and editing

### UI/UX
- ✅ Clean, modern light theme
- ✅ Responsive design with TailwindCSS
- ✅ Loading states and error handling
- ✅ Form validation
- ✅ Intuitive navigation

## Architecture

### Frontend Stack
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **Vue Router** for navigation
- **Axios** for API communication
- **TailwindCSS** for styling

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseSelect.vue
│   ├── TaskCard.vue
│   ├── TaskModal.vue
│   └── LoadingSpinner.vue
├── views/              # Page components
│   ├── LoginView.vue
│   └── DashboardView.vue
├── stores/             # Pinia stores
│   ├── auth.ts
│   └── tasks.ts
├── services/           # API services
│   └── api.ts
├── router/             # Vue Router configuration
│   └── index.ts
├── types/              # TypeScript interfaces
│   └── api.ts
└── utils/              # Utility functions
```

## API Integration

### Backend Endpoints Used
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/tasks` - List tasks with filtering/pagination
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/:id` - Get specific task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Mock Users
- john.doe@example.com (password: password123)
- jane.smith@example.com (password: password123)
- mike.wilson@example.com (password: password123)

## Running the Application

### Prerequisites
- Node.js/Bun
- Go 1.23+

### Backend (Port 3000)
```bash
cd todo-api
go run cmd/main.go
```

### Frontend (Port 5173)
```bash
cd todo-vue
bun install
bun run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## Key Features

### State Management
- **Auth Store**: Handles user authentication, tokens, and user state
- **Tasks Store**: Manages task CRUD operations, filtering, and pagination

### Security
- JWT token-based authentication
- Automatic token refresh handling
- Protected routes with navigation guards
- Secure token storage in localStorage

### User Experience
- Responsive design works on all devices
- Real-time form validation
- Loading states for all async operations
- Error handling with user-friendly messages
- Intuitive task management interface

## Development Notes

### TypeScript Configuration
- Path aliases configured (`@/` maps to `src/`)
- Strict type checking enabled
- Vue 3 Composition API support

### Styling
- TailwindCSS for utility-first styling
- Custom light theme without purple colors
- Responsive breakpoints
- Consistent component styling

### Error Handling
- Centralized error handling in stores
- User-friendly error messages
- Automatic retry mechanisms where appropriate
- Network error handling

## Testing the Integration

1. Start both servers (backend and frontend)
2. Navigate to http://localhost:5173
3. Login with any mock user credentials
4. Create, edit, and delete tasks
5. Test filtering and search functionality
6. Verify responsive design on different screen sizes

The integration is complete and ready for use!
