# PowerShell script to upload images to Railway
# Run this from the server directory where uploads folder exists

$RAILWAY_URL = "https://elakonvdeployment-production.up.railway.app"

Write-Host "🚀 Starting image upload to Railway..." -ForegroundColor Green

# Counter for uploaded files
$counter = 0
$failed = 0

# Get all image files from uploads directory (excluding certificates folder)
$imageExtensions = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp", "*.avif", "*.JPG", "*.JPEG", "*.PNG", "*.GIF", "*.WEBP", "*.AVIF")
$imageFiles = @()

foreach ($ext in $imageExtensions) {
    $files = Get-ChildItem -Path "uploads" -Filter $ext -File -ErrorAction SilentlyContinue
    $imageFiles += $files
}

Write-Host "📁 Found $($imageFiles.Count) image files to upload" -ForegroundColor Cyan

foreach ($file in $imageFiles) {
    Write-Host "📤 Uploading: $($file.Name)" -ForegroundColor Yellow
    
    try {
        # Create multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"media`"; filename=`"$($file.Name)`"",
            "Content-Type: application/octet-stream$LF",
            [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::GetEncoding("iso-8859-1")),
            "--$boundary--$LF"
        ) -join $LF
        
        # Upload file using Invoke-RestMethod
        $response = Invoke-RestMethod -Uri "$RAILWAY_URL/api/upload" -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines -ErrorAction Stop
        
        Write-Host "✅ Successfully uploaded: $($file.Name)" -ForegroundColor Green
        $counter++
        
    } catch {
        Write-Host "❌ Failed to upload: $($file.Name)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    # Small delay to avoid overwhelming server
    Start-Sleep -Milliseconds 100
}

Write-Host "🎉 Upload complete!" -ForegroundColor Green
Write-Host "✅ Successfully uploaded: $counter files" -ForegroundColor Green
Write-Host "❌ Failed uploads: $failed files" -ForegroundColor Red