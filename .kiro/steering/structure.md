# SwapHubu Project Structure

## Root Level Organization
```
swaphubu/
├── backend/           # FastAPI backend application
├── frontend/          # Next.js frontend application
├── .kiro/             # Kiro AI assistant configuration
├── docker-compose.yml # Multi-container orchestration
├── start-dev.ps1      # Development environment startup
└── README.md          # Project documentation
```

## Backend Structure (`backend/`)
```
backend/
├── src/                    # Source code
│   ├── api_router.py       # Centralized API routing
│   ├── config/             # Configuration management
│   ├── constants/          # Application constants
│   ├── db/                 # Database configuration
│   ├── endpoints/          # API route handlers
│   ├── enums/              # Enumeration definitions
│   ├── models/             # SQLAlchemy database models
│   ├── repositories/       # Data access layer
│   ├── schemas/            # Pydantic request/response schemas
│   ├── services/           # Business logic layer
│   └── utils/              # Utility functions and middleware
├── scripts/                # Database and utility scripts
├── alembic/                # Database migrations
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
└── Dockerfile              # Container configuration
```

## Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components
│   ├── lib/                # Utility libraries and configurations
│   ├── redux/              # State management
│   └── middleware.ts       # Next.js middleware
├── public/                 # Static assets
├── package.json            # Node.js dependencies
├── tailwind.config.ts      # Tailwind CSS configuration
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Architectural Patterns

### Backend Patterns
- **Layered Architecture**: Clear separation between endpoints, services, repositories, and models
- **Dependency Injection**: Database sessions and services injected via FastAPI dependencies
- **Centralized Routing**: All API routes organized through `api_router.py`
- **Middleware Pattern**: Authentication and CORS handled via middleware
- **Repository Pattern**: Data access abstracted through repository layer

### Frontend Patterns
- **App Router**: Next.js 13+ App Router for file-based routing
- **Component Composition**: Reusable components with shadcn/ui
- **State Management**: Redux Toolkit for global state
- **Type Safety**: Full TypeScript implementation
- **CSS-in-JS**: Tailwind CSS with component variants

### Database Patterns
- **Migration-First**: All schema changes through Alembic migrations
- **Model-Driven**: SQLAlchemy models define database structure
- **Connection Pooling**: Managed through SQLAlchemy engine

## File Naming Conventions
- **Backend**: Snake_case for Python files and functions
- **Frontend**: PascalCase for components, camelCase for utilities
- **Database**: Snake_case for table and column names
- **Environment**: UPPER_CASE for environment variables

## Import Organization
- **Backend**: Absolute imports from `src/` root
- **Frontend**: Relative imports with `@/` alias for src directory
- **Dependencies**: External imports first, then internal imports

## Configuration Management
- **Environment Variables**: Centralized in `.env` files
- **Type Safety**: Environment validation in backend utilities
- **Separation**: Different configs for development/production