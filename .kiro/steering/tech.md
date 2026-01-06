# SwapHubu Technology Stack

## Backend Stack
- **FastAPI** - Modern Python web framework for APIs
- **Python 3.11** - Programming language
- **PostgreSQL 15** - Primary database
- **SQLAlchemy 2.0** - ORM and database toolkit
- **Alembic** - Database migration management
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server
- **Docker** - Containerization

## Frontend Stack
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Development Tools
- **Docker Compose** - Multi-container orchestration
- **pgAdmin** - Database administration
- **PowerShell** - Automation scripts
- **Hot Reload** - Development workflow

## Common Commands

### Development Environment
```powershell
# Start development environment
.\start-dev.ps1

# Start with rebuild (when dependencies change)
.\start-dev.ps1 -Rebuild

# Clean everything and start fresh
.\start-dev.ps1 -CleanAll
```

### Database Operations
```powershell
# Generate new migration
.\backend\scripts\generate-migration.ps1

# View migration status
docker-compose exec backend alembic current

# View migration history
docker-compose exec backend alembic history
```

### Container Management
```powershell
# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Stop services
docker-compose down --remove-orphans -v

# Check container status
docker-compose ps
```

### Frontend Development
```bash
# Navigate to frontend directory first
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Configuration
- Environment variables managed through `.env` file
- Separate frontend environment in `frontend/.env`
- Docker environment variable injection
- Development vs production configurations