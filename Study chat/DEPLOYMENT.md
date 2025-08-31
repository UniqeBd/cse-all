# Deployment Guide

## Prerequisites

1. **GitHub Account**: You'll need a GitHub account to store your repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Firebase Project**: Already configured in the code

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `cse-study-hub`
3. Make it public (required for free Vercel deployment)
4. Don't initialize with README (we already have one)

## Step 2: Upload Files to GitHub

### Option A: Using Git (Recommended)

1. Open terminal/command prompt in your project folder
2. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CSE Study Hub website"
   ```

3. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cse-study-hub.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Using GitHub Web Interface

1. Go to your repository on GitHub
2. Click "uploading an existing file"
3. Drag and drop all your project files
4. Commit the changes

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

5. Click "Deploy"
6. Wait for deployment to complete (usually 1-2 minutes)

## Step 4: Configure Firebase (If Needed)

The Firebase configuration is already included in the code. However, if you want to use your own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
4. Enable Realtime Database:
   - Go to Realtime Database
   - Create database in test mode
   - Copy the database URL
5. Get your configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Add a web app and copy the config

6. Update `js/firebase-config.js` with your configuration

## Step 5: Set Up Firebase Security Rules

1. Go to Firebase Console > Realtime Database > Rules
2. Replace the default rules with the content from `firebase-rules.json`
3. Publish the rules

## Step 6: Create Admin User

Since this is the initial setup, you'll need to manually create an admin user:

1. Go to your deployed website
2. Sign up with your admin email
3. Go to Firebase Console > Realtime Database
4. Find your user under `users > [your-user-id]`
5. Add a field `isAdmin: true` to your user object

## Step 7: Test Your Website

1. Visit your Vercel URL (provided after deployment)
2. Test user registration and login
3. Test admin panel access (after setting admin status)
4. Test chat functionality
5. Test adding subjects and materials

## Ongoing Maintenance

### Updating Your Website

1. Make changes to your local files
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. Vercel will automatically redeploy your site

### Adding Study Materials

1. Upload your study materials (PDFs, images) to your GitHub repository in an `assets` folder
2. Use the GitHub raw URLs in the admin panel when adding materials
3. Example URL format: `https://raw.githubusercontent.com/username/repo/main/assets/material.pdf`

### Managing Users

- Monitor user registrations in Firebase Console
- Manage admin permissions by updating the `isAdmin` field in the database
- View chat logs and user activity

## Troubleshooting

### Common Issues

1. **Chat not working**: Check Firebase configuration and database rules
2. **Admin panel not accessible**: Verify `isAdmin: true` is set in database
3. **Materials not loading**: Ensure GitHub URLs are correct and public
4. **Login issues**: Check Firebase Authentication configuration

### Support

- Check browser console for error messages
- Verify Firebase configuration
- Ensure all files are properly uploaded to GitHub
- Check Vercel deployment logs

## Security Considerations

1. **Firebase Rules**: The included rules provide basic security
2. **HTTPS**: Vercel provides HTTPS by default
3. **Input Validation**: The code includes basic input sanitization
4. **Admin Access**: Only set `isAdmin: true` for trusted users

## Performance Optimization

1. **CDN**: Vercel provides global CDN automatically
2. **Caching**: Static assets are cached automatically
3. **Compression**: Vercel handles compression
4. **Image Optimization**: Consider using optimized images for better performance

## Custom Domain (Optional)

1. Purchase a domain from any provider
2. In Vercel dashboard, go to your project settings
3. Add your custom domain
4. Update DNS settings as instructed by Vercel

Your CSE Study Hub website is now live and accessible globally! 🚀
