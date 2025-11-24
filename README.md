# 📸 Wedding Photo Studio - Full Stack Application

A complete wedding photography studio platform similar to Kwikpic.in, built with Node.js, Express, MongoDB, and React. This platform enables photographers to manage events, upload photos, generate QR codes for guest access, and control photo downloads.

## 🎯 Features

### For Photographers
- **User Authentication** - Secure login/registration with JWT
- **Event Management** - Create and manage multiple wedding events
- **Photo Upload** - Bulk upload photos with automatic thumbnail generation
- **QR Code Generation** - Generate unique QR codes for each event
- **Download Control** - Enable/disable photo downloads (payment protection)
- **Watermarking** - Protect photos with text or logo watermarks
- **Guest Management** - Add and manage guest lists
- **Photo Tagging** - Tag guests in photos for easy discovery
- **Analytics Dashboard** - Track views, downloads, and engagement
- **Photographer Branding** - Add logo, website, and social media links

### For Guests
- **QR Code Access** - Easy gallery access via QR code scan
- **Photo Viewing** - Browse event photos in beautiful galleries
- **Photo Download** - Download photos when enabled by photographer
- **Tagged Photos** - View only their tagged photos (in public galleries)

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File uploads
- **Sharp** - Image processing & watermarking
- **QRCode** - QR code generation
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Icons** - Icons
- **Date-fns** - Date formatting

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd PHOTO_STUDIO
\`\`\`

2. Install backend dependencies:
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and update the following:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong secret key for JWT
- `UPLOAD_PATH` - Path to store uploaded images (default: /tmp/photo-studio/uploads)

4. Start MongoDB:
\`\`\`bash
# Make sure MongoDB is running
mongod
\`\`\`

5. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

The backend API will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
\`\`\`bash
cd client
\`\`\`

2. Install frontend dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the React development server:
\`\`\`bash
npm start
\`\`\`

The frontend will be running at `http://localhost:3000`

### Running Both Servers Concurrently

From the root directory:
\`\`\`bash
npm run dev-all
\`\`\`

## 📁 Project Structure

\`\`\`
PHOTO_STUDIO/
├── server.js                 # Express server entry point
├── package.json             # Backend dependencies
├── .env                     # Environment variables
├── models/                  # Mongoose models
│   ├── User.js             # Photographer model
│   ├── Event.js            # Event model
│   ├── Photo.js            # Photo model
│   ├── Guest.js            # Guest model
│   └── Analytics.js        # Analytics model
├── controllers/            # Route controllers
│   ├── authController.js
│   ├── eventController.js
│   ├── photoController.js
│   ├── guestController.js
│   └── analyticsController.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── events.js
│   ├── photos.js
│   ├── guests.js
│   └── analytics.js
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── upload.js         # File upload handling
│   └── errorHandler.js   # Error handling
├── utils/                # Utility functions
│   ├── qrCode.js        # QR code generation
│   ├── watermark.js     # Image watermarking
│   └── jwt.js           # JWT utilities
├── config/              # Configuration
│   └── database.js      # MongoDB connection
└── client/              # React frontend
    ├── public/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── context/     # React context (Auth)
    │   ├── services/    # API services
    │   ├── App.js       # Main app component
    │   └── index.js     # Entry point
    └── package.json     # Frontend dependencies
\`\`\`

## 🚀 Usage

### 1. Register as a Photographer
- Visit `http://localhost:3000/register`
- Fill in your details (name, studio name, email, password)
- Click "Register"

### 2. Create an Event
- Login to your dashboard
- Click "Create New Event"
- Fill in event details (name, client, date, type, etc.)
- Click "Create Event"
- A unique access code and QR code will be generated

### 3. Upload Photos
- Navigate to the event details page
- Click "Upload Photos"
- Select multiple photos from your device
- Photos will be uploaded and thumbnails generated automatically

### 4. Manage Guests
- Go to the "Guests" tab in event details
- Add guest information
- Tag guests in photos for easy discovery

### 5. Share with Guests
- Download the QR code or share the access code
- Guests can visit: `http://localhost:3000/gallery/ACCESS_CODE`
- Guests can view and download photos (if enabled)

### 6. Control Downloads
- Toggle downloads on/off from the event details page
- Useful for ensuring payment before allowing downloads

### 7. Add Watermarks
- Configure watermark settings in your profile
- Apply watermarks to individual photos or bulk watermark all photos
- Supports text watermarks and logo watermarks

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new photographer
- `POST /api/auth/login` - Login photographer
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logo` - Upload logo

### Events
- `POST /api/events` - Create event
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/access/:code` - Get event by access code (public)
- `PUT /api/events/:id/downloads` - Toggle downloads
- `POST /api/events/:id/qr-code` - Regenerate QR code

### Photos
- `POST /api/photos/events/:eventId/photos` - Upload photos
- `GET /api/photos/events/:eventId/photos` - Get event photos
- `GET /api/photos/:id` - Get single photo
- `GET /api/photos/:id/download` - Download photo
- `POST /api/photos/:id/watermark` - Add watermark
- `POST /api/photos/events/:eventId/photos/watermark-all` - Bulk watermark
- `PUT /api/photos/:id/tags` - Update photo tags
- `DELETE /api/photos/:id` - Delete photo

### Guests
- `POST /api/guests/events/:eventId/guests` - Create guest
- `POST /api/guests/events/:eventId/guests/bulk` - Bulk create guests
- `GET /api/guests/events/:eventId/guests` - Get event guests
- `GET /api/guests/:id` - Get single guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest
- `GET /api/guests/:id/photos` - Get guest photos

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/events/:eventId` - Get event analytics
- `GET /api/analytics/photos/:id` - Get photo analytics

## 🌐 Environment Variables

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/wedding-photo-studio

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_in_production

# File Upload Configuration
UPLOAD_PATH=/tmp/photo-studio/uploads
MAX_FILE_SIZE=10485760

# Application URL
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
\`\`\`

## 📝 Database Schema

### User (Photographer)
- email, password, name, studioName, phone
- logo, website, socialMedia
- watermarkSettings (enabled, text, opacity, position)

### Event
- photographer, eventName, clientName, eventDate, eventType
- accessCode, qrCode, galleryType
- downloadsEnabled, downloadMessage
- totalPhotos, totalViews, totalDownloads

### Photo
- event, subEvent, filename, filePath, thumbnailPath
- taggedGuests, manualTags
- isWatermarked, watermarkedPath
- views, downloads

### Guest
- event, name, email, phone, guestId
- photoCount, accessCount, lastAccessDate

### Analytics
- event, photo, guest, actionType
- timestamp, metadata

## 🎨 Features Comparison with Kwikpic.in

| Feature | This App | Kwikpic.in |
|---------|----------|------------|
| Event Management | ✅ | ✅ |
| Photo Upload | ✅ | ✅ |
| QR Code Generation | ✅ | ✅ |
| Download Control | ✅ | ✅ |
| Watermarking | ✅ | ✅ |
| Guest Management | ✅ | ✅ |
| Photo Tagging | ✅ (Manual) | ✅ (AI) |
| Analytics | ✅ | ✅ |
| Photographer Branding | ✅ | ✅ |
| AI Face Recognition | ❌ | ✅ |
| Mobile App | ❌ | ✅ |

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)

1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible (MongoDB Atlas recommended)
3. Set `NODE_ENV=production`
4. Build and deploy

### Frontend Deployment (Vercel/Netlify)

1. Build the React app:
\`\`\`bash
cd client
npm run build
\`\`\`

2. Deploy the `build` folder to your hosting platform
3. Configure environment variables (API URL)

### Full Stack Deployment

For production, serve the React build from Express:
\`\`\`bash
npm run build
# The server will serve frontend from client/build in production
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Wedding Photo Studio Platform - Built for professional wedding photographers

## 🙏 Acknowledgments

- Inspired by Kwikpic.in
- Built with modern web technologies
- Designed for real-world wedding photography workflows

## 📞 Support

For support, please create an issue in the repository or contact the development team.

---

**Happy Photographing! 📸✨**

Sources:
- [AI Photo Sharing For Events And Weddings With Kwikpic](https://www.kwikpic.in/blog/ai-photo-sharing-for-events/)
- [Effortless Photo Sharing In Indian Weddings Through Kwikpic](https://www.kwikpic.in/blog/photo-sharing-in-indian-weddings/)
