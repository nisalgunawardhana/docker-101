Docker Command Cheat Sheet
==========================

Lifecycle basics
----------------
- Build image: `docker build -t <name>:<tag> .`
- Run container: `docker run --rm -d --name <name> -p 8080:80 <image>`
- Stop container: `docker stop <name>`; remove: `docker rm <name>`
- Pull image: `docker pull <repo>:<tag>`; push: `docker push <repo>:<tag>`

Inspect and debug
-----------------
- List running: `docker ps`; all: `docker ps -a`
- Logs: `docker logs -f <name>`
- Exec a shell: `docker exec -it <name> sh` (or `bash`)
- Inspect: `docker inspect <name-or-id>`
- Stats: `docker stats`

Images and layers
-----------------
- List images: `docker images`
- Remove image: `docker rmi <image>`
- History: `docker history <image>`
- Save/load tarball: `docker save <image> > image.tar`; `docker load < image.tar`

Networking
----------
- List networks: `docker network ls`
- Create bridge network: `docker network create dev-net`
- Run on network: `docker run --rm --network dev-net <image>`
- Inspect network: `docker network inspect <network>`

Volumes and mounts
------------------
- List volumes: `docker volume ls`
- Create: `docker volume create data`
- Run with volume: `docker run --rm -v data:/var/lib/app <image>`
- Bind mount source: `docker run --rm -v $(pwd)/src:/app/src <image>`

Compose
-------
- Up in background: `docker compose up -d`
- Down and remove volumes: `docker compose down -v`
- Rebuild service: `docker compose build <service>`
- Run one-off command: `docker compose run --rm <service> <cmd>`
- Logs: `docker compose logs -f <service>`

Cleanup
-------
- Remove stopped containers: `docker container prune`
- Remove unused images: `docker image prune`
- Remove unused everything: `docker system prune`
- Free disk usage report: `docker system df`
