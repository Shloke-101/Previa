# Multi-stage Docker build for Previa (PVFC)
# Stage 1: Build the Vite Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build:vite

# Stage 2: Python FastAPI Backend + Compiled Frontend
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy compiled Vite frontend assets from Stage 1
COPY --from=frontend-builder /frontend/dist ./frontend_dist

# Expose default port
EXPOSE 10000

# Render provides $PORT dynamically
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
