# PuzzleChat Deployment Guide for Render

This guide will walk you through deploying the PuzzleChat application to Render.

## Prerequisites

1. **GitHub Account**: Your code needs to be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account**: Already set up from development
4. **Cloudinary Account**: Already set up from development

## Step 1: Prepare Your Repository

1. **Create a GitHub repository** if you haven't already:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/puzzlechat.git
   git push -u origin main
   ```

2. **Create a `.gitignore`** in the root directory:

   ```bash
   # Backend
   backend/node_modules/
   backend/dist/
   backend/.env
   backend/*.log

   # Frontend
   frontend/node_modules/
   frontend/.next/
   frontend/.env.local
   frontend/*.log

   # General
   .DS_Store
   *.log
   ```

## Step 2: Deploy Backend to Render

1. **Log in to Render** at [dashboard.render.com](https://dashboard.render.com)

2. **Create a New Web Service**:

   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your repository
   - Configure the service:
     - **Name**: `puzzlechat-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or upgrade as needed)

3. **Add Environment Variables**:
   Click "Advanced" and add:

   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=mongodb+srv://ysa0335:test1234@cluster0.o3hlp.mongodb.net/
   CLOUDINARY_CLOUD_NAME=drqdsjywl
   CLOUDINARY_API_KEY=828495176368268
   CLOUDINARY_API_SECRET=M7XRCf5C9GJlPMo0D6v9NMhSbFE
   JWT_SECRET=<generate-a-secure-random-string>
   SESSION_SECRET=<generate-another-secure-random-string>
   FRONTEND_URL=https://puzzlechat-frontend.onrender.com
   ```

4. **Click "Create Web Service"**

5. **Wait for deployment** and note your backend URL (e.g., `https://puzzlechat-backend.onrender.com`)

## Step 3: Deploy Frontend to Render

1. **Create another New Web Service**:

   - Click "New +" → "Web Service"
   - Select your repository again
   - Configure the service:
     - **Name**: `puzzlechat-frontend`
     - **Root Directory**: `frontend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or upgrade as needed)

2. **Add Environment Variables**:

   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://puzzlechat-backend.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://puzzlechat-backend.onrender.com
   ```

3. **Click "Create Web Service"**

4. **Wait for deployment** and note your frontend URL

## Step 4: Update CORS Settings

After both services are deployed, update the backend's FRONTEND_URL environment variable:

1. Go to your backend service on Render
2. Navigate to "Environment"
3. Update `FRONTEND_URL` with your actual frontend URL
4. The service will automatically redeploy

## Step 5: Alternative - Using render.yaml

If you prefer automated deployment:

1. **Update the `render.yaml`** file in your repository root with your GitHub repo URL

2. **Commit and push**:

   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

3. **Create a Blueprint on Render**:
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file
   - Follow the prompts to deploy

## Step 6: Post-Deployment Setup

1. **Test the application**:

   - Visit your frontend URL
   - Create a room
   - Test image upload
   - Test multiplayer functionality

2. **Monitor logs**:

   - Check both service logs in Render dashboard
   - Look for any connection errors

3. **Custom Domain** (optional):
   - Add custom domains in each service's settings
   - Update environment variables accordingly

## Troubleshooting

### Common Issues:

1. **Socket.io connection fails**:

   - Ensure CORS settings include your frontend URL
   - Check that NEXT_PUBLIC_SOCKET_URL is correct

2. **MongoDB connection fails**:

   - Verify MongoDB Atlas allows connections from Render IPs
   - Add `0.0.0.0/0` to IP whitelist (less secure but works)

3. **Build fails**:

   - Check Node version compatibility
   - Ensure all dependencies are in package.json
   - Check build logs for specific errors

4. **Environment variables not working**:
   - Restart the service after adding variables
   - Ensure NEXT*PUBLIC* prefix for frontend variables

### Performance Tips:

1. **Upgrade instance types** for better performance
2. **Enable auto-scaling** for production use
3. **Use Render's CDN** for static assets
4. **Monitor usage** to optimize costs

## Security Considerations:

1. **Generate secure secrets**:

   ```bash
   # Generate random strings for JWT_SECRET and SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Restrict MongoDB Atlas IPs** to Render's IP ranges (check Render docs)

3. **Enable HTTPS** (automatic on Render)

4. **Regular security updates** for dependencies

## Next Steps:

1. Set up monitoring (e.g., Sentry, LogRocket)
2. Configure backup strategies for MongoDB
3. Implement CI/CD with GitHub Actions
4. Add health check endpoints
5. Set up alerts for downtime

## Support:

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- MongoDB Atlas Support: https://www.mongodb.com/support
- Cloudinary Support: https://support.cloudinary.com
