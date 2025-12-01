#!/bin/bash

# Simple script to manually upload images to Railway using curl
# Make sure to run this from the server directory where uploads folder exists

RAILWAY_URL="https://elakonvdeployment-production.up.railway.app"

echo "🚀 Starting image upload to Railway..."

# Counter for uploaded files
counter=0

# Loop through all image files in uploads directory (excluding certificates folder)
for file in uploads/*.{jpg,jpeg,png,gif,webp,avif,JPG,JPEG,PNG,GIF,WEBP,AVIF}; do
    # Check if file exists (handles case where glob doesn't match anything)
    if [ -f "$file" ]; then
        echo "📤 Uploading: $(basename "$file")"
        
        # Upload file using curl
        response=$(curl -s -X POST \
            -F "media=@$file" \
            "$RAILWAY_URL/api/upload" \
            -w "%{http_code}")
        
        # Check if upload was successful
        if [[ "$response" == *"200"* ]] || [[ "$response" == *"success"* ]]; then
            echo "✅ Successfully uploaded: $(basename "$file")"
            ((counter++))
        else
            echo "❌ Failed to upload: $(basename "$file")"
            echo "Response: $response"
        fi
        
        # Small delay to avoid overwhelming server
        sleep 0.1
    fi
done

echo "🎉 Upload complete! Total files uploaded: $counter"