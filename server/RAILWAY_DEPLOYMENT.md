# Railway Deployment Guide

## Files Created for Railway Deployment:

1. **railway.json** - Railway configuration
2. **.env.production** - Environment variables template
3. **Updated index.js** - Production-ready CORS and port configuration

## Railway Deployment Steps:

### 1. Push Changes to GitHub

```bash
git add .
git commit -m "Prepare backend for Railway deployment"
git push origin main
```

### 2. Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository: `Elako.NvDeployment`
4. **IMPORTANT**: Set Root Directory to `/ELako.Nv/server`
5. Railway will auto-detect Node.js and deploy

### 3. Add Environment Variables

In Railway dashboard → Variables tab, add:

- `NODE_ENV=production`
- `PORT=1337`
- `MONGODB_URI=your_actual_mongodb_connection_string`
- `FRONTEND_URL=https://your-future-vercel-url.vercel.app`

### 4. Get Your Railway URL

After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

## Next Steps After Railway Deployment:

1. Test your API endpoints using the Railway URL
2. Update frontend configuration with Railway URL
3. Deploy frontend to Vercel
