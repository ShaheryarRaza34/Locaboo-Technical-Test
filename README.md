# Task Manager Backend

A clean architecture task management REST API built with NestJS, demonstrating best practices in backend software design with a **modular architecture**.

## 📋 Table of Contents

- [Overview](#overview)
- [Architectural Decisions](#architectural-decisions)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Testing Strategy](#testing-strategy)
- [Assumptions](#assumptions)
- [Future Improvements](#future-improvements)

## 🎯 Overview

This is a backend service for a task management application that provides RESTful APIs for:

- Creating, reading, updating, and deleting tasks
- Managing users
- Assigning users to tasks
- Filtering tasks by status, priority, and assigned user
- Interactive API documentation via Swagger UI

## 🏗️ Architectural Decisions

### 1. **Modular Architecture**

The application follows NestJS's modular architecture with **two independent feature modules**:

```
src/
├── app.module.ts          # Root module
├── database/              # Database module (Prisma)
│   ├── database.module.ts
│   └── prisma.service.ts
├── tasks/                 # Tasks feature module
│   ├── tasks.module.ts
│   ├── controllers/
│   ├── services/
│   └── dto/
└── users/                 # Users feature module
    ├── users.module.ts
    ├── controllers/
    ├── services/
    └── dto/
```

**Benefits:**

- **Separation of Concerns**: Each module handles its own domain
- **Independent Development**: Teams can work on different modules simultaneously
- **Reusability**: Modules can be imported and reused across the application
- **Testability**: Each module can be tested in isolation
- **Scalability**: Easy to add new feature modules

### 2. **Clean Architecture / Layered Architecture**

Each module follows a clear separation of concerns with distinct layers:

```
┌─────────────────────────────────────┐
│      Controllers (HTTP Layer)       │  ← Handles HTTP requests/responses
├─────────────────────────────────────┤
│      Services (Business Logic)      │  ← Contains business rules
├─────────────────────────────────────┤
│    Repositories (Data Access)       │  ← Manages data persistence
├─────────────────────────────────────┤
│       Entities (Domain Models)      │  ← Core business objects
└─────────────────────────────────────┘
```

**Benefits:**

- **Maintainability**: Each layer has a single responsibility
- **Testability**: Easy to unit test each layer independently
- **Scalability**: Can swap implementations (e.g., change database) without affecting business logic
- **Readability**: Clear code organization makes it easy for new developers to understand

### 3. **Module Dependencies**

```
AppModule
  ├── DatabaseModule                    ← Provides PrismaService globally
  ├── TasksModule
  │     ├── imports: [DatabaseModule, UsersModule]
  │     └── Uses PrismaService for data access
  └── UsersModule
        ├── imports: [DatabaseModule]
        └── Uses PrismaService for data access
```

- **DatabaseModule** exports PrismaService for database operations
- **UsersModule** is standalone and can be reused anywhere
- **TasksModule** imports UsersModule to access user data for task assignments
- Clear dependency direction prevents circular dependencies

### 4. **Dependency Injection**

NestJS's built-in dependency injection container is used throughout:

- Services are injected into controllers
- Repositories are injected into services
- Makes testing easier with mock implementations
- Promotes loose coupling between components

### 5. **Data Transfer Objects (DTOs)**

DTOs with class-validator decorators ensure:

- **Type safety**: Compile-time and runtime type checking
- **Validation**: Automatic request validation at the API boundary
- **Documentation**: DTOs serve as API contracts
- **Security**: Whitelisting prevents unexpected properties

### 6. **Prisma ORM**

Prisma provides type-safe database access:

- **Database**: MySQL with Prisma ORM
- **Type Safety**: Auto-generated TypeScript types from schema
- **Migrations**: Version-controlled database schema changes
- **Benefits**: Type-safe queries, automatic migrations, excellent developer experience

### 7. **Error Handling**

Consistent error handling using NestJS built-in exceptions:

- `NotFoundException`: Resource not found (404)
- `BadRequestException`: Invalid input (400)
- `ConflictException`: Resource already exists (409)
- Global exception filter could be added for custom error formatting

### 8. **RESTful API Design**

Following REST conventions:

- Resource-based URLs (`/tasks`, `/users`)
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Appropriate status codes (201 Created, 204 No Content, etc.)
- Nested routes for relationships (`/tasks/:id/assign`)

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Runtime**: Node.js
- **Database**: MySQL with Prisma ORM
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## 📁 Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── database/                        # Database Module
│   ├── database.module.ts          # Database module definition
│   └── prisma.service.ts            # Prisma service
├── tasks/                           # Tasks Module
│   ├── tasks.module.ts              # Module definition
│   ├── controllers/
│   │   └── tasks.controller.ts      # Task endpoints
│   ├── services/
│   │   ├── tasks.service.ts         # Business logic
│   │   └── tasks.service.spec.ts    # Unit tests
│   └── dto/
│       ├── create-task.dto.ts       # Create validation
│       ├── update-task.dto.ts       # Update validation
│       └── filter-task.dto.ts       # Filter validation
└── users/                           # Users Module
    ├── users.module.ts              # Module definition
    ├── controllers/
    │   └── users.controller.ts      # User endpoints
    ├── services/
    │   ├── users.service.ts         # Business logic
    │   └── users.service.spec.ts    # Unit tests
    └── dto/
        └── create-user.dto.ts       # Create validation
```

**Why this structure?**

- **Module-based organization**: Each feature is self-contained
- **Scalability**: Easy to add new modules (e.g., Projects, Comments)
- **Clear boundaries**: Each module owns its domain
- **Independent**: Modules can be developed, tested, and deployed independently

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL (v8.0 or higher)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Setup Database**:

   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE task_manager;
   EXIT;

   # Create .env file with your database credentials
   echo 'DATABASE_URL="mysql://root:password@localhost:3306/task_manager"' > .env
   ```

3. **Run Migrations & Seed Database**:

   ```bash
   # Apply database migrations
   npm run prisma:migrate

   # Seed with dummy data (3 users + 6 tasks)
   npm run prisma:seed
   ```

4. **Build the project**:

   ```bash
   npm run build
   ```

5. **Run in development mode**:

   ```bash
   npm run start:dev
   ```

6. **Run in production mode**:
   ```bash
   npm run start:prod
   ```

The API will be available at:

- **API**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`

### Dummy Data

After running `npm run prisma:seed`, you'll have:

**3 Users:**

- Alice Johnson (alice@example.com)
- Bob Smith (bob@example.com)
- Charlie Davis (charlie@example.com)

**6 Tasks:**

- Setup Development Environment (DONE) - Alice
- Design Database Schema (DONE) - Alice, Bob
- Implement User Authentication (IN_PROGRESS) - Bob
- Create API Documentation (DONE) - Charlie
- Write Unit Tests (IN_PROGRESS) - Bob, Charlie
- Deploy to Production (TODO) - Unassigned

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Database Management

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npm run prisma:migrate:prod

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-seed after reset
npm run prisma:seed
```

## 🌐 API Endpoints

### Tasks Module

| Method | Endpoint                        | Description                            | Body                                               |
| ------ | ------------------------------- | -------------------------------------- | -------------------------------------------------- |
| GET    | `/tasks`                        | List all tasks (with optional filters) | Query params: `status`, `priority`, `assignedToId` |
| GET    | `/tasks/:id`                    | Get a specific task                    | -                                                  |
| POST   | `/tasks`                        | Create a new task                      | `CreateTaskDto`                                    |
| PUT    | `/tasks/:id`                    | Update a task                          | `UpdateTaskDto`                                    |
| DELETE | `/tasks/:id`                    | Delete a task                          | -                                                  |
| POST   | `/tasks/:id/assign`             | Assign users to a task                 | `{ userIds: string[] }`                            |
| DELETE | `/tasks/:taskId/assign/:userId` | Remove user from task                  | -                                                  |

### Users Module

| Method | Endpoint     | Description         | Body            |
| ------ | ------------ | ------------------- | --------------- |
| GET    | `/users`     | List all users      | -               |
| GET    | `/users/:id` | Get a specific user | -               |
| POST   | `/users`     | Create a new user   | `CreateUserDto` |
| DELETE | `/users/:id` | Delete a user       | -               |

### Example Requests

**Create a User:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

**Create a Task:**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2024-12-31",
    "assignedToIds": ["<user-id>"]
  }'
```

**List Tasks with Filters:**

```bash
curl "http://localhost:3000/tasks?status=TODO&priority=HIGH"
```

**Assign Users to Task:**

```bash
curl -X POST http://localhost:3000/tasks/<task-id>/assign \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["<user-id-1>", "<user-id-2>"]
  }'
```

## 🧪 Testing Strategy

### Unit Testing Approach

The project demonstrates a comprehensive testing strategy:

1. **Service Layer Tests** (Primary Focus):

   - Test business logic in isolation
   - Mock PrismaService for database operations
   - Test success and failure scenarios
   - Examples: `tasks.service.spec.ts`, `users.service.spec.ts`

2. **Test Coverage Areas**:

   - ✅ Create operations with validation
   - ✅ Read operations (single and filtered)
   - ✅ Update operations
   - ✅ Delete operations
   - ✅ Error handling (NotFoundException, BadRequestException)
   - ✅ Assignment operations
   - ✅ Module interdependencies

3. **Test Statistics**:

   - **18 total tests** (all passing ✓)
   - **Tasks Module**: Multiple test suites covering CRUD and assignment operations
   - **Users Module**: Multiple test suites covering CRUD operations

4. **Testing Benefits**:
   - **Confidence**: Changes don't break existing functionality
   - **Documentation**: Tests serve as usage examples
   - **Refactoring**: Safe to improve code with test coverage

### What Would Be Added With More Time:

- **Integration Tests**: Test full request/response cycle
- **E2E Tests**: Test API endpoints with real HTTP requests
- **Controller Tests**: Test HTTP layer independently
- **Repository Tests**: If using a real database
- **Performance Tests**: Load testing for scalability

## 📝 Assumptions

1. **Single User Context**: No authentication/authorization (would be added in production)
2. **MySQL Database**: Persistent storage with Prisma ORM
3. **No Pagination**: All list endpoints return full datasets
4. **Simple User Model**: Only name and email (could be expanded)
5. **No Task Dependencies**: Tasks are independent (no subtasks or blocking)
6. **No Audit Trail**: No tracking of who created/modified tasks
7. **No Soft Deletes**: Deletions are permanent
8. **Email Uniqueness**: Each user must have a unique email
9. **No File Attachments**: Tasks have no associated files
10. **Synchronous Operations**: No background jobs or async processing

## 🚀 Future Improvements

### With More Time (2-4 hours):

1. **Authentication & Authorization**:

   - JWT-based authentication
   - Role-based access control (RBAC)
   - User registration and login

2. **Enhanced Features**:

   - Task comments and activity log
   - File attachments
   - Task dependencies and subtasks
   - Recurring tasks
   - Task templates
   - User profiles

3. **Production Readiness**:

   - Logging (Winston, Pino)
   - Health checks endpoint
   - Rate limiting
   - Request/response logging
   - Database connection pooling optimization

4. **Advanced Testing**:

   - E2E tests with Supertest
   - Load testing with k6 or Artillery
   - Contract testing

5. **Additional Modules**:
   - Projects Module (tasks belong to projects)
   - Teams Module (users belong to teams)
   - Notifications Module
   - Activity Log Module

### For Production Deployment:

1. **Infrastructure**:

   - Docker containerization
   - CI/CD pipeline (GitHub Actions, GitLab CI)
   - Container orchestration (Kubernetes)
   - Monitoring (Prometheus, Grafana)
   - Error tracking (Sentry)

2. **Performance**:

   - Redis caching layer
   - Database query optimization
   - Pagination for large datasets
   - GraphQL for flexible querying

3. **Security**:
   - Input sanitization
   - CORS configuration
   - Helmet.js security headers
   - SQL injection prevention
   - Rate limiting per user

## 💡 Design Patterns Used

1. **Module Pattern**: Feature-based module organization
2. **ORM Pattern**: Prisma for type-safe database access
3. **Dependency Injection**: Loose coupling between components
4. **DTO Pattern**: Data validation and transformation
5. **Service Layer Pattern**: Business logic encapsulation
6. **Layered Architecture**: Clear separation between controllers, services, and data access

## 📚 Learning Resources

If you're interested in the architectural decisions made:

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [REST API Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)

## 👨‍💻 Author

Built as a technical interview exercise demonstrating:

- Modular architecture with NestJS
- Clean architecture principles
- Separation of concerns
- Test-driven development
- RESTful API design
- Production-ready code structure

---

**Note**: This is a demonstration project. In a production environment, additional considerations like authentication, database persistence, monitoring, and comprehensive testing would be essential.
