FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /code
RUN apt-get update && apt-get install -y build-essential libpq-dev curl netcat-openbsd && rm -rf /var/lib/apt/lists/*
COPY ./requirements.txt /code/
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . /code
# Optimize Gunicorn for high-latency external connections (e.g. SMTP handshakes on Free Tier)
ENV GUNICORN_CMD_ARGS="--timeout 120 --workers 2 --threads 4 --worker-class gthread --log-level debug --access-logfile -"
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
