# Research Task: React Minified Error #300

## Problem Statement
Our React production build is throwing a minified React error #300. The error manifests as:
- Page loads initially
- Then goes blank/black screen
- Error appears in console: "Uncaught Error: Minified React error #300"
- Stack trace points to `index-Dso5lm0m.js` (production bundle)

## Context

### Application Details
- **Framework**: React 18.2.0 with Vite
- **Router**: React Router DOM 6.20.0
- **State Management**: TanStack React Query 5.12.0
- **Deployment**: Render (static site)
- **Build Tool**: Vite

### Current Behavior
1. Works perfectly in development mode (`npm run dev`)
2. Works in production on **fresh incognito/new browser**
3. Fails in production on **regular browser** (cached)
4. Error appears immediately after page load, causing black screen

### Recent Changes
- Multiple admin pages with hardcoded `localhost:8000` URLs (now fixed)
- Added conditional query loading with `enabled` flags
- Admin/user auth guards and redirects
- Latest code uses proper API utilities (`adminAPI`, `authAPI`, etc.)

### Error Screenshot Location
The error shows:
```
Uncaught Error: Minified React error #300; visit
https://reactjs.org/docs/error-decoder.html?invariant=300
```

Stack trace through minified code:
- at tc (index-Dso5lm0m.js:38:17201)
- at sm (index-Dso5lm0m.js:40:44705)
- at tm (index-Dso5lm0m.js:40:39703)
- at Ox (index-Dso5lm0m.js:40:39631)
- at Va (index-Dso5lm0m.js:40:39485)
- at Go (index-Dso5lm0m.js:40:35864)
- at Qd (index-Dso5lm0m.js:40:36666)
- at Vn (index-Dso5lm0m.js:38:3274)

## Research Questions

### 1. What Does React Error #300 Mean?
- Visit https://reactjs.org/docs/error-decoder.html?invariant=300
- What is the actual unminified error message?
- What are the common causes of this specific error?
- Is this a rendering error, state error, or component lifecycle error?

### 2. Why Does It Only Happen in Production (Not Dev)?
- Does minification/bundling cause issues?
- Are there Vite-specific production build issues that could trigger this?
- Could source maps help identify the exact component causing the issue?

### 3. Why Does It Work in Fresh Incognito But Not Regular Browser?
- Is this related to:
  - Service workers?
  - Cached chunks/bundles?
  - LocalStorage/SessionStorage state?
  - Stale React components in cache?
- How does browser cache interact with React hydration/mounting?

### 4. Common Patterns That Cause Error #300
- Conditional rendering issues?
- useEffect dependencies?
- React Query configuration (refetchInterval, enabled flags)?
- Route-based code splitting issues?
- Component mounting/unmounting race conditions?

### 5. Debugging Strategy for Minified Production Errors
- How to enable source maps in Vite production builds?
- Tools to decode minified React errors?
- Best practices for React error boundaries in production?
- How to reproduce production errors locally?

### 6. React Router + React Query Specific Issues
- Known issues with React Router 6 + TanStack Query v5?
- Problems with conditional query execution (`enabled` flag)?
- Race conditions between auth checks and data fetching?
- Redirect loops causing error #300?

### 7. Vite Production Build Configuration
- Are there Vite config options that affect React error handling?
- Should we adjust minification settings?
- Build options for better error reporting in production?

## Expected Deliverables

1. **Error Definition**: Exact meaning of React error #300 with real-world examples
2. **Root Cause Analysis**: Most likely causes in our specific context (SPA + React Query + Auth Guards)
3. **Debugging Steps**: Systematic approach to identify the exact component/code causing the error
4. **Vite Configuration**: Recommended build settings for better production error visibility
5. **Fix Recommendations**: Concrete code-level fixes based on common patterns
6. **Prevention Strategy**: Best practices to avoid this error in future development

## Additional Context

### Our Architecture
- **Auth Flow**: Login → Check if admin → Redirect to /dashboard or /admin
- **Query Pattern**: useQuery with conditional `enabled` flags based on auth state
- **Admin Guards**: Both Dashboard and Admin pages check user role and redirect
- **Refetch Intervals**: Most queries have 30-second auto-refresh

### Suspected Areas (To Investigate)
1. **Dashboard.jsx**: 
   - Checks `currentUser?.is_admin` and redirects
   - Has conditional queries with `enabled: !!currentUser && !currentUser.is_admin`
   
2. **Admin.jsx**: 
   - Similar pattern but opposite check
   - Redirects non-admins to /dashboard
   
3. **Potential Race Condition**:
   - Admin logs in → Dashboard loads → Checks auth → Redirects to /admin → Admin checks auth → Queries run
   - Could this create a rendering loop?

4. **React Query Configuration**:
   - Multiple queries with `refetchInterval`
   - Conditional `enabled` flags
   - Could stale query cache cause hydration issues?

## Priority
**HIGH** - This is blocking production use for non-incognito browsers.

## Timeline
Need comprehensive research ASAP to unblock deployment.

