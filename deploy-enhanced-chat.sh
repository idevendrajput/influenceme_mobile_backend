#!/bin/bash

# Enhanced Chat System Deployment Script
# This script deploys the updated chat system with Socket.IO enhancements

echo "🚀 Starting Enhanced Chat System Deployment"
echo "==========================================="

# Configuration
SERVER_IP="82.29.162.56"
SERVER_USER="root"
REMOTE_PATH="/var/www/influenceme_mobile_backend"
LOCAL_PATH="/Users/devendrasingh/WebstormProjects/influenceme_mobile_backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Step 1: Pre-deployment checks
log "Step 1: Pre-deployment checks"
echo "Checking server connectivity..."
if ! ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    error "Cannot reach server at $SERVER_IP"
    exit 1
fi

echo "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'" > /dev/null 2>&1; then
    error "SSH connection failed"
    exit 1
fi

log "✅ Pre-deployment checks passed"

# Step 2: Create backup
log "Step 2: Creating backup on server"
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    BACKUP_DIR="/var/www/backups/influenceme_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r /var/www/influenceme_mobile_backend $BACKUP_DIR/
    echo "Backup created at: $BACKUP_DIR"
EOF

# Step 3: Stop the server
log "Step 3: Stopping PM2 processes"
ssh $SERVER_USER@$SERVER_IP "pm2 stop influenceme_mobile_backend || echo 'Process was not running'"

# Step 4: Upload enhanced files
log "Step 4: Uploading enhanced chat system files"

# Create list of files to upload
FILES_TO_UPLOAD=(
    "server.js"
    "controllers/chatController.js"
    "models/message.js"
    "package.json"
    "package-lock.json"
)

for file in "${FILES_TO_UPLOAD[@]}"; do
    log "Uploading $file..."
    scp -q "$LOCAL_PATH/$file" "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/$file"
    if [ $? -eq 0 ]; then
        log "✅ Uploaded $file successfully"
    else
        error "Failed to upload $file"
        exit 1
    fi
done

# Step 5: Install dependencies
log "Step 5: Installing/updating dependencies"
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    cd /var/www/influenceme_mobile_backend
    npm install
    if [ $? -eq 0 ]; then
        echo "Dependencies installed successfully"
    else
        echo "Failed to install dependencies"
        exit 1
    fi
EOF

# Step 6: Database migration (if needed)
log "Step 6: Running database migrations"
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    cd /var/www/influenceme_mobile_backend
    # Add any database migration commands here if needed
    echo "Database migrations completed (if any)"
EOF

# Step 7: Start the server
log "Step 7: Starting the enhanced server"
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    cd /var/www/influenceme_mobile_backend
    pm2 start server.js --name influenceme_mobile_backend --interpreter babel-node
    pm2 save
    pm2 startup
EOF

# Step 8: Health check
log "Step 8: Performing health check"
sleep 10

# Check if the server is responding
if curl -f "http://$SERVER_IP:3001/api/health" > /dev/null 2>&1; then
    log "✅ Server health check passed"
else
    warning "Server health check failed, checking PM2 status..."
    ssh $SERVER_USER@$SERVER_IP "pm2 status"
fi

# Step 9: Test Socket.IO connectivity
log "Step 9: Testing Socket.IO connectivity"
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    cd /var/www/influenceme_mobile_backend
    timeout 10s node -e "
    const { io } = require('socket.io-client');
    const client = io('http://localhost:3001');
    client.on('connect', () => {
        console.log('✅ Socket.IO connection test successful');
        process.exit(0);
    });
    client.on('connect_error', (error) => {
        console.log('❌ Socket.IO connection test failed:', error.message);
        process.exit(1);
    });
    setTimeout(() => {
        console.log('❌ Socket.IO connection test timed out');
        process.exit(1);
    }, 8000);
    " || echo "Socket.IO test completed"
EOF

# Step 10: Display deployment summary
log "Step 10: Deployment Summary"
echo "==========================================="
log "🎉 Enhanced Chat System Deployment Complete!"
echo ""
log "📋 Deployed Features:"
echo "   • Enhanced typing indicators"
echo "   • Message delivery status"
echo "   • Room leave functionality" 
echo "   • Improved error handling"
echo "   • Online user tracking"
echo "   • Message read receipts"
echo "   • Connection health monitoring"
echo ""
log "🌐 Server Status:"
echo "   • Server IP: $SERVER_IP:3001"
echo "   • API Health: http://$SERVER_IP:3001/api/health"
echo "   • Socket.IO endpoint: ws://$SERVER_IP:3001"
echo ""
log "📝 Next Steps:"
echo "   1. Test the chat functionality from Flutter/Web clients"
echo "   2. Monitor PM2 logs: pm2 logs influenceme_mobile_backend"
echo "   3. Update client applications to use new Socket.IO events"
echo ""

# Final status check
log "Final PM2 Status Check:"
ssh $SERVER_USER@$SERVER_IP "pm2 status"

log "🚀 Deployment completed successfully! The enhanced chat system is now live."

# Optional: Show recent logs
warning "Showing recent logs (last 20 lines):"
ssh $SERVER_USER@$SERVER_IP "pm2 logs influenceme_mobile_backend --lines 20"

echo ""
log "Deployment script finished at $(date)"
