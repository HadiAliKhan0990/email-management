# Script to diagnose and fix AUTH_KEY issue in container
$SERVER = "ubuntu@ec2-3-96-191-90.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

Write-Host "=== AUTH_KEY Diagnostic and Fix ===" -ForegroundColor Green
Write-Host ""

# Step 1: Check .env file
Write-Host "1. Checking .env file on server..." -ForegroundColor Cyan
$envCheck = ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && if [ -f .env ]; then echo 'EXISTS'; grep -E '^AUTH_KEY=' .env | head -1; else echo 'NOT_FOUND'; fi"

if ($envCheck -match "NOT_FOUND") {
    Write-Host "  ❌ .env file not found!" -ForegroundColor Red
    Write-Host "  Please create .env file with AUTH_KEY" -ForegroundColor Yellow
    exit 1
}

if ($envCheck -notmatch "AUTH_KEY=") {
    Write-Host "  ❌ AUTH_KEY not found in .env file!" -ForegroundColor Red
    Write-Host "  Please add AUTH_KEY to .env file" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✅ .env file exists and contains AUTH_KEY" -ForegroundColor Green

# Step 2: Check current container
Write-Host "`n2. Checking current container..." -ForegroundColor Cyan
$containerAuthKey = ssh -i $KEY_PATH $SERVER "docker exec email-service printenv AUTH_KEY 2>&1"

if ([string]::IsNullOrWhiteSpace($containerAuthKey) -or $containerAuthKey -match "Error") {
    Write-Host "  ❌ AUTH_KEY not found in container!" -ForegroundColor Red
    Write-Host "  This is the problem - container doesn't have AUTH_KEY" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ AUTH_KEY found in container (length: $($containerAuthKey.Length))" -ForegroundColor Green
    Write-Host "  Container already has AUTH_KEY, but let's verify it matches .env" -ForegroundColor Yellow
}

# Step 3: Verify docker-compose.yml
Write-Host "`n3. Verifying docker-compose.yml configuration..." -ForegroundColor Cyan
$composeCheck = ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && grep -A 2 'env_file:' docker-compose.yml | head -3"
Write-Host $composeCheck

# Step 4: Fix - Restart container to reload .env
Write-Host "`n4. Restarting container to reload environment variables..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && docker-compose down && docker-compose up -d"

Write-Host "`n5. Waiting for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 5: Verify after restart
Write-Host "`n6. Verifying AUTH_KEY after restart..." -ForegroundColor Cyan
$newAuthKey = ssh -i $KEY_PATH $SERVER "docker exec email-service printenv AUTH_KEY 2>&1"

if ([string]::IsNullOrWhiteSpace($newAuthKey) -or $newAuthKey -match "Error") {
    Write-Host "  ❌ AUTH_KEY still not found after restart!" -ForegroundColor Red
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify .env file is in $REMOTE_DIR" -ForegroundColor Gray
    Write-Host "  2. Check .env file format: AUTH_KEY=your_key_here (no spaces around =)" -ForegroundColor Gray
    Write-Host "  3. Check docker-compose.yml has 'env_file: - .env'" -ForegroundColor Gray
    Write-Host "  4. View container logs: docker logs email-service" -ForegroundColor Gray
} else {
    Write-Host "  ✅ AUTH_KEY is now in container (length: $($newAuthKey.Length))" -ForegroundColor Green
}

# Step 6: Check application logs
Write-Host "`n7. Checking application startup logs..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs email-service --tail 20 | grep -i 'AUTH_KEY\|ERROR\|Missing\|Server is running'"

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Green

