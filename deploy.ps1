# Deployment script for Email Service
$SERVER = "ubuntu@ec2-3-96-191-90.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

# Check for deployment mode
$mode = $args[0]
if (-not $mode) {
    Write-Host "Deployment Modes:" -ForegroundColor Yellow
    Write-Host "  quick    - Quick restart (no rebuild, just restart containers)" -ForegroundColor Cyan
    Write-Host "  update   - Update code and restart (rebuild if needed)" -ForegroundColor Cyan
    Write-Host "  full     - Full deployment (rebuild from scratch)" -ForegroundColor Cyan
    Write-Host "`nUsage: .\deploy.ps1 [quick|update|full]" -ForegroundColor Yellow
    Write-Host "Default: update" -ForegroundColor Yellow
    $mode = "update"
}

Write-Host "Deploying Email Service to AWS (Mode: $mode)..." -ForegroundColor Green

# Check if service is already running
Write-Host "`nChecking if service is already deployed..." -ForegroundColor Cyan
$isRunning = ssh -i $KEY_PATH $SERVER "docker ps --filter 'name=email-service' --format '{{.Names}}' | grep -q email-service && echo 'yes' || echo 'no'"

if ($isRunning -eq "yes" -and $mode -eq "quick") {
    Write-Host "Service is running. Performing quick restart..." -ForegroundColor Yellow
    ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && docker-compose restart"
    Write-Host "`nQuick restart complete!" -ForegroundColor Green
    exit 0
}

# Step 1: Create directory on server
Write-Host "`nCreating directory on server..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "mkdir -p $REMOTE_DIR"

# Step 2: Copy files to server (excluding node_modules and git files)
Write-Host "`nCopying files to server..." -ForegroundColor Cyan
Get-ChildItem -Path . -Exclude node_modules,.git | ForEach-Object {
    scp -i $KEY_PATH -r $_.FullName $SERVER`:$REMOTE_DIR/ 2>&1 | Out-Null
}

# Step 3: Copy .env file if it exists
if (Test-Path .env) {
    Write-Host "`nCopying .env file..." -ForegroundColor Cyan
    scp -i $KEY_PATH .env $SERVER`:$REMOTE_DIR/
} else {
    Write-Host "`nWarning: .env file not found." -ForegroundColor Yellow
}

# Step 4: Build and run Docker containers based on mode
Write-Host "`nBuilding and starting Docker containers..." -ForegroundColor Cyan

if ($mode -eq "full") {
    Write-Host "Full deployment: Rebuilding from scratch..." -ForegroundColor Yellow
    $remoteCommands = "cd $REMOTE_DIR; docker-compose down; docker-compose build --no-cache; docker-compose up -d; docker-compose ps"
} elseif ($mode -eq "update") {
    Write-Host "Update deployment: Rebuilding if needed..." -ForegroundColor Yellow
    $remoteCommands = "cd $REMOTE_DIR; docker-compose down; docker-compose build; docker-compose up -d; docker-compose ps"
} else {
    Write-Host "Quick restart: Restarting containers only..." -ForegroundColor Yellow
    $remoteCommands = "cd $REMOTE_DIR; docker-compose restart; docker-compose ps"
}

ssh -i $KEY_PATH $SERVER $remoteCommands

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "Service should be available at: http://ec2-3-96-191-90.ca-central-1.compute.amazonaws.com:3006" -ForegroundColor Cyan
Write-Host "`nTo check logs: docker logs email-service" -ForegroundColor Gray

