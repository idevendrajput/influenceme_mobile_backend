# Quick Deployment Guide - IP Based Access

## Prerequisites

1. **VPS Server** with Node.js installed
2. **MongoDB** running on the server
3. **PM2** (will be installed during deployment)
4. **SSH access** to your server

## Step 1: Deploy to Server

Run the deployment script from your local machine:

```bash
./deploy-simple.sh YOUR_SERVER_IP YOUR_SERVER_USER
```

Example:
```bash
./deploy-simple.sh 192.168.1.100 root
```

## Step 2: Configure Firewall

SSH to your server and open port 3002:

```bash
ssh YOUR_SERVER_USER@YOUR_SERVER_IP
```

Then run firewall commands based on your OS:

**Ubuntu/Debian:**
```bash
sudo ufw allow 3002
sudo ufw enable
```

**CentOS/RHEL:**
```bash
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --reload
```

## Step 3: Update Environment Variables

Edit the environment file on your server:

```bash
cd /var/www/influenceme_mobile_backend
nano .env
```

Update the following variables:
- `JWT_SECRET`: Change to a secure secret
- `MONGODB_URI`: Update if your MongoDB is on a different host/port

## Step 4: Run Migration

```bash
cd /var/www/influenceme_mobile_backend
npm run migrate:social-media
```

## Step 5: Test the Application

```bash
# Test from server
curl http://localhost:3002/api/health

# Test from external
curl http://YOUR_SERVER_IP:3002/api/health
```

## Step 6: Verify PM2 Status

```bash
pm2 status
pm2 logs influenceme-mobile-backend
```

## Your App URLs

- **API Base URL**: `http://YOUR_SERVER_IP:3002`
- **Health Check**: `http://YOUR_SERVER_IP:3002/api/health`
- **Auth Routes**: `http://YOUR_SERVER_IP:3002/api/auth/*`
- **User Routes**: `http://YOUR_SERVER_IP:3002/api/users/*`
- **Static Files**: `http://YOUR_SERVER_IP:3002/uploads/*`

## Common PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs influenceme-mobile-backend

# Restart app
pm2 restart influenceme-mobile-backend

# Stop app
pm2 stop influenceme-mobile-backend

# Start app
pm2 start influenceme-mobile-backend

# Monitor in real-time
pm2 monit
```

## Troubleshooting

### Port Already in Use
```bash
sudo lsof -i :3002
# Kill the process using the port
sudo kill -9 PID
```

### App Not Starting
```bash
# Check logs
pm2 logs influenceme-mobile-backend

# Check if MongoDB is running
sudo systemctl status mongod
```

### Cannot Access from External
1. Check firewall settings
2. Verify port is listening: `sudo netstat -tlnp | grep 3002`
3. Check VPS provider's firewall/security groups

### Database Connection Issues
1. Check MongoDB status: `sudo systemctl status mongod`
2. Verify MongoDB URI in `.env` file
3. Check MongoDB logs: `sudo journalctl -u mongod`

## Security Notes

1. **Change JWT Secret**: Always use a strong, unique JWT secret
2. **Database Security**: Ensure MongoDB is properly secured
3. **Firewall**: Only open necessary ports
4. **Updates**: Keep your system and dependencies updated
5. **Monitoring**: Set up log monitoring and alerts

## Next Steps

Once everything is working with IP access, you can:
1. Set up a domain name
2. Configure SSL certificates
3. Set up Nginx reverse proxy
4. Implement additional security measures
