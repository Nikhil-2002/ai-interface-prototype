# Deployment Guide

## GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name:** `ai-interface-prototype`
   - **Description:** `A modern, responsive AI chat interface built with React, TypeScript, and Tailwind CSS`
   - **Visibility:** Public
   - **Initialize with README:** Leave unchecked (we already have one)
5. Click "Create repository"

### 2. Upload Your Code

```bash
# Initialize git in your project folder
cd D:\Assignments\predusk
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: AI Interface Prototype"

# Add your GitHub repository as origin (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/ai-interface-prototype.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Netlify Deployment

### Option 1: GitHub Integration (Recommended)

1. Go to [Netlify](https://netlify.com) and sign up/sign in
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your repositories
5. Select your `ai-interface-prototype` repository
6. Configure build settings:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
7. Click "Deploy site"
8. Wait for deployment to complete (usually 2-3 minutes)
9. Your site will get a random URL like `https://amazing-name-123456.netlify.app`
10. You can change this to a custom name in Site settings > General > Site details

### Option 2: Manual Upload

1. Build your project locally:
   ```bash
   npm run build
   ```
2. Go to [Netlify](https://netlify.com)
3. Drag and drop your `build` folder to the deployment area
4. Your site will be deployed instantly

### Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

## Environment Variables (if needed)

If you add real API keys later:

1. In Netlify dashboard, go to Site settings > Environment variables
2. Add your variables:
   - `REACT_APP_API_KEY=your_api_key_here`
   - `REACT_APP_API_URL=https://api.example.com`

## Post-Deployment Checklist

- [ ] Site loads correctly on desktop and mobile
- [ ] All animations and interactions work
- [ ] Dark/light mode toggle functions
- [ ] Chat interface is responsive
- [ ] Storybook builds and deploys (optional separate deploy)
- [ ] Update README with actual live URL
- [ ] Test all features thoroughly

## Storybook Deployment (Optional)

Deploy Storybook separately for component documentation:

1. Build Storybook:
   ```bash
   npm run build-storybook
   ```
2. Deploy the `storybook-static` folder to Netlify as a separate site
3. Update README with Storybook URL

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node version is 16+ in `netlify.toml`
- Check for any TypeScript errors

### Site Doesn't Load
- Verify `build` folder is being deployed
- Check Network tab in browser dev tools for errors
- Ensure all assets are properly referenced

### Missing Features
- Check browser console for JavaScript errors
- Verify all environment variables are set
- Test locally with `npm run build && serve -s build`

## Success Checklist

After successful deployment:

- [ ] Update README.md with actual live URL
- [ ] Update package.json with actual repository URL
- [ ] Test all functionality on the live site
- [ ] Share the live URL with stakeholders
- [ ] Create a Figma design (see DESIGN.md)
- [ ] Document any deployment-specific configurations
