Docker Basics
=============

Why Docker
----------
Docker packages applications and their dependencies into containers so they run the same way anywhere: local laptops, CI, or production clusters.

Key terms
---------
- Image: Immutable, layered filesystem plus metadata (entrypoint, environment). Think of it as a build artifact or template.
- Container: A runnable instance of an image with its own process tree, network stack, and mounts.
- Registry: Server that stores and distributes images (Docker Hub, GHCR, ECR, etc.).
- Dockerfile: Declarative recipe for building an image.
- Compose: Tool for defining and running multi-container stacks locally.

What containerization means
---------------------------
- Isolation: Linux namespaces isolate PIDs, network, mounts, and hostname so processes think they have their own OS view.
- Resource control: cgroups limit CPU, memory, and I/O so containers cannot starve the host.
- Layering: Union filesystems stack layers (base image, app deps, app code) to reuse and share bytes efficiently.
- Immutability: Images are content-addressed; if an image digest is known, every copy is identical.

<div style="background-color: white; display: inline-block;">

![Docker workflow diagram](/images/image1.png)

</div>

How Docker works (high level)
-----------------------------
1) Build: Docker reads a `Dockerfile`, sends the context, and produces an image (a set of layers + config).
2) Store: Images are tagged (`repo:tag`) and optionally pushed to a registry.
3) Run: Docker creates a thin writable layer on top of the image and starts the container process with configured environment, mounts, and networking.
4) Share/scale: The same image runs anywhere the runtime exists (local, CI, Kubernetes nodes, cloud VMs).

![Docker workflow diagram](/images/image2.png)



When to use containers
----------------------
- Consistent dev environments across teammates.
- Shipping microservices with explicit dependencies.
- Reproducible CI builds and tests.
- Packaging CLIs and tools without polluting the host.

Image vs. container in practice
-------------------------------
- Image: build-time artifact; version with tags (`1.0`, `2024-05-01`, `sha256:...`), sign, scan, and push.
- Container: runtime instance; inspect logs, stats, networks, and volumes; kill or restart without touching the image.

Typical workflow
----------------
1) Write a Dockerfile that sets a base image, copies code, installs deps, and declares a command.
2) Build: `docker build -t myapp:dev .`
3) Run locally: `docker run --rm -p 8080:8080 myapp:dev`
4) Iterate: change code, rebuild, rerun.
5) Ship: `docker tag myapp:dev ghcr.io/org/myapp:dev && docker push ghcr.io/org/myapp:dev`
6) Orchestrate: use Compose for local multi-service or Kubernetes/Swarm in prod.

Security and hygiene tips
-------------------------
- Use minimal bases (e.g., `alpine`, `distroless`) when possible.
- Pin versions and avoid running as root in the container.
- Keep secrets out of images; pass via env or secrets management.
- Clean up unused images and containers (`docker system prune`) to save disk.
