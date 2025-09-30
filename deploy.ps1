# Deployment script for Email Service to EC2
$SERVER = "ubuntu@ec2-3-96-139-52.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

Write-Host "=== Email Service Deployment to EC2 ===" -ForegroundColor Green
Write-Host "Target: $SERVER" -ForegroundColor Cyan
Write-Host "Port: 3006" -ForegroundColor Cyan
Write-Host ""

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

Write-Host "Mode: $mode" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check if service is already running
Write-Host "1. Checking if service is already deployed..." -ForegroundColor Cyan
$isRunning = ssh -i $KEY_PATH $SERVER "docker ps --filter 'name=email-service' --format '{{.Names}}' | grep -q email-service && echo 'yes' || echo 'no'" 2>&1

if ($isRunning -eq "yes" -and $mode -eq "quick") {
    Write-Host "   Service is running. Performing quick restart..." -ForegroundColor Yellow
    ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && docker-compose restart" 2>&1 | Out-Host
    Write-Host "`n✅ Quick restart complete!" -ForegroundColor Green
    Write-Host "Service URL: http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006" -ForegroundColor Cyan
    exit 0
}

# Step 2: Create directory on server
Write-Host "2. Creating directory on server..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "mkdir -p $REMOTE_DIR" 2>&1 | Out-Null
Write-Host "   ✅ Directory ready" -ForegroundColor Green

# Step 3: Create exclusion list (exclude node_modules and other unnecessary files)
$excludePatterns = @(
    "node_modules",
    ".git",
    ".gitignore",
    "*.log",
    ".DS_Store",
    ".vscode",
    ".idea",
    "*.swp",
    "*.swo"
)

# Step 4: Copy files to server (excluding node_modules and other files)
Write-Host "`n3. Copying files to server (excluding node_modules)..." -ForegroundColor Cyan

# Copy each file/directory individually, excluding node_modules
Get-ChildItem -Path . -Force | Where-Object {
    $item = $_
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($item.Name -like $pattern -or $item.Name -eq $pattern) {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
} | ForEach-Object {
    $itemName = $_.Name
    Write-Host "   Copying: $itemName" -ForegroundColor Gray
    scp -i $KEY_PATH -r $_.FullName $SERVER`:$REMOTE_DIR/ 2>&1 | Out-Null
}

Write-Host "   ✅ Files copied" -ForegroundColor Green

# Step 5: Copy .env file if it exists
Write-Host "`n4. Copying .env file..." -ForegroundColor Cyan
if (Test-Path .env) {
    scp -i $KEY_PATH .env $SERVER`:$REMOTE_DIR/ 2>&1 | Out-Null
    Write-Host "   ✅ .env file copied" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env file not found (will use existing on server if available)" -ForegroundColor Yellow
}

# Step 6: Build and run Docker containers based on mode
Write-Host "`n5. Building and starting Docker containers..." -ForegroundColor Cyan

if ($mode -eq "full") {
    Write-Host "   Full deployment: Rebuilding from scratch..." -ForegroundColor Yellow
    $remoteCommands = "cd $REMOTE_DIR && docker-compose down -v && docker-compose build --no-cache && docker-compose up -d && docker-compose ps"
} elseif ($mode -eq "update") {
    Write-Host "   Update deployment: Rebuilding if needed..." -ForegroundColor Yellow
    $remoteCommands = "cd $REMOTE_DIR && docker-compose down && docker-compose build && docker-compose up -d && docker-compose ps"
} else {
    Write-Host "   Quick restart: Restarting containers only..." -ForegroundColor Yellow
    $remoteCommands = "cd $REMOTE_DIR && docker-compose restart && docker-compose ps"
}

Write-Host "   This may take a few minutes..." -ForegroundColor Gray
ssh -i $KEY_PATH $SERVER $remoteCommands 2>&1 | Out-Host

# Step 7: Wait for service to start
Write-Host "`n6. Waiting for service to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Step 8: Check container status
Write-Host "`n7. Checking container status..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker ps --filter 'name=email-service' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'" 2>&1 | Out-Host

# Step 9: Show recent logs
Write-Host "`n8. Recent container logs:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs email-service --tail 20" 2>&1 | Out-Host

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Service URL: http://ec2-3-96-139-52.ca-central-1.compute.amazonaws.com:3006" -ForegroundColor Cyan
Write-Host "`nTo check logs: ssh -i $KEY_PATH $SERVER 'docker logs email-service -f'" -ForegroundColor Gray
Write-Host "To restart: .\deploy.ps1 quick" -ForegroundColor Gray
