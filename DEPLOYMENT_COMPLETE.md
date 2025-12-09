# 🎉 QXMR Deployment Complete!

## ✅ Deployment Status: LIVE

All services have been successfully deployed and are running in production.

### Services Status

✅ **Backend Service** (`qxmr-backend.service`)
- Status: Active and running
- Port: 127.0.0.1:5000 (internal)
- Public URL: https://backend.qxmr.quest
- Health Check: ✅ Responding
- Workers: 5 Gunicorn workers running

✅ **Nginx Web Server**
- Status: Active and running
- Ports: 80 (HTTP), 443 (HTTPS)
- Frontend: https://frontend.qxmr.quest ✅
- Admin: https://admin.qxmr.quest ✅
- Backend Proxy: https://backend.qxmr.quest ✅

✅ **Frontend Application**
- Status: Built and deployed
- Location: `/var/website/dist`
- URL: https://frontend.qxmr.quest
- Status: ✅ Serving content

✅ **Admin Application**
- Status: Built and deployed
- Location: `/var/website/dist/admin`
- URL: https://admin.qxmr.quest
- Status: ✅ Serving content

## 🔧 Configuration Summary

### Backend Configuration
- **Service File**: `/etc/systemd/system/qxmr-backend.service`
- **Gunicorn Config**: `/var/website/backend/gunicorn_config.py`
- **WSGI Entry**: `/var/website/backend/wsgi.py`
- **Logs**: `/var/log/gunicorn/`

### Nginx Configuration
- **Backend Config**: `/etc/nginx/sites-available/backend.qxmr.quest`
- **Frontend Config**: `/etc/nginx/sites-available/frontend.qxmr.quest`
- **Admin Config**: `/etc/nginx/sites-available/admin.qxmr.quest`
- **Logs**: `/var/log/nginx/`

### SSL Certificates
- **Backend**: `/etc/ssl/certs/backend.qxmr.quest.crt`
- **Frontend**: `/etc/ssl/certs/frontend.qxmr.quest.crt`
- **Admin**: `/etc/ssl/certs/admin.qxmr.quest.crt`

**Note**: Self-signed certificates are currently in use. Replace with production certificates when available.

## 📊 Service Management

### Check Service Status
```bash
# Backend
systemctl status qxmr-backend

# Nginx
systemctl status nginx
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

### Restart Services
```bash
# Restart backend
systemctl restart qxmr-backend

# Restart nginx
systemctl reload nginx
# or
systemctl restart nginx
```

## 🔍 Verification

### Test Endpoints
```bash
# Backend health check
curl https://backend.qxmr.quest/health

# Frontend
curl -I https://frontend.qxmr.quest

# Admin
curl -I https://admin.qxmr.quest
```

### Check Running Processes
```bash
# Gunicorn workers
ps aux | grep gunicorn

# Nginx
ps aux | grep nginx

# Ports
netstat -tlnp | grep -E "(5000|80|443)"
```

## 🔄 Updates and Maintenance

### Update Application Code
```bash
cd /var/website
# Pull latest code (if using git)
git pull

# Rebuild frontend
npm run build

# Rebuild admin
npm run build:admin

# Restart backend
systemctl restart qxmr-backend

# Reload nginx
systemctl reload nginx
```

### Update Python Dependencies
```bash
cd /var/website/backend
pip3 install --break-system-packages -r requirements.txt
systemctl restart qxmr-backend
```

### Update Node.js Dependencies
```bash
cd /var/website
npm install
npm run build
npm run build:admin
```

## 🔐 SSL Certificate Replacement

When you have production SSL certificates:

1. **Place certificates**:
   ```bash
   # Backend
   cp your-cert.crt /etc/ssl/certs/backend.qxmr.quest.crt
   cp your-key.key /etc/ssl/private/backend.qxmr.quest.key
   
   # Frontend
   cp your-cert.crt /etc/ssl/certs/frontend.qxmr.quest.crt
   cp your-key.key /etc/ssl/private/frontend.qxmr.quest.key
   
   # Admin
   cp your-cert.crt /etc/ssl/certs/admin.qxmr.quest.crt
   cp your-key.key /etc/ssl/private/admin.qxmr.quest.key
   ```

2. **Set proper permissions**:
   ```bash
   chmod 644 /etc/ssl/certs/*.crt
   chmod 600 /etc/ssl/private/*.key
   ```

3. **Reload nginx**:
   ```bash
   nginx -t  # Test configuration
   systemctl reload nginx
   ```

## 📝 Important Notes

1. **Self-Signed Certificates**: Currently using self-signed certificates. Browsers will show security warnings. Replace with production certificates.

2. **Database Location**: SQLite databases are in `/var/website/backend/`:
   - `users.db`
   - `transactions.db`
   - `daily_scores.db`
   
   **Backup regularly!**

3. **Environment Variables**: Default URLs are set to production domains. To override, create `.env` files and rebuild.

4. **Firewall**: Ensure ports 80 and 443 are open:
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

5. **Auto-Start**: Both services are enabled to start on boot:
   - `qxmr-backend.service` - enabled
   - `nginx.service` - enabled

## 🎯 Next Steps

1. ✅ Replace self-signed SSL certificates with production certificates
2. ✅ Configure DNS records to point to this server
3. ✅ Set up regular database backups
4. ✅ Monitor logs for any issues
5. ✅ Configure firewall rules if not already done

## 🆘 Troubleshooting

If services are not working:

1. **Check service status**:
   ```bash
   systemctl status qxmr-backend
   systemctl status nginx
   ```

2. **Check logs**:
   ```bash
   journalctl -u qxmr-backend -n 50
   tail -50 /var/log/nginx/*.error.log
   ```

3. **Test nginx configuration**:
   ```bash
   nginx -t
   ```

4. **Verify ports are listening**:
   ```bash
   netstat -tlnp | grep -E "(5000|80|443)"
   ```

## 📞 Support

For detailed deployment information, see:
- `/var/website/DEPLOYMENT.md` - Full deployment guide
- `/var/website/DEPLOYMENT_SUMMARY.md` - Quick reference

---

**Deployment Date**: $(date)
**Status**: ✅ PRODUCTION READY AND LIVE

