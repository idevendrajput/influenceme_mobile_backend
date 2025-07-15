# Firewall Configuration for Port 3002

## For Ubuntu/Debian (UFW)

```bash
# Check current firewall status
sudo ufw status

# Allow port 3002
sudo ufw allow 3002

# If you want to allow only specific IP ranges (recommended)
# sudo ufw allow from YOUR_IP_RANGE to any port 3002

# Enable firewall if not already enabled
sudo ufw enable

# Check status again
sudo ufw status
```

## For CentOS/RHEL/Fedora (firewalld)

```bash
# Check firewall status
sudo firewall-cmd --state

# Allow port 3002 permanently
sudo firewall-cmd --permanent --add-port=3002/tcp

# Reload firewall
sudo firewall-cmd --reload

# Check if port is open
sudo firewall-cmd --list-ports
```

## For CentOS/RHEL (iptables)

```bash
# Allow port 3002
sudo iptables -A INPUT -p tcp --dport 3002 -j ACCEPT

# Save iptables rules
sudo service iptables save

# Or on newer systems
sudo iptables-save > /etc/sysconfig/iptables
```

## Testing Port Access

```bash
# Test from local server
curl http://localhost:3002/api/health

# Test from external (replace SERVER_IP with your actual IP)
curl http://SERVER_IP:3002/api/health

# Check if port is listening
sudo netstat -tlnp | grep 3002
# or
sudo ss -tlnp | grep 3002
```

## Security Considerations

1. **Restrict IP Access**: Consider allowing only specific IP ranges
2. **Use HTTPS**: Even without domain, you can use self-signed certificates
3. **Rate Limiting**: Implement rate limiting in your application
4. **Monitor Logs**: Regularly check PM2 logs for suspicious activity

## Common Issues

1. **Port already in use**: Check if another process is using port 3002
   ```bash
   sudo lsof -i :3002
   ```

2. **Permission denied**: Make sure the user can bind to the port
3. **Firewall blocking**: Ensure firewall rules are correctly configured
4. **Network configuration**: Check if your VPS provider has additional firewall rules
