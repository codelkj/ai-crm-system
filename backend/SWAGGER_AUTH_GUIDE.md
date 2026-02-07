# 🔐 Swagger UI Authentication Guide

## The 401 Unauthorized Error - Fixed!

If you're getting a 401 error, it means you need to authorize properly in Swagger UI.

## ✅ Correct Way to Authorize

### Step 1: Get a Token
You have 3 options:

#### Option A: Use the helper script (Easiest!)
```bash
cd backend
node get-token.js
```
This will:
- Create a new user
- Generate a JWT token
- Display it clearly for you to copy

#### Option B: Use Swagger UI
1. Scroll to **POST /auth/register** or **POST /auth/login**
2. Click "Try it out"
3. Fill in the request body
4. Click "Execute"
5. Copy the `token` from the response

#### Option C: Use curl
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Step 2: Authorize in Swagger UI

1. **Click the green "Authorize" button** at the top right of Swagger UI
2. In the popup dialog, **paste ONLY the token** (NOT "Bearer token", just the token itself)

   ❌ **WRONG:**
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ✅ **CORRECT:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Click **"Authorize"**
4. Click **"Close"**
5. You should see a **padlock icon** next to the "Authorize" button (means you're logged in)

### Step 3: Try Any Endpoint
Now all protected endpoints will work! The 401 error should be gone.

## 🔍 How to Tell If You're Authenticated

- ✅ Green padlock icon next to "Authorize" button
- ✅ "Logout" option appears in the authorization dialog
- ✅ Endpoints return 200/201 instead of 401

## 🔄 Token Expired?

JWT tokens expire after a set time. If you start getting 401 errors again:

1. Click the "Authorize" button
2. Click "Logout"
3. Get a new token (using any method above)
4. Authorize again with the new token

## 💡 Pro Tip

Keep the `get-token.js` script output in a separate terminal window. You can quickly copy-paste tokens whenever needed!

```bash
# Run this in a separate terminal
cd backend
node get-token.js
```

## 🎯 Quick Test

After authorizing, test with this endpoint:
- **GET /auth/me** - Should return your user profile (200 OK)
- If you get 401, you're not properly authenticated yet

## Common Mistakes

❌ Including "Bearer" prefix
❌ Extra spaces before/after token
❌ Using an expired token
❌ Forgetting to click "Authorize" after pasting
❌ Not clicking "Close" after authorizing

## Need Help?

If you're still getting 401 errors:
1. Check the browser console (F12) for error messages
2. Make sure the backend server is running
3. Try logging out and back in
4. Generate a fresh token using `get-token.js`
