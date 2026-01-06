# SWAPHUBU APP

A modern web application built with FastAPI and PostgreSQL, featuring automated database migrations and containerized development environment.

## 🚀 Project Overview

SwapHubu is a scalable web application designed with modern development practices, featuring:

- **RESTful API** built with FastAPI
- **PostgreSQL** database with automated migrations
- **Docker containerization** for consistent development environment
- **Automated migration system** using Alembic
- **Database management interface** with pgAdmin
- **Professional project structure** with clean separation of concerns

## 🛠️ Technologies

### Backend

- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for building APIs
- **[PostgreSQL](https://www.postgresql.org/)** - Advanced open-source relational database
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - Python SQL toolkit and ORM
- **[Alembic](https://alembic.sqlalchemy.org/)** - Database migration tool
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - Data validation using Python type hints

### DevOps & Tools

- **[Docker](https://www.docker.com/)** - Containerization platform
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container Docker applications
- **[pgAdmin](https://www.pgadmin.org/)** - PostgreSQL administration and development platform
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server for FastAPI

### Development

- **Python 3.11** - Programming language
- **PowerShell Scripts** - Automation and development workflow
- **Hot Reload** - Fast development iteration

## 📁 Project Structure

```
swaphubu/
├── backend/                          # Backend application
│   ├── scripts/                      # Migration and utility scripts
│   │   ├── apply_migrations.py       # Auto-apply database migrations
│   │   └── generate-migration.ps1    # Generate new migrations
│   ├── src/                          # Source code
│   │   ├── db/                       # Database configuration
│   │   │   ├── __init__.py           # Database exports
│   │   │   └── base.py               # Database setup and connection
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── __init__.py           # Model exports
│   │   │   └── User.py               # User model
│   │   ├── schemas/                  # Pydantic schemas (future)
│   │   ├── services/                 # Business logic (future)
│   │   └── endpoints/                # API routes (future)
│   ├── alembic/                      # Database migrations
│   │   ├── versions/                 # Migration files
│   │   └── env.py                    # Alembic configuration
│   ├── main.py                       # FastAPI application entry point
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Container configuration
│   └── alembic.ini                   # Alembic settings
├── start-dev.ps1                     # Development environment startup script
├── docker-compose.yml               # Multi-container configuration
├── .env                             # Environment variables (create this)
└── README.md                        # Project documentation
```

## 🔧 Prerequisites

Before running the application, ensure you have:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** installed and running
- **[PowerShell](https://docs.microsoft.com/en-us/powershell/)** (Windows) or compatible shell
- **Git** for version control

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd swaphubu
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```env
# Database Configuration
POSTGRES_DB=swaphubu_db
POSTGRES_USER=swaphubu_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# pgAdmin Configuration
PGADMIN_EMAIL=admin@swaphubu.com
PGADMIN_PASSWORD=admin123

# Application Configuration
ENVIRONMENT=development
```

### 3. Start the Development Environment

```powershell
.\start-dev.ps1
```

This single command will:

- ✅ Validate environment variables
- ✅ Start PostgreSQL database
- ✅ Start FastAPI backend
- ✅ Start pgAdmin interface
- ✅ Apply database migrations automatically
- ✅ Display service URLs and status

### 4. Generate Initial Migration

```powershell
.\backend\scripts\generate-migration.ps1
```

Enter migration message: `"Initial migration with User model"`

### 5. Access Your Services

| Service        | URL                        | Description                   |
| -------------- | -------------------------- | ----------------------------- |
| **API**        | http://localhost:8000      | FastAPI application           |
| **API Docs**   | http://localhost:8000/docs | Interactive API documentation |
| **pgAdmin**    | http://localhost:5050      | Database management interface |
| **PostgreSQL** | localhost:5432             | Database server               |

## 🔄 Development Workflow

### Daily Development

1. **Start environment**: `.\start-dev.ps1`
2. **Make code changes** (hot reload enabled)
3. **View logs**: `docker-compose logs -f backend`
4. **Stop environment**: `Ctrl+C` or `docker-compose down`

### Database Changes

1. **Modify models** in `backend/src/models/`
2. **Generate migration**: `.\backend\scripts\generate-migration.ps1`
3. **Review migration** file in `backend/alembic/versions/`
4. **Restart app** to apply: `.\start-dev.ps1`

### API Development

- **Add new endpoints** in `backend/main.py` or `backend/src/endpoints/`
- **Create schemas** in `backend/src/schemas/`
- **Add business logic** in `backend/src/services/`
- **Test APIs** at http://localhost:8000/docs

## 🗄️ Database Management

### Using pgAdmin

1. Access pgAdmin at http://localhost:5050
2. Login with credentials from `.env` file
3. Add server connection:
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database**: Your `POSTGRES_DB` value
   - **Username**: Your `POSTGRES_USER` value
   - **Password**: Your `POSTGRES_PASSWORD` value

### Migration Commands

```powershell
# Generate new migration
.\backend\scripts\generate-migration.ps1

# View migration status
docker-compose exec backend alembic current

# View migration history
docker-compose exec backend alembic history

# Rollback migration (if needed)
docker-compose exec backend alembic downgrade -1
```

## 🐳 Docker Services

The application runs three main services:

### PostgreSQL Database

- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **Data**: Persisted in Docker volume
- **Health Check**: Automatic readiness verification

### FastAPI Backend

- **Build**: Custom Dockerfile
- **Port**: `8000`
- **Features**: Hot reload, automatic migrations
- **Health Check**: `/health` endpoint monitoring

### pgAdmin Interface

- **Image**: `dpage/pgadmin4:latest`
- **Port**: `5050`
- **Purpose**: Database administration and development

## 🔧 Configuration

### Environment Variables

| Variable            | Description             | Example              |
| ------------------- | ----------------------- | -------------------- |
| `POSTGRES_DB`       | Database name           | `swaphubu_db`        |
| `POSTGRES_USER`     | Database user           | `swaphubu_user`      |
| `POSTGRES_PASSWORD` | Database password       | `secure_password`    |
| `PGADMIN_EMAIL`     | pgAdmin login email     | `admin@swaphubu.com` |
| `PGADMIN_PASSWORD`  | pgAdmin login password  | `admin123`           |
| `ENVIRONMENT`       | Application environment | `development`        |

### Development vs Production

- **Development**: Uses hot reload, detailed logging, development tools
- **Production**: Optimized Dockerfile available (commented in `backend/Dockerfile`)

## 🧪 API Endpoints

### Current Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check and status
- `GET /users/` - List all users
- `POST /users/` - Create new user

### API Documentation

Visit http://localhost:8000/docs for interactive API documentation with:

- **Request/Response schemas**
- **Try it out** functionality
- **Authentication** (when implemented)
- **Error responses**

## 🚀 Production Deployment

For production deployment:

1. **Update environment variables** for production
2. **Use production Dockerfile** (uncomment in `backend/Dockerfile`)
3. **Configure reverse proxy** (Nginx recommended)
4. **Set up SSL certificates**
5. **Configure monitoring** and logging
6. **Set up CI/CD pipeline**

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** following the project structure
4. **Test thoroughly** using the development environment
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Docker not starting:**

```powershell
# Check Docker status
docker info

# Restart Docker Desktop
# Check Windows/Mac Docker Desktop application
```

**Port conflicts:**

```powershell
# Check what's using ports
netstat -ano | findstr :8000
netstat -ano | findstr :5432
netstat -ano | findstr :5050
```

**Migration errors:**

```powershell
# Reset migrations (development only)
docker-compose down -v
.\start-dev.ps1
.\backend\scripts\generate-migration.ps1
```

**Database connection issues:**

- Verify `.env` file exists and has correct values
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

### Getting Help

- **Check logs**: `docker-compose logs -f [service-name]`
- **Container status**: `docker-compose ps`
- **Restart services**: `docker-compose restart`
- **Clean restart**: `docker-compose down && .\start-dev.ps1`

---

**Happy coding! 🎉**
