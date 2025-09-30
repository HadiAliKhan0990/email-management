# Comprehensive script to check container environment and AUTH_KEY
$SERVER = "ubuntu@ec2-3-96-191-90.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

Write-Host "=== Container Environment Diagnostic ===" -ForegroundColor Green
Write-Host ""

# Check if container is running
Write-Host "1. Container Status:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker ps --filter 'name=email-service' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

Write-Host "`n2. AUTH_KEY in .env file on server:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && if [ -f .env ]; then echo 'File exists'; grep -E '^AUTH_KEY=' .env | sed 's/\(AUTH_KEY=\).*\(.\)$/\1*** (hidden, length: '$(grep -E '^AUTH_KEY=' .env | cut -d= -f2 | wc -c)' chars)/'; else echo '.env file NOT FOUND'; fi"

Write-Host "`n3. AUTH_KEY in Docker container environment:" -ForegroundColor Cyan
$authKeyCheck = ssh -i $KEY_PATH $SERVER "docker exec email-service printenv AUTH_KEY 2>&1"
if ($authKeyCheck -match "Error" -or [string]::IsNullOrWhiteSpace($authKeyCheck)) {
    Write-Host "  ❌ AUTH_KEY NOT FOUND in container!" -ForegroundColor Red
} else {
    $length = $authKeyCheck.Length
    Write-Host "  ✅ AUTH_KEY is set (length: $length characters)" -ForegroundColor Green
}

Write-Host "`n4. All environment variables in container (AUTH_KEY related):" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec email-service printenv | grep -i auth || echo 'No AUTH_KEY found'"

Write-Host "`n5. Container startup logs (AUTH_KEY check):" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs email-service 2>&1 | grep -i 'AUTH_KEY\|ERROR\|Missing' | tail -10"

Write-Host "`n6. Docker Compose environment section:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && grep -A 5 'AUTH_KEY' docker-compose.yml"

Write-Host "`n7. Checking if .env file is in docker-compose directory:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && ls -la .env 2>&1"

Write-Host "`n8. Full environment dump (first 20 vars):" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec email-service printenv | head -20"

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Green
Write-Host "`nIf AUTH_KEY is missing, check:" -ForegroundColor Yellow
Write-Host "  1. .env file exists in $REMOTE_DIR" -ForegroundColor Gray
Write-Host "  2. AUTH_KEY is set in .env file" -ForegroundColor Gray
Write-Host "  3. Container was restarted after .env changes" -ForegroundColor Gray

