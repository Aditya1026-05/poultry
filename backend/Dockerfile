# 1. Official Python 3.11 slim base image
FROM python:3.11-slim

# 2. Prevent Python from buffering stdout/stderr and writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Create an unprivileged non-root user early
RUN useradd -m -u 1000 appuser

# 5. Install dependencies separately to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copy application code directly with non-root ownership
COPY --chown=appuser:appuser ./app ./app

# 7. Switch to the unprivileged user for runtime security
USER appuser

# 8. Document the internal port Uvicorn listens on
EXPOSE 8000

# 9. Start FastAPI with Uvicorn bound to all interfaces
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
