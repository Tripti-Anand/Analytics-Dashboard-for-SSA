FROM python:3.10

# Install system dependencies (THIS FIXES YOUR ERROR)
RUN apt-get update && apt-get install -y \
    gfortran \
    build-essential \
    libatlas-base-dev \
    liblapack-dev \
    libopenblas-dev

# Set working directory
WORKDIR /app

# Copy backend files
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
