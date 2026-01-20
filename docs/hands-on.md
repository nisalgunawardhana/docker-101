# Docker Hands-on Labs

Complete these labs in order to master Docker fundamentals. Each lab builds on previous concepts. Capture screenshots where noted and save them under `submission/screenshots/`.

---

## Lab 1: Run Your First Container

**Goal:** Understand Docker images and containers by running pre-built images.

### Theory Review
- **Docker Image**: A template/snapshot containing code and dependencies
- **Docker Container**: A running instance of an image
- **Docker Hub**: Public registry storing thousands of ready-to-use images

### Steps

#### 1.1 Run Hello World
```bash
docker run hello-world
```

**What happens:**
- Docker checks for `hello-world` image locally
- If not found, downloads from Docker Hub
- Creates a container from the image
- Runs the container (prints message)
- Container exits

#### 1.2 View Downloaded Images
```bash
docker images
```
You should see `hello-world` in the list.

#### 1.3 View Container History
```bash
docker ps -a
```
Shows all containers (including stopped ones). You'll see the `hello-world` container.

#### 1.4 Run with Auto-Remove
```bash
docker run --rm hello-world
```
The `--rm` flag automatically removes the container after it exits.

#### 1.5 Try Another Image
```bash
docker run --rm alpine echo "Hello from Alpine!"
```
Alpine is a minimal Linux distribution (only 5MB!).

### Screenshots to Capture
- `01-hello-world-output.png` — Terminal showing hello-world output
- `02-docker-images.png` — Output of `docker images`
- `03-docker-ps-a.png` — Output of `docker ps -a`

### Key Takeaways
✅ Images are templates stored locally or in registries  
✅ Containers are running instances that can start and stop  
✅ `docker run` pulls images automatically if not found locally  
✅ Containers exit when their main process finishes

---

## Lab 2: Build Your First Docker Image

**Goal:** Create a custom Docker image from a Dockerfile and run it as a container.

### Theory Review
- **Dockerfile**: Text file with instructions to build an image
- **docker build**: Command to create image from Dockerfile
- **Image layers**: Each Dockerfile instruction creates a layer
- **Port mapping**: Connect host port to container port

### Steps

#### 2.1 Examine the Application
Navigate to the lab directory:
```bash
cd labs/hello-docker
ls
```

You'll see:
- `app.py` — Simple Python web server
- `Dockerfile` — Instructions to build the image

View the Dockerfile:
```bash
cat Dockerfile
```

**Dockerfile breakdown:**
```dockerfile
FROM python:3.11-slim        # Start with Python 3.11 base image
WORKDIR /app                  # Set working directory
COPY app.py .                 # Copy our app into the image
EXPOSE 8000                   # Document that app uses port 8000
CMD ["python", "app.py"]      # Command to run when container starts
```

#### 2.2 Build the Image
```bash
docker build -t hello-docker:v1 .
```

**Command breakdown:**
- `docker build` — Build an image
- `-t hello-docker:v1` — Tag it with name:version
- `.` — Use current directory as build context (where Dockerfile is)

**Watch the output** — each line shows a layer being built:
1. Download Python base image
2. Set working directory
3. Copy app.py
4. Set metadata (EXPOSE, CMD)

#### 2.3 Verify Image Was Created
```bash
docker images
```
You should see `hello-docker` with tag `v1`.

#### 2.4 Inspect the Image
```bash
docker inspect hello-docker:v1
```
Shows detailed JSON about the image (size, layers, configuration, etc.).

#### 2.5 View Image History
```bash
docker history hello-docker:v1
```
Shows all layers and their sizes.

#### 2.6 Run a Container from Your Image
```bash
docker run -d -p 8080:8000 --name myapp hello-docker:v1
```

**Command breakdown:**
- `-d` — Detached mode (runs in background)
- `-p 8080:8000` — Map host port 8080 to container port 8000
- `--name myapp` — Give container a friendly name
- `hello-docker:v1` — Image to use

#### 2.7 Verify Container is Running
```bash
docker ps
```
Should show `myapp` container running.

#### 2.8 Test the Application
```bash
curl http://localhost:8080/
```
You should get a JSON response from the app!

Open in browser: http://localhost:8080/

#### 2.9 View Container Logs
```bash
docker logs myapp
```
Shows the Python server output.

#### 2.10 View Real-time Logs
```bash
docker logs -f myapp
```
Then refresh your browser. You'll see new requests logged (Ctrl+C to exit).

#### 2.11 Execute Command Inside Container
```bash
docker exec myapp ls -la /app
```
Lists files inside the running container.

Get interactive shell:
```bash
docker exec -it myapp sh
```
Now you're inside the container! Try:
```bash
pwd
ls
ps
exit
```

#### 2.12 Stop the Container
```bash
docker stop myapp
```

#### 2.13 Start it Again
```bash
docker start myapp
docker ps
```
Container starts with the same configuration.

#### 2.14 Remove Container
```bash
docker rm -f myapp
```
The `-f` flag forces removal even if running.

### Screenshots to Capture
- `04-build-output.png` — Docker build process showing layers
- `05-docker-images-custom.png` — Your hello-docker image listed
- `06-container-running.png` — `docker ps` showing running container
- `07-curl-response.png` — Successful curl/browser response
- `08-docker-logs.png` — Container logs

### Key Takeaways
✅ Dockerfiles define how to build images  
✅ Each instruction creates a cached layer  
✅ Use `-p` to map ports and access containerized apps  
✅ Containers can be stopped/started without rebuilding  
✅ Use `docker exec` to run commands in running containers

---

## Lab 3: Create and Customize Your Own Image

**Goal:** Build a more complex application from scratch with custom configuration.

### Steps

#### 3.1 Create a New Application
Create a new directory:
```bash
mkdir -p labs/custom-app
cd labs/custom-app
```

#### 3.2 Create a Simple Node.js App
Create `package.json`:
```bash
cat > package.json << 'EOF'
{
  "name": "custom-app",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF
```

Create `server.js`:
```bash
cat > server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Custom Docker App',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
EOF
```

#### 3.3 Create Dockerfile
```bash
cat > Dockerfile << 'EOF'
# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run as non-root user
USER node

# Start application
CMD ["node", "server.js"]
EOF
```

#### 3.4 Create .dockerignore
```bash
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.env
*.md
EOF
```

#### 3.5 Build the Image
```bash
docker build -t custom-app:v1.0 .
```

#### 3.6 Run the Container
```bash
docker run -d -p 3000:3000 --name custom custom-app:v1.0
```

#### 3.7 Test the Application
```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

#### 3.8 Build Optimized Version
Create `Dockerfile.optimized`:
```bash
cat > Dockerfile.optimized << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
EOF
```

Build and compare sizes:
```bash
docker build -f Dockerfile.optimized -t custom-app:v1.0-optimized .
docker images | grep custom-app
```

#### 3.9 Cleanup
```bash
docker rm -f custom
```

### Screenshots to Capture
- `09-custom-build.png` — Building custom application
- `10-custom-running.png` — Application responding
- `11-image-comparison.png` — Size comparison of images

### Key Takeaways
✅ Multi-stage builds reduce image size  
✅ .dockerignore prevents unnecessary files in images  
✅ Always run containers as non-root for security  
✅ Add healthchecks for production containers  
✅ Copy dependencies before code for better caching

---

## Lab 4: Push Image to Docker Hub

**Goal:** Share your Docker image by pushing to Docker Hub registry.

### Theory Review
- **Docker Hub**: Public registry for Docker images
- **Image tagging**: Format is `username/repository:tag`
- **docker push**: Uploads image to registry
- **docker pull**: Downloads image from registry

### Prerequisites
- Docker Hub account (free): https://hub.docker.com/signup

### Steps

#### 4.1 Login to Docker Hub
```bash
docker login
```
Enter your Docker Hub username and password.

#### 4.2 Tag Your Image
Replace `YOUR_USERNAME` with your Docker Hub username:
```bash
docker tag hello-docker:v1 YOUR_USERNAME/hello-docker:v1
docker tag hello-docker:v1 YOUR_USERNAME/hello-docker:latest
```

**Why two tags?**
- `v1` — Specific version for version control
- `latest` — Conventional tag for the most recent version

#### 4.3 Verify Tags
```bash
docker images | grep hello-docker
```
You should see multiple tags pointing to the same image.

#### 4.4 Push to Docker Hub
```bash
docker push YOUR_USERNAME/hello-docker:v1
docker push YOUR_USERNAME/hello-docker:latest
```

**Watch the upload:**
- Each layer is pushed separately
- Already existing layers are skipped (efficient!)

#### 4.5 Verify on Docker Hub
1. Open https://hub.docker.com
2. Login and go to "Repositories"
3. You should see `hello-docker`
4. Click it to view tags and details

#### 4.6 Test Pulling Your Image
Remove local images:
```bash
docker rmi YOUR_USERNAME/hello-docker:v1
docker rmi YOUR_USERNAME/hello-docker:latest
docker images | grep hello-docker
```

Pull from Docker Hub:
```bash
docker pull YOUR_USERNAME/hello-docker:latest
```

#### 4.7 Run Downloaded Image
```bash
docker run -d -p 8080:8000 --name shared-app YOUR_USERNAME/hello-docker:latest
curl http://localhost:8080/
```

#### 4.8 Make Image Private (Optional)
1. Go to Docker Hub
2. Click your repository
3. Settings → Make Private

#### 4.9 Push Custom App Too
```bash
docker tag custom-app:v1.0 YOUR_USERNAME/custom-app:v1.0
docker push YOUR_USERNAME/custom-app:v1.0
```

#### 4.10 Cleanup
```bash
docker rm -f shared-app
docker logout
```

### Alternative: Push to GitHub Container Registry

If you prefer GitHub Container Registry (ghcr.io):

```bash
# Login with GitHub token
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Tag for GHCR
docker tag hello-docker:v1 ghcr.io/YOUR_USERNAME/hello-docker:v1

# Push
docker push ghcr.io/YOUR_USERNAME/hello-docker:v1
```

### Screenshots to Capture
- `12-docker-login.png` — Successful login
- `13-docker-push.png` — Pushing layers to registry
- `14-dockerhub-repo.png` — Your repository on Docker Hub
- `15-docker-pull.png` — Pulling your image from registry

### Key Takeaways
✅ Images must be tagged with `username/repo:tag` format to push  
✅ Use `latest` tag for the current stable version  
✅ Layers are shared between images (efficient storage)  
✅ Anyone can pull your public images  
✅ Private repositories require authentication to pull

---

## Lab 5: Docker Compose Multi-Container Application

**Goal:** Run multiple containers together as a complete application stack.

### Theory Review
- **Docker Compose**: Tool for multi-container applications
- **docker-compose.yml**: YAML file defining services
- **Services**: Containers that make up your application
- **Networks**: Automatic network for service communication

### Steps

#### 5.1 Navigate to Compose Demo
```bash
cd ../../labs/compose-demo
```

#### 5.2 Examine docker-compose.yml
```bash
cat docker-compose.yml
```

#### 5.3 Start the Stack
```bash
docker compose up -d
```

**What happens:**
- Creates network for services
- Pulls/builds required images
- Starts all services in order
- Returns control (detached mode)

#### 5.4 Check Running Services
```bash
docker compose ps
```

#### 5.5 View Logs
```bash
docker compose logs
```

Specific service:
```bash
docker compose logs nginx
```

#### 5.6 Test the Application
```bash
curl http://localhost:8081/
```

#### 5.7 Scale a Service (if applicable)
```bash
docker compose up -d --scale redis=2
```

#### 5.8 Stop Services
```bash
docker compose stop
```

#### 5.9 Start Again
```bash
docker compose start
```

#### 5.10 View Service Details
```bash
docker compose ps
docker network ls | grep compose-demo
docker volume ls | grep compose-demo
```

#### 5.11 Execute Commands in Service
```bash
docker compose exec nginx sh
```

#### 5.12 Complete Teardown
```bash
docker compose down
```

Remove with volumes:
```bash
docker compose down -v
```

### Create Your Own Compose Application

Create `labs/my-stack/docker-compose.yml`:
```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    depends_on:
      - api
    networks:
      - frontend

  api:
    build: .
    environment:
      - DB_HOST=db
      - DB_NAME=myapp
    depends_on:
      - db
    networks:
      - frontend
      - backend

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - backend

volumes:
  db-data:

networks:
  frontend:
  backend:
```

### Screenshots to Capture
- `16-compose-up.png` — Services starting
- `17-compose-ps.png` — Running services
- `18-compose-logs.png` — Service logs
- `19-compose-test.png` — Testing the application

### Key Takeaways
✅ Compose manages multiple containers with one command  
✅ Services communicate via service names (DNS)  
✅ Compose creates isolated networks automatically  
✅ Use `depends_on` to control startup order  
✅ Perfect for development environments

---

## Complete Workflow: Build, Run, Push

**Final Challenge:** Create a complete workflow from scratch.

### Challenge Steps

1. **Create a simple web app** (any language)
2. **Write a Dockerfile** to containerize it
3. **Build the image** with proper tags
4. **Run and test** the container
5. **Push to Docker Hub** or GHCR
6. **Create a docker-compose.yml** with your app + a database
7. **Document** with a README

### Example Complete Workflow

```bash
# 1. Create app
mkdir my-app && cd my-app
# (create your application files)

# 2. Create Dockerfile
# (write Dockerfile)

# 3. Build
docker build -t my-app:1.0 .

# 4. Test locally
docker run -d -p 8080:8080 --name test-app my-app:1.0
curl http://localhost:8080

# 5. Tag for registry
docker tag my-app:1.0 YOUR_USERNAME/my-app:1.0
docker tag my-app:1.0 YOUR_USERNAME/my-app:latest

# 6. Push
docker login
docker push YOUR_USERNAME/my-app:1.0
docker push YOUR_USERNAME/my-app:latest

# 7. Create compose file
# (create docker-compose.yml)

# 8. Test compose stack
docker compose up -d
docker compose ps
docker compose logs

# 9. Cleanup
docker compose down -v
docker rm -f test-app
```

### Key Commands Summary

| Task | Command |
|------|---------|
| **Build image** | `docker build -t name:tag .` |
| **Run container** | `docker run -d -p 8080:80 --name app image` |
| **List containers** | `docker ps` or `docker ps -a` |
| **View logs** | `docker logs app` |
| **Execute command** | `docker exec -it app sh` |
| **Stop container** | `docker stop app` |
| **Remove container** | `docker rm app` |
| **Tag image** | `docker tag image user/image:tag` |
| **Push image** | `docker push user/image:tag` |
| **Start compose** | `docker compose up -d` |
| **Stop compose** | `docker compose down` |

---

## Troubleshooting

### Port Already in Use
```bash
# Change host port
docker run -p 8081:8000 myapp
```

### Permission Denied
```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
# Then logout and login
```

### Build Cache Issues
```bash
# Build without cache
docker build --no-cache -t myapp .
```

### Container Won't Stop
```bash
# Force stop
docker kill myapp
```

### Remove All Stopped Containers
```bash
docker container prune
```

### Remove All Unused Images
```bash
docker image prune -a
```

### View Disk Usage
```bash
docker system df
```

### Clean Everything
```bash
docker system prune -a --volumes
```

---

## Completion Checklist

- [ ] Lab 1: Run and understand containers
- [ ] Lab 2: Build custom Docker image
- [ ] Lab 3: Create optimized application
- [ ] Lab 4: Push image to registry
- [ ] Lab 5: Run multi-container with Compose
- [ ] All screenshots captured and saved
- [ ] Understand image vs container
- [ ] Know how to troubleshoot common issues

**Congratulations!** You now understand Docker fundamentals and can build, run, and share containerized applications. 🎉
