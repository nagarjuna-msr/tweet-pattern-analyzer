# Research Task: Render Static Site SPA Routing Configuration

## Problem Statement

We have a React SPA (Single Page Application) with React Router deployed on Render as a static site using Blueprint (render.yaml). The application has the following symptoms:

### Symptoms:
1. **Root path works**: `https://pattern-analyzer-frontend.onrender.com/` loads correctly
2. **Direct route access fails**: `https://pattern-analyzer-frontend.onrender.com/dashboard` returns 404
3. **Refresh on route fails**: After navigating to `/dashboard` via React Router, refreshing the page returns 404
4. **Tested in incognito**: Same behavior, ruling out browser cache

### Current Configuration:

**render.yaml:**
```yaml
- type: web
  name: pattern-analyzer-frontend
  runtime: static
  region: oregon
  branch: main
  rootDir: frontend
  buildCommand: npm install && npm run build
  staticPublishPath: dist
  autoDeploy: true
  routes:
    - type: rewrite
      source: /*
      destination: /index.html
  envVars:
    - key: VITE_API_URL
      value: https://pattern-analyzer-api.onrender.com
```

**_redirects file** (in `frontend/public/_redirects`):
```
/*    /index.html   200
```

**Build output**: Vite copies the `_redirects` file to `dist/_redirects` correctly.

### Verification:

1. `curl -I https://pattern-analyzer-frontend.onrender.com/` returns **200 OK**
2. `curl -I https://pattern-analyzer-frontend.onrender.com/dashboard` returns **404**
3. The `_redirects` file exists in the build output (`dist/_redirects`)
4. Deployment status: **live** (commit: 57c49a24e497e503da5699a8dd20436e010ad80f)

## Questions for Research:

1. **Does Render static site (type: web, runtime: static) support the `routes` configuration in render.yaml?**
   - If yes, what is the correct syntax?
   - If no, what is the alternative approach?

2. **Does Render honor `_redirects` file for Blueprint-based static site deployments?**
   - Documentation suggests it should work
   - Testing shows it doesn't work
   - Is there a specific requirement or limitation?

3. **What is the definitive, working solution for SPA routing on Render static sites deployed via Blueprint?**
   - Should we use render.yaml routes configuration?
   - Should we use _redirects file?
   - Should we use a different service type?
   - Are there any known issues or limitations?

4. **Is there a difference between manually created static sites vs. Blueprint-deployed static sites?**
   - Do they handle routing differently?
   - Do they require different configuration?

5. **Alternative approaches:**
   - Should we deploy the frontend as a regular web service with a simple HTTP server (like `serve` npm package)?
   - Would that be more reliable for SPA routing?

## Environment Details:

- **Platform**: Render (render.com)
- **Deployment Method**: Blueprint (render.yaml)
- **Service Type**: Static Site (type: web, runtime: static)
- **Framework**: React 18 with Vite 5
- **Router**: React Router v6
- **Build Command**: `npm install && npm run build`
- **Publish Path**: `dist`
- **Region**: Oregon

## Expected Outcome:

We need a **definitive, tested solution** that:
1. Allows direct access to any React Router path (e.g., `/dashboard`)
2. Allows page refresh on any route without 404
3. Works on Render static sites deployed via Blueprint
4. Is documented and supported by Render

## Additional Context:

- The application works perfectly on local development (Vite dev server)
- The build itself is successful (no errors)
- The `index.html` is served correctly at the root path
- Only client-side routes fail with 404
- This is a critical blocker for production deployment

Please provide a comprehensive research report with:
- Root cause analysis
- Step-by-step solution
- Alternative approaches if primary solution doesn't exist
- Links to official documentation
- Working examples if available

