# Docker Quick Start Guide

## Essential Workflow: Create Image → Run Container → Push to Registry

This guide covers the **three main tasks** you'll perform with Docker.

---

## Task 1: Create a Docker Image

### What You Need
1. Your application code
2. A `Dockerfile` with build instructions

### Example: Simple Python App

**Create `app.py`:**
```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        response = {"message": "Hello from Docker!"}
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8000), Handler)
    print("Server running on port 8000")
    server.serve_forever()
```

**Create `Dockerfile`:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]
```

**Build the image:**
```bash
docker build -t myapp:v1.0 .
```

**Verify image was created:**
```bash
docker images
```

### Key Points
✅ `FROM` - Base image (Python, Node, etc.)  
✅ `WORKDIR` - Working directory inside container  
✅ `COPY` - Copy files from host to image  
✅ `EXPOSE` - Document which port app uses  
✅ `CMD` - Command to run when container starts  

---

## Task 2: Create and Run a Container

### Basic Run
```bash
docker run myapp:v1.0
```

### Run with Common Options
```bash
docker run -d -p 8080:8000 --name myapp myapp:v1.0
```

**Options explained:**
- `-d` = Detached mode (run in background)
- `-p 8080:8000` = Map host port 8080 to container port 8000
- `--name myapp` = Give container a friendly name
- `myapp:v1.0` = Image to use

### Test Your Container
```bash
# Check if running
docker ps

# Test the application
curl http://localhost:8080/

# View logs
docker logs myapp

# View real-time logs
docker logs -f myapp
```

### Container Management
```bash
# Stop container
docker stop myapp

# Start stopped container
docker start myapp

# Restart container
docker restart myapp

# Remove container
docker rm myapp

# Force remove running container
docker rm -f myapp
```

### Execute Commands in Running Container
```bash
# Run single command
docker exec myapp ls -la

# Get interactive shell
docker exec -it myapp sh
# or bash if available
docker exec -it myapp bash
```

### Key Points
✅ `-d` runs container in background  
✅ `-p` maps ports (host:container)  
✅ `--name` makes management easier  
✅ Container keeps running as long as main process runs  
✅ Use `docker logs` to debug issues  

---

## Task 3: Push Image to Registry

### Prerequisite: Docker Hub Account
Sign up at https://hub.docker.com/signup (free)

### Step 1: Login
```bash
docker login
```
Enter your Docker Hub username and password.

### Step 2: Tag Your Image
Format: `username/repository:tag`

```bash
docker tag myapp:v1.0 YOUR_USERNAME/myapp:v1.0
docker tag myapp:v1.0 YOUR_USERNAME/myapp:latest
```

**Why tag twice?**
- `v1.0` = Specific version
- `latest` = Most recent version (convention)

### Step 3: Push to Registry
```bash
docker push YOUR_USERNAME/myapp:v1.0
docker push YOUR_USERNAME/myapp:latest
```

### Step 4: Verify on Docker Hub
1. Go to https://hub.docker.com
2. Login and check "Repositories"
3. You should see your image!

### Pull Your Image (Test)
```bash
# Remove local copies
docker rmi YOUR_USERNAME/myapp:v1.0
docker rmi YOUR_USERNAME/myapp:latest

# Pull from registry
docker pull YOUR_USERNAME/myapp:latest

# Run pulled image
docker run -d -p 8080:8000 YOUR_USERNAME/myapp:latest
```

### Alternative: GitHub Container Registry

**Login:**
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

**Tag:**
```bash
docker tag myapp:v1.0 ghcr.io/YOUR_USERNAME/myapp:v1.0
```

**Push:**
```bash
docker push ghcr.io/YOUR_USERNAME/myapp:v1.0
```

### Key Points
✅ Must tag with `username/repo:tag` format  
✅ Login before pushing  
✅ Anyone can pull public images  
✅ Use private repos for sensitive code  
✅ Layers are cached (efficient push/pull)  

---

## Complete Example Workflow

```bash
# 1. Create application
mkdir myapp && cd myapp
echo 'print("Hello Docker")' > app.py

# 2. Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY app.py .
CMD ["python", "app.py"]
EOF

# 3. Build image
docker build -t myapp:v1.0 .

# 4. Test locally
docker run --rm myapp:v1.0

# 5. Tag for registry
docker tag myapp:v1.0 YOUR_USERNAME/myapp:v1.0

# 6. Login and push
docker login
docker push YOUR_USERNAME/myapp:v1.0

# 7. Pull and run from registry
docker pull YOUR_USERNAME/myapp:v1.0
docker run --rm YOUR_USERNAME/myapp:v1.0
```

---

## Common Commands Cheatsheet

### Images
```bash
docker images              # List images
docker build -t name:tag . # Build image
docker rmi image           # Remove image
docker tag src dst         # Tag image
docker push image          # Push to registry
docker pull image          # Pull from registry
```

### Containers
```bash
docker ps                  # List running containers
docker ps -a               # List all containers
docker run image           # Create and start container
docker start container     # Start stopped container
docker stop container      # Stop container
docker restart container   # Restart container
docker rm container        # Remove container
docker logs container      # View logs
docker exec -it container sh  # Interactive shell
```

### Cleanup
```bash
docker system df           # Show disk usage
docker container prune     # Remove stopped containers
docker image prune -a      # Remove unused images
docker volume prune        # Remove unused volumes
docker system prune -a     # Remove everything unused
```

---

## Dockerfile Best Practices

1. **Use specific base image tags**
   ```dockerfile
   FROM python:3.11-slim  # Good
   FROM python            # Avoid (uses latest)
   ```

2. **Order by change frequency**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .     # Dependencies first
   RUN pip install -r requirements.txt
   COPY . .                    # Code last (changes often)
   ```

3. **Minimize layers**
   ```dockerfile
   RUN apt-get update && \
       apt-get install -y curl vim && \
       rm -rf /var/lib/apt/lists/*
   ```

4. **Use .dockerignore**
   ```
   __pycache__
   *.pyc
   .git
   node_modules
   .env
   ```

5. **Run as non-root**
   ```dockerfile
   RUN adduser --disabled-password appuser
   USER appuser
   ```

---

## Multi-Container Apps (Docker Compose)

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:8000"
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

**Commands:**
```bash
docker compose up -d       # Start all services
docker compose ps          # List services
docker compose logs        # View logs
docker compose down        # Stop and remove
```

---

## Troubleshooting

### Port already in use
```bash
docker run -p 8081:8000 myapp  # Use different host port
```

### Permission denied
```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

### Container exits immediately
```bash
docker logs container-name  # Check logs for errors
```

### Build cache issues
```bash
docker build --no-cache -t myapp .
```

### Can't connect to Docker daemon
```bash
# Ensure Docker Desktop/Engine is running
sudo systemctl start docker  # Linux
```

---

## Next Steps

1. ✅ Complete [hands-on labs](hands-on.md)
2. ✅ Read [comprehensive theory](theory.md)
3. ✅ Practice with real projects
4. ✅ Learn Docker Compose for multi-container apps
5. ✅ Explore Docker networking and volumes
6. ✅ Study Kubernetes for production orchestration

**Need help?** Check the [comprehensive hands-on guide](hands-on.md) for detailed walkthroughs!
