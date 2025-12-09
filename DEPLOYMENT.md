# QXMR Deployment Guide

This guide will help you deploy the QXMR application to production using Gunicorn, Nginx, and systemd.

## Prerequisites

- Ubuntu/Debian Linux server
- Root or sudo access
- Domain names configured:
  - `frontend.qxmr.quest`
  - `backend.qxmr.quest`
  - `admin.qxmr.quest`
- SSL certificates for all domains

## Step 1: Install Dependencies

### Install System Packages

```bash
# Update system
apt update && apt upgrade -y

# Install Python and pip
apt install -y python3 python3-pip python3-venv

# Install Node.js and npm (using NodeSource repository for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install Gunicorn
pip3 install gunicorn
```

## Step 2: Deploy Application

### Run Deployment Script

```bash
cd /var/website
chmod +x deploy.sh
./deploy.sh
```

Or manually:

```bash
# Install Python dependencies
cd /var/website/backend
pip3 install -r requirements.txt

# Install Node.js dependencies
cd /var/website
npm install

# Build frontend
npm run build

# Build admin
npm run build:admin
```

## Step 3: Configure SSL Certificates

Place your SSL certificates in the following locations:

- Backend: `/etc/ssl/certs/backend.qxmr.quest.crt` and `/etc/ssl/private/backend.qxmr.quest.key`
- Frontend: `/etc/ssl/certs/frontend.qxmr.quest.crt` and `/etc/ssl/private/frontend.qxmr.quest.key`
- Admin: `/etc/ssl/certs/admin.qxmr.quest.crt` and `/etc/ssl/private/admin.qxmr.quest.key`

**Note:** If using Let's Encrypt with Certbot, certificates will be in `/etc/letsencrypt/live/domain/`

Update the nginx configuration files to point to the correct certificate paths.

## Step 4: Configure Nginx

Nginx configuration files have been created in:
- `/etc/nginx/sites-available/backend.qxmr.quest`
- `/etc/nginx/sites-available/frontend.qxmr.quest`
- `/etc/nginx/sites-available/admin.qxmr.quest`

Symlinks have been created in `/etc/nginx/sites-enabled/`

### Update SSL Certificate Paths

If using Let's Encrypt, update the SSL certificate paths in each nginx config:

```bash
# Example for Let's Encrypt
sed -i 's|/etc/ssl/certs/backend.qxmr.quest.crt|/etc/letsencrypt/live/backend.qxmr.quest/fullchain.pem|g' /etc/nginx/sites-available/backend.qxmr.quest
sed -i 's|/etc/ssl/private/backend.qxmr.quest.key|/etc/letsencrypt/live/backend.qxmr.quest/privkey.pem|g' /etc/nginx/sites-available/backend.qxmr.quest
```

### Test Nginx Configuration

```bash
nginx -t
```

### Reload Nginx

```bash
systemctl reload nginx
```

## Step 5: Start Backend Service

### Start and Enable Backend

```bash
# Start the service
systemctl start qxmr-backend

# Enable to start on boot
systemctl enable qxmr-backend

# Check status
systemctl status qxmr-backend

# View logs
journalctl -u qxmr-backend -f
```

## Step 6: Verify Deployment

### Check Services

```bash
# Check backend service
systemctl status qxmr-backend

# Check nginx
systemctl status nginx

# Check if gunicorn is running
ps aux | grep gunicorn
```

### Test Endpoints

```bash
# Test backend health
curl https://backend.qxmr.quest/health

# Test frontend (should return HTML)
curl -I https://frontend.qxmr.quest

# Test admin (should return HTML)
curl -I https://admin.qxmr.quest
```

## Step 7: Environment Variables (Optional)

If you need to override default URLs, create `.env` files:

### Frontend `.env`

```bash
cd /var/website
cat > .env << EOF
VITE_BACKEND_URL=https://backend.qxmr.quest
VITE_QUBIC_API_KEY=your_api_key_here
VITE_QUBIC_API_SECRET=your_api_secret_here
EOF
```

### Admin `.env`

```bash
cd /var/website/admin
cat > .env << EOF
VITE_BACKEND_URL=https://backend.qxmr.quest
EOF
```

**Note:** After updating `.env` files, rebuild the applications:
```bash
cd /var/website
npm run build
npm run build:admin
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
journalctl -u qxmr-backend -n 50

# Check if port 5000 is in use
netstat -tlnp | grep 5000

# Test gunicorn manually
cd /var/website/backend
gunicorn --config gunicorn_config.py wsgi:app
```

### Nginx Errors

```bash
# Check nginx error logs
tail -f /var/log/nginx/backend.qxmr.quest.error.log
tail -f /var/log/nginx/frontend.qxmr.quest.error.log
tail -f /var/log/nginx/admin.qxmr.quest.error.log

# Test configuration
nginx -t
```

### Permission Issues

```bash
# Ensure proper permissions
chown -R root:root /var/website
chmod -R 755 /var/website

# Ensure log directories exist
mkdir -p /var/log/gunicorn
chmod 755 /var/log/gunicorn
```

## Maintenance

### Update Application

```bash
cd /var/website
git pull  # If using git
./deploy.sh
systemctl restart qxmr-backend
systemctl reload nginx
```

### View Logs

```bash
# Backend logs
journalctl -u qxmr-backend -f

# Gunicorn logs
tail -f /var/log/gunicorn/backend_access.log
tail -f /var/log/gunicorn/backend_error.log

# Nginx logs
tail -f /var/log/nginx/*.access.log
tail -f /var/log/nginx/*.error.log
```

## Security Notes

1. **Firewall**: Ensure ports 80 and 443 are open
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

2. **SSL**: Always use HTTPS in production

3. **Database**: The SQLite databases are in `/var/website/backend/`. Consider backing them up regularly.

4. **Secrets**: Keep API keys and secrets secure. Never commit them to version control.

## Domain Configuration

Make sure your DNS records point to your server:

- `frontend.qxmr.quest` → Your server IP
- `backend.qxmr.quest` → Your server IP
- `admin.qxmr.quest` → Your server IP

## Support

For issues or questions, check:
- Backend logs: `journalctl -u qxmr-backend`
- Nginx logs: `/var/log/nginx/`
- Gunicorn logs: `/var/log/gunicorn/`

