# Custom Docker Application - Lab 3

This is a simple Node.js/Express application for learning Docker image creation and optimization.

## Features

- Express web server
- Health check endpoint
- Environment information
- Graceful shutdown
- Security best practices (non-root user)
- Docker healthcheck configuration

## Endpoints

- `GET /` - Main endpoint with app info
- `GET /health` - Health check endpoint
- `GET /env` - Environment information

## Building the Image

### Standard Build
```bash
docker build -t custom-app:v1.0 .
```

### Optimized Multi-stage Build
```bash
docker build -f Dockerfile.optimized -t custom-app:v1.0-optimized .
```

## Running the Container

```bash
docker run -d -p 3000:3000 --name custom custom-app:v1.0
```

## Testing

```bash
# Test main endpoint
curl http://localhost:3000/

# Test health check
curl http://localhost:3000/health

# Test environment info
curl http://localhost:3000/env
```

## Comparing Image Sizes

```bash
docker images | grep custom-app
```

You should see that the optimized multi-stage build produces a smaller image.

## Security Features

1. **Non-root user**: Container runs as `nodejs` user, not root
2. **Minimal base image**: Uses Alpine Linux (smaller attack surface)
3. **Production dependencies only**: No dev dependencies in final image
4. **Healthcheck**: Docker can automatically monitor container health

## Clean up

```bash
docker rm -f custom
docker rmi custom-app:v1.0 custom-app:v1.0-optimized
```
