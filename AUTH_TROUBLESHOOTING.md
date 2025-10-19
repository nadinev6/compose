# Authentication Troubleshooting Guide

## Issue: Redirected to `/login#` after OAuth

You're experiencing a redirect to `http://localhost:3000/login#` after signing in with Google. Here's how to fix it:

### **Solution 1: Check Supabase OAuth Configuration**

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/wiogzpkmqybkajogauyl
   - Go to **Authentication** → **URL Configuration**

2. **Set Site URL**
   ```
   http://localhost:3000
   ```

3. **Set Redirect URLs**
   Add these to the "Redirect URLs" list:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/*
   ```

4. **Save Changes**

### **Solution 2: Check Browser Console**

After clicking "Sign in with Google":

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these log messages:
   - `🔍 Auth callback received:` - Shows if callback is being hit
   - `✅ Session created successfully:` - Shows if session was created
   - Any error messages

4. Go to Network tab
5. Look for the redirect chain:
   - Should go: `/login` → Google → `/auth/callback` → `/`
   - If it goes to `/login#`, the callback might not be processing correctly

### **Solution 3: Check Cookies**

1. Open DevTools → Application tab → Cookies
2. Look for cookies from `localhost:3000`
3. You should see Supabase auth cookies like:
   - `sb-wiogzpkmqybkajogauyl-auth-token`
   - `sb-wiogzpkmqybkajogauyl-auth-token-code-verifier`

If cookies are missing, the session isn't being set properly.

### **Solution 4: Clear Browser Data**

Sometimes old cookies cause issues:

1. Open DevTools → Application → Storage
2. Click "Clear site data"
3. Restart the dev server: `npm run dev`
4. Try signing in again

### **Solution 5: Check Server Logs**

Look at your terminal where `npm run dev` is running:

You should see:
```
🔍 Auth callback received: { code: 'present', error: null, url: '...' }
✅ Session created successfully: your-email@gmail.com
```

If you see errors, they'll help identify the issue.

### **Solution 6: Verify Google OAuth Configuration**

In Google Cloud Console, ensure:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://wiogzpkmqybkajogauyl.supabase.co
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://wiogzpkmqybkajogauyl.supabase.co/auth/v1/callback
```

### **Solution 7: Test the Flow Manually**

1. Clear all cookies
2. Go to `http://localhost:3000`
3. You should be redirected to `/login`
4. Click "Sign in with Google"
5. Authorize the app
6. Watch the URL bar - it should go:
   - `accounts.google.com` (Google login)
   - `http://localhost:3000/auth/callback?code=...` (callback)
   - `http://localhost:3000/` (home page)

If it stops at `/login#`, check the server logs.

### **Common Causes:**

1. **Supabase Site URL not set** - Most common issue
2. **Redirect URLs not configured** - Second most common
3. **Cookies not being set** - Usually a server-side issue
4. **Old session data** - Clear cookies and try again
5. **Google OAuth misconfigured** - Check redirect URIs

### **Quick Fix Commands:**

```bash
# Stop the dev server
Ctrl+C

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### **Still Not Working?**

Check these in order:

1. ✅ Supabase Site URL is `http://localhost:3000`
2. ✅ Supabase Redirect URLs include `http://localhost:3000/auth/callback`
3. ✅ Google OAuth has correct origins and redirect URIs
4. ✅ Browser cookies are enabled
5. ✅ No browser extensions blocking cookies
6. ✅ Server logs show successful session creation

### **Debug Information to Collect:**

If still having issues, collect this info:

1. **Browser Console Logs** (F12 → Console)
2. **Server Terminal Logs** (where npm run dev is running)
3. **Network Tab** (F12 → Network, filter by "callback")
4. **Cookies** (F12 → Application → Cookies)
5. **The exact URL** you're redirected to (copy from address bar)

---

## Expected Behavior:

✅ Click "Sign in with Google"
✅ Redirected to Google login
✅ Authorize the app
✅ Redirected to `/auth/callback?code=...`
✅ Session created
✅ Redirected to `/` (home page)
✅ See main application interface

## What You're Seeing:

❌ After Google authorization
❌ Redirected to `/login#`
❌ Not logged in

This usually means the callback isn't processing the code properly or the session isn't being set.
