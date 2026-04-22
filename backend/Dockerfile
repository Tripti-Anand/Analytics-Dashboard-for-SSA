FROM python:3.12

# Install system dependencies (ALL required for scipy, sunpy, cv2)
RUN apt-get update && apt-get install -y \
    gfortran \
    build-essential \
    liblapack-dev \
    libopenblas-dev \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend files
COPY . .

# Upgrade pip
RUN pip install --upgrade pip

# Install Python dependencies
RUN pip install -r requirements.txt

# Expose port
EXPOSE 10000

# Run FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
