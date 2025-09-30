# Fix DB_HOST in .env file on server
$SERVER = "ubuntu@ec2-3-96-139-52.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

Write-Host "=== Fixing DB_HOST Configuration ===" -ForegroundColor Green
Write-Host ""

# Step 1: Check current DB_HOST
Write-Host "1. Checking current DB_HOST in .env file..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && grep -E '^DB_HOST=' .env || echo 'DB_HOST not found in .env'"

# Step 2: Update DB_HOST to 'db' (Docker service name)
Write-Host "`n2. Updating DB_HOST to 'db'..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && if grep -q '^DB_HOST=' .env; then sed -i 's/^DB_HOST=.*/DB_HOST=db/' .env; else echo 'DB_HOST=db' >> .env; fi && echo '✅ DB_HOST updated'"

# Step 3: Verify the change
Write-Host "`n3. Verifying DB_HOST..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && grep -E '^DB_HOST=' .env"

# Step 4: Also ensure DB_PORT is correct
Write-Host "`n4. Ensuring DB_PORT is 5432..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && if grep -q '^DB_PORT=' .env; then sed -i 's/^DB_PORT=.*/DB_PORT=5432/' .env; else echo 'DB_PORT=5432' >> .env; fi && echo '✅ DB_PORT updated'"

# Step 5: Check if database container is running
Write-Host "`n5. Checking database container status..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker ps --filter 'name=email-db' --format 'table {{.Names}}\t{{.Status}}'"

# Step 6: Restart email-service container to apply changes
Write-Host "`n6. Restarting email-service container..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && docker-compose restart email-service"

# Step 7: Wait for restart
Write-Host "`n7. Waiting 10 seconds for container to restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 8: Check container logs
Write-Host "`n8. Checking container logs for database connection..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs email-service --tail 30 | grep -E 'Database|connected|Error|host:|DB_HOST' || docker logs email-service --tail 10"

# Step 9: Check environment variable in container
Write-Host "`n9. Verifying DB_HOST in container..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec email-service printenv | grep DB_HOST"

Write-Host "`n=== Fix Complete ===" -ForegroundColor Green
Write-Host "Check the logs above to confirm database connection is working." -ForegroundColor Yellow
