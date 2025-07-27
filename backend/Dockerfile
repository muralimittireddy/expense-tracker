# backend/Dockerfile
# Use an official Python runtime as a parent image, based on a more recent Debian release
FROM python:3.11-slim-bookworm

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for psycopg2
# Using --no-install-recommends to keep image size smaller
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    gcc \
    # Clean up apt cache to reduce image size
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY ./app /app/app

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# Use 0.0.0.0 to make it accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
