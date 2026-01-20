# Docker Theory Guide

## Table of Contents
1. [Understanding Containerization](#understanding-containerization)
2. [Docker Introduction](#docker-introduction)
3. [Docker Architecture](#docker-architecture)
4. [Docker Images](#docker-images)
5. [Docker Containers](#docker-containers)
6. [Dockerfile](#dockerfile)
7. [Docker Hub & Registries](#docker-hub--registries)
8. [Docker Compose](#docker-compose)
9. [Docker Networking](#docker-networking)
10. [Docker Volumes](#docker-volumes)
11. [Docker vs Kubernetes](#docker-vs-kubernetes)

---

## Understanding Containerization

### What is Containerization?

Before Docker, applications often ran in **Virtual Machines (VMs)**. Each VM included:
- A full operating system
- All necessary libraries and dependencies
- The application itself

This made VMs resource-heavy, slow to start, and difficult to manage.

**Containerization** is a lighter alternative. Instead of running a full OS for each instance, containers:
- **Share the host operating system's kernel**
- Keep applications and their dependencies isolated
- Are faster to start (seconds vs minutes)
- Use fewer resources (MBs vs GBs)
- Are portable across environments (laptop, server, cloud)

### Why Containerization?

**Traditional Problems:**
- "It works on my machine" syndrome
- Environment inconsistencies between dev, test, and production
- Dependency conflicts
- Slow deployment and scaling

**Container Benefits:**
- **Consistency**: Same environment everywhere
- **Isolation**: Applications don't interfere with each other
- **Portability**: Run anywhere Docker is installed
- **Efficiency**: Lightweight, fast startup
- **Scalability**: Easy to replicate and scale

---

## Docker Introduction

**Docker** is a platform that makes working with containers simple. It lets you:
- **Build** applications inside containers
- **Package** applications with all dependencies
- **Run** applications consistently across environments
- **Share** applications through registries

### Key Docker Concepts

1. **Docker Image**
   - A read-only template containing your application and dependencies
   - Built from instructions in a Dockerfile
   - Can be versioned and shared

2. **Docker Container**
   - A runnable instance of an image
   - Isolated from other containers and the host
   - Has its own filesystem, network, and process space

3. **Docker Registry**
   - A storage and distribution system for Docker images
   - Docker Hub is the public registry
   - You can also run private registries

4. **Dockerfile**
   - A text file with instructions to build a Docker image
   - Defines base image, dependencies, configuration, and startup command

---

## Docker Architecture

Docker uses a **client-server architecture**:

```
┌──────────────┐         ┌──────────────────┐
│ Docker Client│ ──────> │  Docker Daemon   │
│  (CLI/GUI)   │         │  (Docker Engine) │
└──────────────┘         └──────────────────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                    ┌────▼────┐      ┌────▼────┐
                    │ Images  │      │Registry │
                    └────┬────┘      └─────────┘
                         │
                    ┌────▼────────┐
                    │ Containers  │
                    └─────────────┘
```

### Components:

1. **Docker Client** (`docker` command)
   - Interface to interact with Docker
   - Sends commands to Docker daemon
   - Example: `docker run`, `docker build`

2. **Docker Daemon** (`dockerd`)
   - Core service that runs on the host
   - Manages images, containers, networks, volumes
   - Listens for Docker API requests

3. **Docker Images**
   - Stored locally or in registries
   - Built in layers (efficient storage)
   - Immutable (changes create new layers)

4. **Docker Containers**
   - Running instances with their own:
     - Process space
     - Network interface
     - Filesystem (image layers + writable layer)

5. **Docker Registry**
   - Stores and distributes images
   - Docker Hub (public)
   - Private registries (GHCR, ECR, ACR)

---

## Docker Images

### What is a Docker Image?

A Docker image is a **lightweight, standalone, executable package** that includes:
- Application code
- Runtime environment (Python, Node.js, etc.)
- System libraries
- Dependencies
- Configuration files

### Image Layers

Images are built in **layers**:

```
┌─────────────────────────┐
│ App Code (Layer 4)      │  ← Your application
├─────────────────────────┤
│ Dependencies (Layer 3)  │  ← pip install, npm install
├─────────────────────────┤
│ Runtime (Layer 2)       │  ← Python, Node.js
├─────────────────────────┤
│ Base OS (Layer 1)       │  ← Ubuntu, Alpine
└─────────────────────────┘
```

**Benefits of Layers:**
- **Reusability**: Common layers shared between images
- **Efficiency**: Only changed layers need to be downloaded/stored
- **Caching**: Faster builds when layers haven't changed

### Image Naming

Format: `registry/repository:tag`

Examples:
- `nginx:latest` → official nginx, latest version
- `python:3.11-slim` → official Python 3.11 slim variant
- `username/myapp:v1.0` → custom image with version tag
- `ghcr.io/user/app:prod` → GitHub Container Registry image

### Essential Image Commands

```bash
# List local images
docker images

# Pull an image from registry
docker pull nginx:latest

# Build an image from Dockerfile
docker build -t myapp:v1 .

# Tag an image
docker tag myapp:v1 username/myapp:v1

# Remove an image
docker rmi myapp:v1

# Inspect image details
docker inspect nginx:latest

# View image history (layers)
docker history nginx:latest
```

---

## Docker Containers

### What is a Docker Container?

A container is a **runnable instance of an image**. When you run an image, Docker:
1. Creates a container
2. Adds a writable layer on top of the image
3. Starts the process defined in the image

### Container Lifecycle

```
Created → Running → Paused → Stopped → Removed
            ↓         ↓         ↓
          Restart   Resume    Restart
```

### Container Characteristics

- **Isolated**: Has its own process space, network, filesystem
- **Ephemeral**: By default, data is lost when container stops
- **Lightweight**: Shares host kernel, starts in seconds
- **Stateless**: Best practice is to keep containers stateless

### Essential Container Commands

```bash
# Run a container
docker run nginx

# Run with options
docker run -d -p 8080:80 --name web nginx

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop web

# Start a stopped container
docker start web

# Restart a container
docker restart web

# Remove a container
docker rm web

# View container logs
docker logs web

# Execute command in running container
docker exec -it web bash

# View container resource usage
docker stats web

# Inspect container details
docker inspect web
```

### Common `docker run` Options

```bash
-d              # Run in detached mode (background)
-p 8080:80      # Map host port 8080 to container port 80
--name web      # Assign a name to the container
-e VAR=value    # Set environment variable
-v /host:/cont  # Mount volume
--rm            # Remove container when it stops
-it             # Interactive terminal
--network net   # Connect to specific network
--restart always # Restart policy
```

---

## Dockerfile

### What is a Dockerfile?

A Dockerfile is a **text file containing instructions** to build a Docker image. Each instruction creates a new layer in the image.

### Dockerfile Structure

```dockerfile
# Base image
FROM python:3.11-slim

# Metadata
LABEL maintainer="you@example.com"
LABEL version="1.0"

# Set working directory
WORKDIR /app

# Copy files
COPY requirements.txt .
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Define entrypoint
CMD ["python", "app.py"]
```

### Essential Dockerfile Instructions

| Instruction | Purpose | Example |
|------------|---------|---------|
| `FROM` | Base image | `FROM python:3.11` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files from host to image | `COPY . .` |
| `ADD` | Copy files (with URL/tar support) | `ADD file.tar.gz /app` |
| `RUN` | Execute commands during build | `RUN pip install flask` |
| `CMD` | Default command to run | `CMD ["python", "app.py"]` |
| `ENTRYPOINT` | Executable to run | `ENTRYPOINT ["python"]` |
| `EXPOSE` | Document port | `EXPOSE 8000` |
| `ENV` | Set environment variables | `ENV DEBUG=1` |
| `ARG` | Build-time variables | `ARG VERSION=1.0` |
| `VOLUME` | Create mount point | `VOLUME /data` |
| `USER` | Set user | `USER appuser` |

### Dockerfile Best Practices

1. **Use specific base image tags**
   ```dockerfile
   FROM python:3.11-slim  # Good
   FROM python            # Bad (uses latest, unpredictable)
   ```

2. **Minimize layers**
   ```dockerfile
   # Good - single layer
   RUN apt-get update && apt-get install -y \
       curl \
       vim \
       && rm -rf /var/lib/apt/lists/*
   
   # Bad - multiple layers
   RUN apt-get update
   RUN apt-get install -y curl
   RUN apt-get install -y vim
   ```

3. **Order instructions by frequency of change**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .      # Copy dependencies first
   RUN pip install -r requirements.txt  # Install (cached if requirements unchanged)
   COPY . .                     # Copy app code last (changes frequently)
   ```

4. **Use .dockerignore**
   ```
   __pycache__
   *.pyc
   .git
   .env
   node_modules
   ```

5. **Run as non-root user**
   ```dockerfile
   RUN useradd -m appuser
   USER appuser
   ```

---

## Docker Hub & Registries

### What is Docker Hub?

**Docker Hub** is Docker's official cloud-based registry where developers:
- **Store** Docker images
- **Share** images publicly or privately
- **Download** pre-built images

Think of it like GitHub for Docker images.

### Registry Types

1. **Public Registries**
   - Docker Hub (hub.docker.com)
   - GitHub Container Registry (ghcr.io)
   - Quay.io

2. **Private Registries**
   - Docker Hub (private repos)
   - AWS ECR (Elastic Container Registry)
   - Azure ACR (Azure Container Registry)
   - Google GCR (Google Container Registry)
   - Self-hosted (Docker Registry)

### Working with Registries

```bash
# Login to Docker Hub
docker login

# Login to specific registry
docker login ghcr.io

# Pull image
docker pull nginx:latest

# Tag image for registry
docker tag myapp:v1 username/myapp:v1

# Push image to registry
docker push username/myapp:v1

# Search Docker Hub
docker search nginx

# Logout
docker logout
```

### Image Naming for Push

To push an image, it must be tagged with the registry format:

```bash
# Docker Hub
docker tag myapp:v1 username/myapp:v1
docker push username/myapp:v1

# GitHub Container Registry
docker tag myapp:v1 ghcr.io/username/myapp:v1
docker push ghcr.io/username/myapp:v1

# AWS ECR
docker tag myapp:v1 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:v1
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:v1
```

---

## Docker Compose

### What is Docker Compose?

**Docker Compose** is a tool for running and managing **multiple Docker containers** as a single application. Instead of starting each container manually, you define all services in a `docker-compose.yml` file.

### When to Use Docker Compose?

- Multi-container applications (app + database + cache)
- Local development environments
- Testing environments
- Small-scale deployments

### docker-compose.yml Structure

```yaml
version: '3.8'

services:
  # Web application
  web:
    build: ./app
    ports:
      - "8080:8000"
    environment:
      - DEBUG=1
      - DB_HOST=db
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app
    networks:
      - app-network

  # Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

  # Cache
  redis:
    image: redis:7-alpine
    networks:
      - app-network

volumes:
  db-data:

networks:
  app-network:
    driver: bridge
```

### Essential Compose Commands

```bash
# Start services (build if needed)
docker compose up

# Start in background
docker compose up -d

# Build images
docker compose build

# Stop services
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove with volumes
docker compose down -v

# View running services
docker compose ps

# View logs
docker compose logs

# Follow logs
docker compose logs -f web

# Execute command in service
docker compose exec web bash

# Restart service
docker compose restart web

# Scale service
docker compose up -d --scale web=3
```

### Docker Compose Benefits

- **Simplified management**: Single command to start/stop everything
- **Configuration as code**: Version-controlled YAML file
- **Environment consistency**: Same setup across team
- **Service dependencies**: Control startup order
- **Network isolation**: Automatic network creation

---

## Docker Networking

### What is Docker Networking?

Docker Networking provides mechanisms for:
- **Communication between containers**
- **Communication between containers and host**
- **Communication between containers and external networks**

### Network Types

1. **Bridge** (default)
   - Isolated network on the host
   - Containers can communicate with each other
   - Must publish ports to access from host

2. **Host**
   - Container uses host's network directly
   - No network isolation
   - Best performance

3. **None**
   - No networking
   - Complete isolation

4. **Custom Bridge**
   - User-defined bridge network
   - Automatic DNS resolution by container name
   - Better isolation

### Network Commands

```bash
# List networks
docker network ls

# Create network
docker network create mynetwork

# Inspect network
docker network inspect mynetwork

# Connect container to network
docker network connect mynetwork container1

# Disconnect container
docker network disconnect mynetwork container1

# Remove network
docker network rm mynetwork

# Run container on specific network
docker run -d --network mynetwork --name web nginx
```

### Container Communication

**Within same network:**
```bash
# Create network
docker network create app-net

# Run database
docker run -d --name db --network app-net postgres

# Run app (can connect to db by name "db")
docker run -d --name app --network app-net myapp
```

**Port publishing:**
```bash
# Publish single port
docker run -d -p 8080:80 nginx

# Publish all exposed ports
docker run -d -P nginx

# Bind to specific interface
docker run -d -p 127.0.0.1:8080:80 nginx
```

---

## Docker Volumes

### What are Docker Volumes?

**Docker Volumes** store data **outside** of a container's filesystem so data:
- Persists when container stops or is deleted
- Can be shared between containers
- Is managed by Docker
- Can be backed up and migrated

### Volume Types

1. **Named Volumes** (Managed by Docker)
   ```bash
   docker volume create mydata
   docker run -v mydata:/app/data myapp
   ```

2. **Bind Mounts** (Host directory)
   ```bash
   docker run -v /host/path:/container/path myapp
   ```

3. **tmpfs Mounts** (Memory only)
   ```bash
   docker run --tmpfs /app/temp myapp
   ```

### Volume Commands

```bash
# Create volume
docker volume create mydata

# List volumes
docker volume ls

# Inspect volume
docker volume inspect mydata

# Remove volume
docker volume rm mydata

# Remove all unused volumes
docker volume prune

# Run with volume
docker run -v mydata:/data nginx
```

### Volume vs Bind Mount

| Feature | Named Volume | Bind Mount |
|---------|-------------|------------|
| **Location** | Docker manages | You specify host path |
| **Portability** | Portable across systems | Host-specific |
| **Use case** | Databases, persistent data | Development, source code |
| **Backup** | Easier to backup | Manual backup |
| **Syntax** | `-v mydata:/path` | `-v /host/path:/path` |

### Using Volumes

**For database persistence:**
```bash
docker run -d \
  --name postgres \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15
```

**For development (bind mount):**
```bash
docker run -d \
  --name devapp \
  -v $(pwd):/app \
  -p 8080:8000 \
  myapp
```

**Sharing data between containers:**
```bash
# Create volume
docker volume create shared-data

# Container 1 writes data
docker run -v shared-data:/data writer-app

# Container 2 reads data
docker run -v shared-data:/data:ro reader-app
```

---

## Docker vs Kubernetes

### Docker

**What it is:**
- A platform to build, package, and run applications in containers
- Provides Docker Engine for running containers
- Includes Docker Hub for sharing images

**Focus:**
- Creation and management of individual containers
- Single-host container management
- Simple multi-container apps (Docker Compose)

**Best for:**
- Development environments
- Single-node deployments
- Small-scale applications
- Learning containerization

**Key tools:**
- `docker run` - Run containers
- `docker build` - Build images
- `docker-compose` - Multi-container apps

### Kubernetes

**What it is:**
- A container orchestration system
- Manages, scales, and automates deployment of containers
- Works with Docker containers (and others like containerd)

**Focus:**
- Multi-host container orchestration
- Large-scale, distributed applications
- Production workloads
- Self-healing and auto-scaling

**Best for:**
- Production environments
- Microservices architectures
- Multi-node clusters
- Enterprise applications

**Key features:**
- Load balancing
- Service discovery
- Auto-scaling (horizontal and vertical)
- Rolling updates and rollbacks
- Self-healing (restart failed containers)
- Secret and configuration management
- Storage orchestration

### Comparison Table

| Feature | Docker | Kubernetes |
|---------|--------|------------|
| **Purpose** | Build and run containers | Orchestrate containers at scale |
| **Scope** | Single host (primarily) | Multi-host cluster |
| **Complexity** | Simple, easy to learn | Complex, steep learning curve |
| **Scaling** | Manual or basic compose | Automatic, intelligent |
| **High Availability** | Limited | Built-in |
| **Load Balancing** | Manual setup | Automatic |
| **Health Checks** | Basic | Advanced with auto-restart |
| **Updates** | Manual | Rolling updates, zero-downtime |
| **Use Case** | Dev, small apps | Production, large apps |

### They Work Together!

Docker and Kubernetes are **complementary**, not competitors:

```
Developer → Docker (Build) → Docker Image → Kubernetes (Deploy & Manage)
```

**Typical workflow:**
1. **Develop** with Docker locally
2. **Build** images with Docker
3. **Push** to registry (Docker Hub, etc.)
4. **Deploy** to Kubernetes cluster
5. Kubernetes **manages** containers at scale

---

## Summary

**Key Takeaways:**

1. **Containerization** isolates apps efficiently using shared OS kernel
2. **Docker** makes containers easy to build, run, and share
3. **Images** are templates; **Containers** are running instances
4. **Dockerfile** defines how to build an image
5. **Registries** store and distribute images
6. **Docker Compose** manages multi-container applications
7. **Volumes** persist data beyond container lifecycle
8. **Networks** enable container communication
9. **Kubernetes** orchestrates Docker containers at scale

**Next Steps:**
- Complete hands-on labs to practice these concepts
- Build your own Dockerfile
- Deploy multi-container apps with Compose
- Push images to Docker Hub
- Explore Kubernetes for production deployments
