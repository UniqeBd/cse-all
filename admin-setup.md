# Admin Account Setup Guide

## Creating Admin Account

### Step 1: Start the Website

1. Open `index.html` in your web browser
2. Or use a local server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Then visit http://localhost:8000
   ```

### Step 2: Create Admin Account

1. **Click "Login" button** on the website
2. **Click "Sign up"** to create new account
3. **Enter the following details:**
   - **Email:** `alshan.200112456@smuct.ac.bd`
   - **Password:** `HaXon@3211`
   - **Confirm Password:** `HaXon@3211`
4. **Click "Sign Up"**

### Step 3: Set Admin Privileges

After creating the account, you need to manually set admin privileges in Firebase:

#### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`study-dd515`)
3. Go to **Realtime Database**
4. Navigate to `users` → find your user ID
5. Add a new child: `isAdmin: true`

#### Option B: Using Browser Console (Quick Method)

1. After logging in to your website, open browser developer tools (F12)
2. Go to **Console** tab
3. Run this command:
   ```javascript
   // Get current user ID
   const userId = firebase.auth().currentUser.uid;
   // Set admin status
   firebase.database().ref(`users/${userId}/isAdmin`).set(true)
     .then(() => console.log('Admin status set successfully!'))
     .catch(error => console.error('Error:', error));
   ```
4. Refresh the page

### Step 4: Verify Admin Access

1. **Refresh the website**
2. **Login with your admin account**
3. You should now see:
   - **"Admin Panel" button** in the navigation
   - **Access to chat management**
   - **Ability to add subjects and materials**

## Admin Account Details

- **Email:** alshan.200112456@smuct.ac.bd
- **Password:** HaXon@3211
- **Role:** Administrator
- **Permissions:** Full access to admin panel, chat management, content management

## What You Can Do as Admin

### Study Materials Management
- ✅ Add new subjects
- ✅ Upload study materials (via GitHub URLs)
- ✅ Edit existing materials
- ✅ Delete materials
- ✅ Organize content by subjects

### Chat Management
- ✅ View all user chats
- ✅ See complete message history
- ✅ Manage inactive chats
- ✅ Send messages to users
- ✅ Unsend messages when needed

### User Management
- ✅ Monitor user registrations
- ✅ Manage user permissions
- ✅ View user activity

## Testing Your Admin Account

1. **Login as admin**
2. **Click "Admin Panel"**
3. **Add a test subject:**
   - Name: "Data Structures"
   - Description: "Fundamental data structures and algorithms"
4. **Add a test material:**
   - Subject: Data Structures
   - Title: "Binary Trees Tutorial"
   - URL: Any GitHub raw URL (or a sample PDF link)
   - Type: PDF
5. **Test chat functionality** by creating a regular user account and messaging

## Troubleshooting

### If Admin Panel doesn't appear:
1. Check that `isAdmin: true` is set in Firebase Database
2. Refresh the page after setting admin status
3. Clear browser cache if needed

### If you can't access Firebase Console:
1. Make sure you're logged into the Google account associated with the Firebase project
2. The project ID is: `study-dd515`

### If login fails:
1. Check that Firebase Authentication is enabled
2. Verify email/password authentication is turned on
3. Check browser console for error messages

## Security Note

The admin credentials are:
- **Email:** alshan.200112456@smuct.ac.bd
- **Password:** HaXon@3211

**Important:** Keep these credentials secure and only share with trusted administrators.
