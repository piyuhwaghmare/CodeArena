# Minimal Python — no extra packages
# slim = smaller image = faster container startup
FROM python:3.11-slim

# Create non-root user — SECURITY
# Never run user code as root inside container
RUN useradd -m sandbox_user

# Switch to that user
USER sandbox_user

# Working directory
WORKDIR /sandbox

# Default command (will be overridden at runtime)
CMD ["python3"]