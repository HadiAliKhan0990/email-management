# Script to check and fix database configuration on server
$SERVER = "ubuntu@ec2-3-96-139-52.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

Write-Host "=== Database Configuration Check ===" -ForegroundColor Green
Write-Host ""

# Check DB_HOST in .env
Write-Host "1. Checking DB_HOST in .env file:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && grep -E '^DB_HOST=' .env || echo 'DB_HOST not found in .env'"

# Check DB_HOST in container
Write-Host "`n2. Checking DB_HOST in container:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec email-service printenv DB_HOST || echo 'DB_HOST not set in container'"

# Check if database container is running
Write-Host "`n3. Checking database container status:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker ps --filter 'name=email-db' --format 'table {{.Names}}\t{{.Status}}'"

# Check database connection from email-service container
Write-Host "`n4. Testing database connection from email-service:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec email-service ping -c 2 db 2>&1 || echo 'Cannot ping db service'"

# Check container logs for database connection errors
Write-Host "`n5. Recent database connection logs:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs email-service --tail 20 | grep -i 'database\|connected\|error\|ECONNREFUSED'"

Write-Host "`n=== Fix Instructions ===" -ForegroundColor Yellow
Write-Host "If DB_HOST is not 'db', update .env file:" -ForegroundColor Gray
Write-Host "  DB_HOST=db" -ForegroundColor Gray
Write-Host "  DB_PORT=5432" -ForegroundColor Gray
Write-Host "Then restart: docker-compose restart email-service" -ForegroundColor Gray
