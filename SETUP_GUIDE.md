# 🚀 Setup and Testing Guide - Wedding Photo Studio

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

## 📦 Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PHOTO_STUDIO
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` file and configure:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/wedding-photo-studio

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_change_me

# Upload Path
UPLOAD_PATH=/tmp/photo-studio/uploads

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Return to root directory
cd ..
```

### 5. Start MongoDB

#### On macOS (with Homebrew):
```bash
brew services start mongodb-community
```

#### On Linux:
```bash
sudo systemctl start mongod
```

#### On Windows:
```bash
net start MongoDB
```

#### Or run MongoDB manually:
```bash
mongod --dbpath /path/to/data/directory
```

## 🎯 Running the Application

### Option 1: Run Both Servers Simultaneously (Recommended)

```bash
# From root directory
npm run dev-all
```

This will start:
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:3000

### Option 2: Run Servers Separately

#### Terminal 1 - Backend:
```bash
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd client
npm start
```

## 🧪 Testing the Application

### 1. Test User Registration

1. Navigate to http://localhost:3000/register
2. Fill in the registration form:
   - **Full Name**: John Photographer
   - **Studio Name**: John's Wedding Studio
   - **Email**: john@example.com
   - **Phone**: +1 (555) 123-4567
   - **Password**: password123
   - **Confirm Password**: password123
3. Click "Register"
4. You should be redirected to the dashboard

### 2. Test Event Creation

1. Click "Create New Event" button
2. Fill in event details:
   - **Event Name**: Sarah & Mike Wedding
   - **Client Name**: Sarah Johnson
   - **Event Date**: Select a date
   - **Event Type**: Wedding
   - **Gallery Type**: Public
   - **Venue**: Grand Hotel Ballroom
   - **City**: New York
   - **State**: NY
3. Click "Create Event"
4. Note the **Access Code** generated (e.g., ABC123DEF)

### 3. Test Photo Upload

1. Click on the newly created event
2. Go to the "Photos" tab
3. Click "Upload Photos"
4. Select 5-10 sample wedding images from your computer
5. Wait for upload to complete
6. Photos should appear in the gallery with thumbnails

### 4. Test QR Code Generation

1. In the event details, go to "Settings" tab
2. You should see the auto-generated QR code
3. Click "Download QR" button to download it

### 5. Test Guest Gallery Access

1. Copy the access code from your event
2. Open a new incognito/private browser window
3. Navigate to: `http://localhost:3000/gallery/YOUR_ACCESS_CODE`
4. You should see the event gallery with all photos
5. Try clicking on photos to view them

### 6. Test Download Control

1. In photographer dashboard, try to download a photo from guest gallery
2. It should show "Downloads are currently disabled"
3. Go back to event details as photographer
4. Click "Enable Downloads" button
5. Return to guest gallery and try downloading again
6. Download should work now

### 7. Test Profile Management

1. Click on your name in the navbar
2. Click "Profile"
3. Update your information:
   - Add website URL
   - Add social media links (Instagram, Facebook)
   - Update phone number
4. Click "Save Changes"
5. Verify changes are saved

### 8. Test Analytics

1. From dashboard, view event statistics
2. Check total events, photos, guests counts
3. View recent activity (views/downloads)
4. Click on an event to see detailed analytics

## 🐛 Common Issues and Solutions

### Issue 1: MongoDB Connection Error

**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod --dbpath /path/to/data
```

### Issue 2: Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Kill the process using port 5000
# On macOS/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue 3: Upload Directory Permission Error

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Create upload directory with proper permissions
sudo mkdir -p /tmp/photo-studio/uploads
sudo chmod 777 /tmp/photo-studio/uploads
```

### Issue 4: Tailwind CSS Not Working

**Solution**:
```bash
# Rebuild the frontend
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue 5: Photos Not Displaying

**Solution**:
- Check if uploads directory exists and has proper permissions
- Verify `UPLOAD_PATH` in `.env` matches actual directory
- Check browser console for 404 errors
- Ensure images are valid format (JPG, PNG, etc.)

## 📝 API Endpoints Testing

You can test API endpoints using tools like:
- **Postman**
- **cURL**
- **Thunder Client** (VS Code Extension)

### Test Authentication:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "studioName": "Test Studio"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Events (with authentication):

```bash
# Get all events (replace TOKEN with your JWT)
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create event
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Test Wedding",
    "clientName": "Test Client",
    "eventDate": "2024-12-31",
    "eventType": "wedding"
  }'
```

## 🎨 Frontend Routes

- `/` - Home (redirects to dashboard if logged in)
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Photographer dashboard
- `/events` - Events list
- `/events/:id` - Event details
- `/profile` - Profile management
- `/gallery/:accessCode` - Guest gallery (public)

## 🔐 Test Accounts

After first setup, create test accounts with different roles:

**Photographer Account:**
- Email: photographer@test.com
- Password: test123456
- Studio: Test Photography Studio

**For testing as guest:**
- Use the generated access codes from events
- No login required for guest galleries

## 📱 Mobile Responsiveness Testing

Test on different screen sizes:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667 (iPhone SE)
- Mobile: 390x844 (iPhone 12)

Use browser DevTools to test responsive design:
1. Press F12 (Chrome/Firefox)
2. Click "Toggle Device Toolbar"
3. Select different devices

## 🚀 Production Build

### Build Frontend:
```bash
cd client
npm run build
```

### Run Production Server:
```bash
# Set environment to production
export NODE_ENV=production

# Start server
npm start
```

## 📊 Performance Testing

1. **Load Testing**: Test with multiple concurrent uploads
2. **Database Performance**: Test with 1000+ photos
3. **Image Processing**: Test thumbnail generation speed
4. **Download Speed**: Test large image downloads

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] MongoDB is running and accessible
- [ ] Backend server starts without errors
- [ ] Frontend compiles and runs
- [ ] Can register a new photographer account
- [ ] Can create a new event
- [ ] Can upload photos (multiple files)
- [ ] Thumbnails are generated correctly
- [ ] QR codes are generated
- [ ] Guest gallery is accessible via access code
- [ ] Download control works (enable/disable)
- [ ] Profile updates save correctly
- [ ] Analytics dashboard shows data
- [ ] All routes are accessible
- [ ] Mobile layout looks good
- [ ] No console errors in browser

## 🆘 Need Help?

If you encounter issues:
1. Check the error logs in terminal
2. Check browser console (F12)
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Check file permissions on upload directory
6. Review environment variables in `.env`

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Ready to start? Run `npm run dev-all` and open http://localhost:3000** 🎉
