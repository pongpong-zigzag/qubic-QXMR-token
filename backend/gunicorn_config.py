# Gunicorn configuration file
import multiprocessing
import os

# Server socket
bind = "127.0.0.1:5000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = "/var/log/gunicorn/backend_access.log"
errorlog = "/var/log/gunicorn/backend_error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "qxmr_backend"

# Server mechanics
daemon = False
pidfile = "/var/run/gunicorn/backend.pid"
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed in future)
# keyfile = None
# certfile = None

