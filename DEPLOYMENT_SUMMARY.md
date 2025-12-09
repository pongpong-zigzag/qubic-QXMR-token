# QXMR Deployment Summary

## ✅ Completed Setup Steps

### 1. Backend Configuration
- ✅ Added Gunicorn to `backend/requirements.txt`
- ✅ Created `backend/gunicorn_config.py` with production settings
- ✅ Created `backend/wsgi.py` as WSGI entry point
- ✅ Created systemd service `/etc/systemd/system/qxmr-backend.service`
- ✅ Created log directories `/var/log/gunicorn` and `/var/run/gunicorn`

### 2. Nginx Configuration
- ✅ Created nginx config for `backend.qxmr.quest`
- ✅ Created nginx config for `frontend.qxmr.quest`
- ✅ Created nginx config for `admin.qxmr.quest`
- ✅ Created symlinks in `/etc/nginx/sites-enabled/`

### 3. Code Updates
- ✅ Updated `src/services/backend.service.ts` to use `https://backend.qxmr.quest`
- ✅ Updated `admin/services/admin.service.ts` to use `https://backend.qxmr.quest`
- ✅ Updated `vite.config.ts` proxy to use `https://backend.qxmr.quest`
- ✅ Updated `admin/vite.config.ts` proxy to use `https://backend.qxmr.quest`
- ✅ Updated wallet connect redirect to use frontend URL

### 4. Documentation
- ✅ Created `DEPLOYMENT.md` with complete deployment guide
- ✅ Created `deploy.sh` script for automated deployment

## 📋 Next Steps (To Be Done by User)

### 1. Install System Dependencies
```bash
apt update && apt upgrade -y
apt install -y python3 python3-pip nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
pip3 install gunicorn
```

### 2. Install SSL Certificates
Place SSL certificates in:
- `/etc/ssl/certs/backend.qxmr.quest.crt`
- `/etc/ssl/private/backend.qxmr.quest.key`
- `/etc/ssl/certs/frontend.qxmr.quest.crt`
- `/etc/ssl/private/frontend.qxmr.quest.key`
- `/etc/ssl/certs/admin.qxmr.quest.crt`
- `/etc/ssl/private/admin.qxmr.quest.key`

**OR** if using Let's Encrypt, update nginx configs to use:
- `/etc/letsencrypt/live/backend.qxmr.quest/fullchain.pem`
- `/etc/letsencrypt/live/backend.qxmr.quest/privkey.pem`
- (and similar for frontend and admin)

### 3. Run Deployment
```bash
cd /var/website
./deploy.sh
```

### 4. Update Nginx SSL Paths (if needed)
If using Let's Encrypt or different certificate paths, update the nginx configs:
```bash
# Example for Let's Encrypt
sed -i 's|/etc/ssl/certs/backend.qxmr.quest.crt|/etc/letsencrypt/live/backend.qxmr.quest/fullchain.pem|g' /etc/nginx/sites-available/backend.qxmr.quest
sed -i 's|/etc/ssl/private/backend.qxmr.quest.key|/etc/letsencrypt/live/backend.qxmr.quest/privkey.pem|g' /etc/nginx/sites-available/backend.qxmr.quest
# Repeat for frontend and admin
```

### 5. Test and Start Services
```bash
# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

# Start backend service
systemctl daemon-reload
systemctl start qxmr-backend
systemctl enable qxmr-backend

# Check status
systemctl status qxmr-backend
systemctl status nginx
```

### 6. Verify Deployment
```bash
# Test endpoints
curl https://backend.qxmr.quest/health
curl -I https://frontend.qxmr.quest
curl -I https://admin.qxmr.quest
```

## 🔧 Configuration Files Created

1. **Backend:**
   - `/var/website/backend/gunicorn_config.py`
   - `/var/website/backend/wsgi.py`
   - `/etc/systemd/system/qxmr-backend.service`

2. **Nginx:**
   - `/etc/nginx/sites-available/backend.qxmr.quest`
   - `/etc/nginx/sites-available/frontend.qxmr.quest`
   - `/etc/nginx/sites-available/admin.qxmr.quest`
   - Symlinks in `/etc/nginx/sites-enabled/`

3. **Deployment:**
   - `/var/website/deploy.sh`
   - `/var/website/DEPLOYMENT.md`

## 🌐 Domain Configuration

All domains should point to your server IP:
- `frontend.qxmr.quest` → Server IP
- `backend.qxmr.quest` → Server IP
- `admin.qxmr.quest` → Server IP

## 📝 Important Notes

1. **SSL Certificates:** Update nginx configs with your actual SSL certificate paths before starting nginx.

2. **Environment Variables:** Default URLs are set to production domains. If you need to override, create `.env` files and rebuild.

3. **Database Location:** SQLite databases are in `/var/website/backend/`. Back them up regularly.

4. **Logs:**
   - Backend: `journalctl -u qxmr-backend`
   - Gunicorn: `/var/log/gunicorn/`
   - Nginx: `/var/log/nginx/`

5. **Ports:** Backend runs on `127.0.0.1:5000` (only accessible via nginx). Nginx listens on ports 80 and 443.

## 🚀 Quick Start Commands

```bash
# Install dependencies
apt update && apt install -y python3 python3-pip nginx nodejs

# Deploy
cd /var/website && ./deploy.sh

# Start services
systemctl daemon-reload
systemctl start qxmr-backend
systemctl enable qxmr-backend
systemctl reload nginx
```

## 📞 Troubleshooting

See `DEPLOYMENT.md` for detailed troubleshooting guide.

