# My Stack - Multi-Container Application

A complete Docker Compose application demonstrating a 3-tier architecture with Nginx, Flask API, and PostgreSQL.

## Architecture

- **web** (Nginx) - Frontend web server on port 8081
- **api** (Flask) - Python API backend on port 5000
- **db** (PostgreSQL) - Database server

## Quick Start

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs

# Test the application
curl http://localhost:8081
curl http://localhost:5000/data

# Stop services
docker compose down
```

## Services

### Web (Nginx)
- Serves static HTML from `./html`
- Accessible at http://localhost:8081
- Connects to API service

### API (Flask)
- Python Flask application
- Connects to PostgreSQL database
- Endpoints:
  - `/` - Health check
  - `/data` - Query database

### Database (PostgreSQL)
- PostgreSQL 15 Alpine
- Persistent data with named volume
- Credentials: postgres/secret

## Networks

- **frontend** - Web ↔ API communication
- **backend** - API ↔ Database communication

## Volumes

- **db-data** - Persistent PostgreSQL data

## Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove with volumes
docker compose down -v
```
