# Script to check AUTH_KEY configuration on server
$SERVER = "ubuntu@ec2-3-96-139-52.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

Write-Host "Checking AUTH_KEY configuration..." -ForegroundColor Green

# Check AUTH_KEY in .env file
Write-Host "`n1. Checking AUTH_KEY in .env file:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && if [ -f .env ]; then grep -E '^AUTH_KEY=' .env | sed 's/AUTH_KEY=\(.*\)/AUTH_KEY=*** (length: '$(grep -E '^AUTH_KEY=' .env | cut -d= -f2 | wc -c)' characters)/'; else echo '.env file not found'; fi"

# Check AUTH_KEY in Docker container environment
Write-Host "`n2. Checking AUTH_KEY in Docker container:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec email-service printenv AUTH_KEY | wc -c | xargs -I {} echo 'AUTH_KEY is set (length: {} characters)' || echo 'AUTH_KEY not found in container'"

# Check container logs for AUTH_KEY status
Write-Host "`n3. Checking container startup logs for AUTH_KEY:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs email-service 2>&1 | grep -i 'AUTH_KEY' | tail -5"

# Check if container is running
Write-Host "`n4. Container status:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker ps | grep email-service"

Write-Host "`nNote: AUTH_KEY in email-service must match the key used to sign tokens in your authentication service." -ForegroundColor Yellow

