# CORS and SSL Certificate Fix - Complete ✅

## Issues Fixed

### 1. CORS Errors ✅
**Problem**: Multiple `Access-Control-Allow-Origin` headers causing CORS policy violations
- Nginx was adding `Access-Control-Allow-Origin: *`
- Flask-CORS was also adding headers
- Result: Duplicate headers error

**Solution**:
- Removed CORS headers from nginx configs (let Flask-CORS handle it)
- Configured Flask-CORS to allow specific origins:
  - `https://frontend.qxmr.quest`
  - `https://admin.qxmr.quest`
  - `http://localhost:5173` (for local development)
- Now only one CORS header is sent per request

### 2. SSL Certificates ✅
**Problem**: Self-signed certificates causing browser security warnings

**Solution**:
- Installed certbot and python3-certbot-nginx
- Obtained Let's Encrypt SSL certificates for all three domains:
  - `backend.qxmr.quest`
  - `frontend.qxmr.quest`
  - `admin.qxmr.quest`
- Updated all nginx configs to use Let's Encrypt certificates
- Configured automatic certificate renewal

## Configuration Changes

### Backend (`/var/website/backend/app.py`)
```python
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://frontend.qxmr.quest",
            "https://admin.qxmr.quest",
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})
```

### Nginx Configs
- Removed duplicate CORS headers
- Updated SSL certificate paths to Let's Encrypt:
  - `/etc/letsencrypt/live/backend.qxmr.quest/fullchain.pem`
  - `/etc/letsencrypt/live/backend.qxmr.quest/privkey.pem`
- All three domains use the same certificate (multi-domain certificate)

## Verification

### CORS Headers
```bash
curl -I -H "Origin: https://frontend.qxmr.quest" https://backend.qxmr.quest/health
# Returns: access-control-allow-origin: https://frontend.qxmr.quest
```

### SSL Certificates
- All domains now have valid Let's Encrypt certificates
- Certificates expire on: 2026-02-17
- Auto-renewal configured via certbot timer

### Endpoints
- ✅ `https://backend.qxmr.quest/health` - Working
- ✅ `https://frontend.qxmr.quest` - Working
- ✅ `https://admin.qxmr.quest` - Working
- ✅ CORS headers properly configured
- ✅ No duplicate headers

## Certificate Renewal

Certificates are automatically renewed by certbot. To manually renew:

```bash
certbot renew
systemctl reload nginx
```

## Testing

### Test CORS
```bash
# From frontend origin
curl -H "Origin: https://frontend.qxmr.quest" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://backend.qxmr.quest/leaderboard

# Should return proper CORS headers
```

### Test SSL
```bash
# Check certificate
openssl s_client -connect backend.qxmr.quest:443 -servername backend.qxmr.quest

# Or use browser - should show valid certificate
```

## Status

✅ **CORS**: Fixed - No duplicate headers
✅ **SSL**: Fixed - Valid Let's Encrypt certificates on all domains
✅ **HTTPS Redirect**: Working - HTTP automatically redirects to HTTPS
✅ **Auto-Renewal**: Configured - Certificates renew automatically

All issues resolved!

