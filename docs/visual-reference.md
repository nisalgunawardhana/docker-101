# Docker Visual Reference Guide

Quick visual reference for Docker concepts and workflows.

---

## Container vs Virtual Machine

```
┌─────────────────────────────────────────────┐
│          VIRTUAL MACHINES                   │
├─────────────────────────────────────────────┤
│  App A    │  App B    │  App C              │
│  Libs     │  Libs     │  Libs               │
├───────────┼───────────┼─────────────────────┤
│  Guest OS │  Guest OS │  Guest OS           │
├───────────┴───────────┴─────────────────────┤
│         Hypervisor (VMware, VirtualBox)     │
├─────────────────────────────────────────────┤
│         Host Operating System               │
├─────────────────────────────────────────────┤
│         Physical Hardware                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│             CONTAINERS                      │
├─────────────────────────────────────────────┤
│  App A    │  App B    │  App C              │
│  Libs     │  Libs     │  Libs               │
├───────────┴───────────┴─────────────────────┤
│         Docker Engine                       │
├─────────────────────────────────────────────┤
│         Host Operating System               │
├─────────────────────────────────────────────┤
│         Physical Hardware                   │
└─────────────────────────────────────────────┘
```

**Key Differences:**
- VMs: Each has full OS (GBs) → Slow startup (minutes)
- Containers: Share host OS (MBs) → Fast startup (seconds)

---

## Docker Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     DOCKER CLIENT                         │
│                    (docker command)                       │
└────────────────────────┬──────────────────────────────────┘
                         │ REST API
                         ↓
┌───────────────────────────────────────────────────────────┐
│                    DOCKER DAEMON                          │
│                     (dockerd)                             │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Container Management                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │    │
│  │  │Container1│  │Container2│  │Container3│     │    │
│  │  └──────────┘  └──────────┘  └──────────┘     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Image Management                    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │    │
│  │  │ Image A  │  │ Image B  │  │ Image C  │     │    │
│  │  └──────────┘  └──────────┘  └──────────┘     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Networks, Volumes, Plugins               │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ↓
┌───────────────────────────────────────────────────────────┐
│                    DOCKER REGISTRY                        │
│                   (Docker Hub, GHCR)                      │
│                                                           │
│         docker pull ←─────────→ docker push               │
└───────────────────────────────────────────────────────────┘
```

---

## Image Layers

```
┌─────────────────────────────────────────┐
│  Your Application Code     (5 MB)      │  Layer 4 (top)
├─────────────────────────────────────────┤
│  Python Dependencies      (50 MB)      │  Layer 3
├─────────────────────────────────────────┤
│  Python Runtime          (100 MB)      │  Layer 2
├─────────────────────────────────────────┤
│  Base OS (Debian/Alpine)  (20 MB)      │  Layer 1 (base)
└─────────────────────────────────────────┘
         Read-Only Image Layers

                    ↓ docker run

┌─────────────────────────────────────────┐
│  Container Writable Layer   (changes)  │  ← Temporary
├─────────────────────────────────────────┤
│  Your Application Code     (5 MB)      │
├─────────────────────────────────────────┤
│  Python Dependencies      (50 MB)      │
├─────────────────────────────────────────┤
│  Python Runtime          (100 MB)      │
├─────────────────────────────────────────┤
│  Base OS (Debian/Alpine)  (20 MB)      │
└─────────────────────────────────────────┘
           Running Container
```

**Benefits:**
- Shared layers save disk space
- Faster builds (cached layers)
- Faster pulls (only new layers downloaded)

---

## Container Lifecycle

```
                    docker create
                          ↓
┌──────────┐         ┌─────────┐
│          │         │         │
│  IMAGE   │────────→│ CREATED │
│          │         │         │
└──────────┘         └────┬────┘
                          │
                          │ docker start
                          ↓
                     ┌─────────┐
               ┌────→│ RUNNING │←────┐
               │     └────┬────┘     │
               │          │          │
               │          │          │
    docker    │          │          │  docker
    unpause   │          │          │  restart
               │          │          │
               │     ┌────↓────┐     │
               └─────│ PAUSED  │     │
                     └────┬────┘     │
                          │          │
                          │          │
                          │ docker stop
                          ↓          │
                     ┌─────────┐     │
                     │ STOPPED │─────┘
                     └────┬────┘
                          │
                          │ docker rm
                          ↓
                     ┌─────────┐
                     │ REMOVED │
                     └─────────┘
```

---

## Dockerfile → Image → Container

```
┌──────────────────────────┐
│      Dockerfile          │
│  ───────────────────     │
│  FROM python:3.11-slim   │
│  WORKDIR /app            │
│  COPY . .                │
│  RUN pip install -r req  │
│  CMD ["python","app.py"] │
└──────────┬───────────────┘
           │
           │ docker build -t myapp:v1 .
           ↓
┌──────────────────────────┐
│      Docker Image        │
│  ───────────────────     │
│  Name: myapp             │
│  Tag: v1                 │
│  Size: 175 MB            │
│  Layers: 5               │
└──────────┬───────────────┘
           │
           │ docker run -d -p 8080:8000 --name app myapp:v1
           ↓
┌──────────────────────────┐
│    Running Container     │
│  ───────────────────     │
│  Name: app               │
│  Port: 8080→8000         │
│  Status: Running         │
│  PID: 12345              │
└──────────────────────────┘
```

---

## Port Mapping

```
┌─────────────────────────────────────────────┐
│           HOST MACHINE                      │
│                                             │
│  Browser ──→ http://localhost:8080/        │
│                      │                      │
│                      ↓                      │
│  ┌─────────────────────────────────────┐  │
│  │  Docker Container                    │  │
│  │  ┌───────────────────────────────┐  │  │
│  │  │  Application                   │  │  │
│  │  │  Listening on:                 │  │  │
│  │  │  0.0.0.0:8000 ←────┐          │  │  │
│  │  └────────────────────┼──────────┘  │  │
│  │                        │             │  │
│  │  Port Mapping:         │             │  │
│  │  8080:8000 ────────────┘             │  │
│  │  (host):(container)                  │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

Command: docker run -p 8080:8000 myapp
         Host port ─┘     └─ Container port
```

---

## Docker Compose Stack

```
┌─────────────────────────────────────────────────┐
│           docker-compose.yml                    │
│  ───────────────────────────────────────────   │
│  services:                                      │
│    web:                                         │
│      image: nginx                               │
│      ports: ["8080:80"]                         │
│    api:                                         │
│      build: .                                   │
│      depends_on: [db]                           │
│    db:                                          │
│      image: postgres                            │
└──────────────────┬──────────────────────────────┘
                   │
                   │ docker compose up
                   ↓
┌─────────────────────────────────────────────────┐
│            Running Stack                        │
│                                                 │
│  ┌───────────┐      ┌───────────┐             │
│  │    web    │────→ │    api    │             │
│  │  (nginx)  │      │  (custom) │             │
│  └───────────┘      └─────┬─────┘             │
│       ↑                   │                    │
│       │ Port 8080         │                    │
│       │                   ↓                    │
│  ┌────┴──────────────┬───────────┐            │
│  │   Host Network    │    db     │            │
│  │                   │ (postgres)│            │
│  └───────────────────┴───────────┘            │
│                                                 │
│  All services communicate via service names    │
└─────────────────────────────────────────────────┘
```

---

## Registry Workflow

```
┌──────────────────────────────────────────────────┐
│               DEVELOPER MACHINE                  │
│                                                  │
│  1. docker build -t myapp:v1 .                  │
│     ↓                                            │
│  ┌─────────────┐                                │
│  │ myapp:v1    │  Local Image                   │
│  └──────┬──────┘                                │
│         │                                         │
│  2. docker tag myapp:v1 username/myapp:v1       │
│     ↓                                            │
│  ┌─────────────────────┐                        │
│  │ username/myapp:v1   │  Tagged for Registry   │
│  └──────┬──────────────┘                        │
│         │                                         │
│  3. docker push username/myapp:v1               │
│         ↓                                         │
└─────────┼────────────────────────────────────────┘
          │
          │  Upload
          ↓
┌──────────────────────────────────────────────────┐
│             DOCKER HUB REGISTRY                  │
│                                                  │
│  ┌──────────────────────────┐                   │
│  │  username/myapp:v1       │  Public Repository│
│  │  username/myapp:latest   │                   │
│  └────────┬─────────────────┘                   │
└───────────┼──────────────────────────────────────┘
            │
            │  docker pull username/myapp:v1
            ↓
┌──────────────────────────────────────────────────┐
│             PRODUCTION SERVER                    │
│                                                  │
│  4. docker pull username/myapp:v1               │
│     ↓                                            │
│  ┌─────────────────────┐                        │
│  │ username/myapp:v1   │  Downloaded            │
│  └──────┬──────────────┘                        │
│         │                                         │
│  5. docker run -d username/myapp:v1             │
│     ↓                                            │
│  ┌─────────────────────┐                        │
│  │   Running Container │                        │
│  └─────────────────────┘                        │
└──────────────────────────────────────────────────┘
```

---

## Build Context

```
project/
├── src/
│   ├── app.py         ┐
│   └── utils.py       │
├── tests/             │  Build Context
│   └── test.py        │  (sent to Docker daemon)
├── README.md          │
├── .dockerignore      │  Excludes files
└── Dockerfile         ┘  Build instructions

Docker build command:
  docker build -t myapp .
                        └─ Context path (current dir)

.dockerignore prevents:
  tests/
  README.md
  .git
  node_modules

Only necessary files sent → Faster builds
```

---

## Volume Types

### Named Volume (Managed by Docker)
```
┌─────────────────────────────────────┐
│        Docker Managed Storage       │
│  /var/lib/docker/volumes/mydata/    │
│  ┌────────────────────────────┐    │
│  │  Database Files            │    │
│  │  app.db, logs/, etc.       │    │
│  └────────────┬───────────────┘    │
└───────────────┼─────────────────────┘
                │
                │ Mount
                ↓
       ┌────────────────┐
       │   Container    │
       │   /data/ ──────┤→ Persistent
       └────────────────┘

Command: docker run -v mydata:/data myapp
```

### Bind Mount (Host Directory)
```
┌─────────────────────────────────────┐
│        Host File System             │
│  /home/user/project/                │
│  ┌────────────────────────────┐    │
│  │  Source Code               │    │
│  │  app.py, config.yml        │    │
│  └────────────┬───────────────┘    │
└───────────────┼─────────────────────┘
                │
                │ Bind Mount
                ↓
       ┌────────────────┐
       │   Container    │
       │   /app/ ───────┤→ Live updates
       └────────────────┘

Command: docker run -v $(pwd):/app myapp
```

---

## Network Types

### Bridge (Default)
```
┌─────────────────────────────────────────┐
│           Docker Host                   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │    Docker Bridge Network         │  │
│  │    (docker0: 172.17.0.0/16)     │  │
│  │                                  │  │
│  │  ┌──────────┐    ┌──────────┐  │  │
│  │  │Container1│    │Container2│  │  │
│  │  │172.17.0.2│←──→│172.17.0.3│  │  │
│  │  └──────────┘    └──────────┘  │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│  ┌──────────↓───────────────────────┐  │
│  │      Host Network                │  │
│  │      eth0: 192.168.1.100         │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Custom Bridge (Service Discovery)
```
┌────────────────────────────────────────────┐
│      Custom Bridge: mynetwork              │
│                                            │
│  ┌──────────┐                ┌──────────┐ │
│  │   web    │───API calls───→│   api    │ │
│  │ (nginx)  │                │ (node.js)│ │
│  └──────────┘                └────┬─────┘ │
│                                    │       │
│                              ┌─────↓─────┐ │
│                              │    db     │ │
│                              │(postgres) │ │
│                              └───────────┘ │
│                                            │
│  Services use names: http://api/, db:5432 │
└────────────────────────────────────────────┘
```

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  DEVELOPMENT                        │
│                                                     │
│  1. Write Code                                      │
│     ├── app.py                                      │
│     └── Dockerfile                                  │
│                                                     │
│  2. Build Image                                     │
│     $ docker build -t myapp:v1 .                   │
│                                                     │
│  3. Test Locally                                    │
│     $ docker run -p 8080:8000 myapp:v1             │
│     $ curl http://localhost:8080/                  │
│                                                     │
│  4. Tag for Registry                                │
│     $ docker tag myapp:v1 username/myapp:v1        │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ 5. Push to Registry
                  │ $ docker push username/myapp:v1
                  ↓
┌─────────────────────────────────────────────────────┐
│              DOCKER HUB / REGISTRY                  │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  username/myapp:v1                           │ │
│  │  username/myapp:latest                       │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ 6. Pull on Server
                  │ $ docker pull username/myapp:v1
                  ↓
┌─────────────────────────────────────────────────────┐
│                  PRODUCTION                         │
│                                                     │
│  7. Run Container                                   │
│     $ docker run -d \                              │
│       -p 80:8000 \                                 │
│       --restart always \                           │
│       --name production-app \                      │
│       username/myapp:v1                            │
│                                                     │
│  8. Monitor                                         │
│     $ docker logs -f production-app                │
│     $ docker stats production-app                  │
│                                                     │
│  9. Scale (if needed)                              │
│     $ docker run -d -p 81:8000 username/myapp:v1  │
│     $ docker run -d -p 82:8000 username/myapp:v1  │
└─────────────────────────────────────────────────────┘
```

---

## Optimization: Layer Caching

### Bad Order (Slow Builds)
```dockerfile
FROM python:3.11-slim
WORKDIR /app

# ❌ Copy everything first
COPY . .

# Dependencies installed every time code changes
RUN pip install -r requirements.txt

CMD ["python", "app.py"]
```

```
Change app.py → Rebuild from COPY → Re-install deps (slow!)
```

### Good Order (Fast Builds)
```dockerfile
FROM python:3.11-slim
WORKDIR /app

# ✅ Copy dependencies first
COPY requirements.txt .

# Install deps (cached if requirements.txt unchanged)
RUN pip install -r requirements.txt

# Copy code last (changes frequently)
COPY . .

CMD ["python", "app.py"]
```

```
Change app.py → Only rebuild from COPY . . → Use cached deps (fast!)
```

---

## Multi-Stage Build

```dockerfile
# ════════════════════════════════════
# Stage 1: Builder (Large)
# ════════════════════════════════════
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install          # All deps including dev
COPY . .
RUN npm run build        # Build production assets

# Final image size: ~1GB
# Includes: build tools, dev deps, source code


# ════════════════════════════════════
# Stage 2: Production (Small)
# ════════════════════════════════════
FROM node:18-alpine
WORKDIR /app

# Copy only built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Final image size: ~150MB
# Includes: Only runtime + built assets

CMD ["node", "dist/server.js"]
```

**Result:**
- Builder stage: 1000 MB (discarded)
- Final image: 150 MB (85% smaller!)

---

## Command Summary

```
BUILD PHASE
  docker build -t name:tag .
  docker build --no-cache -t name:tag .
  docker tag source target

REGISTRY PHASE  
  docker login
  docker push username/repo:tag
  docker pull username/repo:tag

RUN PHASE
  docker run image
  docker run -d -p 8080:80 --name app image
  docker run --rm image  # Remove after exit
  
MANAGEMENT
  docker ps              # Running containers
  docker ps -a           # All containers
  docker images          # List images
  docker logs app        # View logs
  docker exec -it app sh # Interactive shell
  docker stop app        # Stop container
  docker start app       # Start container
  docker rm app          # Remove container
  docker rmi image       # Remove image

COMPOSE
  docker compose up -d      # Start stack
  docker compose ps         # List services
  docker compose logs       # View logs
  docker compose down       # Stop & remove

CLEANUP
  docker system prune -a    # Remove everything unused
  docker container prune    # Remove stopped containers
  docker image prune -a     # Remove unused images
```

---

## Common Patterns

### Development Container
```bash
docker run -d \
  -p 8080:8000 \
  -v $(pwd):/app \
  -e DEBUG=1 \
  --name dev-app \
  myapp:latest
```

### Production Container
```bash
docker run -d \
  -p 80:8000 \
  --restart always \
  --memory="512m" \
  --cpus="1.0" \
  -e NODE_ENV=production \
  --name prod-app \
  myapp:v1.2.0
```

### Database Container
```bash
docker run -d \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  --name postgres \
  postgres:15
```

---

**Need more details?** Check the full guides:
- [Theory Guide](theory.md) - Detailed explanations
- [Quick Start](quick-start.md) - Hands-on examples
- [Hands-on Labs](hands-on.md) - Step-by-step practice
