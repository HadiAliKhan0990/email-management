# Quick restart script for Email Service (no deployment)
$SERVER = "ubuntu@ec2-3-96-191-90.ca-central-1.compute.amazonaws.com"
$KEY_PATH = "E:\aws-services-stage.pem"
$REMOTE_DIR = "/home/ubuntu/email-service"

Write-Host "Restarting Email Service..." -ForegroundColor Green

ssh -i $KEY_PATH $SERVER "cd $REMOTE_DIR && docker-compose restart"

Write-Host "`nService restarted!" -ForegroundColor Green
Write-Host "To view logs: docker logs email-service -f" -ForegroundColor Gray

