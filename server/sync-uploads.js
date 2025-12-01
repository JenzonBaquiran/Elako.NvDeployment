const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://elakonvdeployment-production.up.railway.app';
const LOCAL_UPLOADS_DIR = path.join(__dirname, 'uploads');

// Function to create multipart form data boundary and body
function createMultipartBody(filePath, fileName) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
  const fileBuffer = fs.readFileSync(filePath);
  
  const parts = [];
  parts.push(`--${boundary}\r\n`);
  parts.push(`Content-Disposition: form-data; name="media"; filename="${fileName}"\r\n`);
  parts.push('Content-Type: application/octet-stream\r\n\r\n');
  
  const header = Buffer.from(parts.join(''), 'utf8');
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  
  return {
    boundary,
    body: Buffer.concat([header, fileBuffer, footer])
  };
}

// Function to upload a single file to Railway
async function uploadFileToRailway(filePath, fileName) {
  return new Promise((resolve) => {
    try {
      const { boundary, body } = createMultipartBody(filePath, fileName);
      
      const options = {
        hostname: 'elakonvdeployment-production.up.railway.app',
        port: 443,
        path: '/api/upload',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length,
        },
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`✅ Uploaded: ${fileName}`);
            resolve(true);
          } else {
            console.error(`❌ Failed to upload ${fileName}: HTTP ${res.statusCode}`);
            console.error('Response:', data);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`❌ Failed to upload ${fileName}:`, error.message);
        resolve(false);
      });
      
      req.write(body);
      req.end();
      
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
      resolve(false);
    }
  });
}

// Function to sync all uploads
async function syncUploads() {
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    console.error('❌ Local uploads directory not found:', LOCAL_UPLOADS_DIR);
    return;
  }

  console.log('🚀 Starting upload sync to Railway...');
  
  const files = fs.readdirSync(LOCAL_UPLOADS_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext);
  });

  console.log(`📁 Found ${imageFiles.length} image files to upload`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const fileName = imageFiles[i];
    const filePath = path.join(LOCAL_UPLOADS_DIR, fileName);
    
    console.log(`📤 Uploading ${i + 1}/${imageFiles.length}: ${fileName}`);
    
    const result = await uploadFileToRailway(filePath, fileName);
    
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${successCount} files`);
  console.log(`❌ Failed uploads: ${failCount} files`);
  console.log('🎉 Sync complete!');
}

// Run the sync
if (require.main === module) {
  syncUploads().catch(console.error);
}

module.exports = { syncUploads, uploadFileToRailway };