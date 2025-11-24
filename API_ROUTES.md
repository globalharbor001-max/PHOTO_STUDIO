# 🔗 API Routes Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication Required
All routes marked with 🔒 require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Routes (`/api/auth`)

### Register New Photographer
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "photographer@example.com",
  "password": "password123",
  "name": "John Doe",
  "studioName": "John's Photography Studio",
  "phone": "+1 (555) 123-4567"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "photographer@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Get Current User 🔒
```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "data": { user_object }
}
```

### Update Profile 🔒
```http
PUT /api/auth/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "studioName": "New Studio Name",
  "phone": "+1 (555) 999-8888",
  "website": "https://mystudio.com",
  "socialMedia": {
    "instagram": "@mystudio",
    "facebook": "facebook.com/mystudio",
    "twitter": "@mystudio"
  }
}
```

### Change Password 🔒
```http
PUT /api/auth/password
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Upload Logo 🔒
```http
POST /api/auth/logo
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Form Data:
- logo: [image file]
```

---

## 📅 Event Routes (`/api/events`)

### Create Event 🔒
```http
POST /api/events
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "eventName": "Sarah & Mike Wedding",
  "clientName": "Sarah Johnson",
  "eventDate": "2024-12-31",
  "eventType": "wedding",
  "galleryType": "public",
  "location": {
    "venue": "Grand Hotel",
    "city": "New York",
    "state": "NY"
  },
  "notes": "Outdoor ceremony at 3pm"
}

Response: 201 Created
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "_id": "event_id",
    "accessCode": "ABC123XY",
    "qrCode": "data:image/png;base64...",
    ...
  }
}
```

### Get All Events 🔒
```http
GET /api/events
GET /api/events?status=active
GET /api/events?eventType=wedding
GET /api/events?search=sarah

Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "count": 10,
  "data": [ array_of_events ]
}
```

### Get Single Event 🔒
```http
GET /api/events/:id
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "data": { event_object_with_stats }
}
```

### Update Event 🔒
```http
PUT /api/events/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "eventName": "Updated Name",
  "downloadsEnabled": true
}
```

### Delete Event 🔒
```http
DELETE /api/events/:id
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### Get Event by Access Code (Public)
```http
GET /api/events/access/:code
GET /api/events/access/ABC123XY

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "event_id",
    "eventName": "Sarah & Mike Wedding",
    "eventDate": "2024-12-31",
    "downloadsEnabled": false,
    "photographer": { ... }
  }
}
```

### Toggle Downloads 🔒
```http
PUT /api/events/:id/downloads
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "message": "Downloads enabled successfully",
  "data": {
    "downloadsEnabled": true
  }
}
```

### Regenerate QR Code 🔒
```http
POST /api/events/:id/qr-code
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "message": "QR code regenerated successfully",
  "data": {
    "qrCode": "data:image/png;base64..."
  }
}
```

---

## 📸 Photo Routes (`/api/photos`)

### Upload Photos 🔒
```http
POST /api/photos/events/:eventId/photos
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Form Data:
- photos: [file1, file2, file3, ...]
- subEvent: "Sangeet" (optional)

Response: 201 Created
{
  "success": true,
  "message": "10 photos uploaded successfully",
  "data": [ array_of_photo_objects ]
}
```

### Get Event Photos
```http
GET /api/photos/events/:eventId/photos
GET /api/photos/events/:eventId/photos?subEvent=Sangeet
GET /api/photos/events/:eventId/photos?page=2&limit=50
GET /api/photos/events/:eventId/photos?guestId=guest123

Authorization: Optional (Bearer YOUR_TOKEN for private access)

Response: 200 OK
{
  "success": true,
  "data": [ array_of_photos ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Get Single Photo
```http
GET /api/photos/:id

Response: 200 OK
{
  "success": true,
  "data": { photo_object }
}
```

### Download Photo
```http
GET /api/photos/:id/download

Response: File download (if downloads enabled)
OR
Response: 403 Forbidden
{
  "success": false,
  "message": "Downloads are currently disabled for this event"
}
```

### Add Watermark to Photo 🔒
```http
POST /api/photos/:id/watermark
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "message": "Watermark added successfully",
  "data": { updated_photo }
}
```

### Add Watermark to All Photos 🔒
```http
POST /api/photos/events/:eventId/photos/watermark-all
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "message": "Watermark process completed",
  "data": {
    "successCount": 45,
    "errorCount": 0,
    "totalProcessed": 45
  }
}
```

### Update Photo Tags 🔒
```http
PUT /api/photos/:id/tags
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "taggedGuests": ["guest_id_1", "guest_id_2"],
  "manualTags": ["John", "Jane", "Uncle Bob"]
}
```

### Delete Photo 🔒
```http
DELETE /api/photos/:id
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

---

## 👥 Guest Routes (`/api/guests`)

### Create Guest 🔒
```http
POST /api/guests/events/:eventId/guests
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "relation": "bride-side",
  "notes": "Best man"
}

Response: 201 Created
{
  "success": true,
  "message": "Guest created successfully",
  "data": {
    "_id": "guest_id",
    "guestId": "XYZ789ABC",
    ...
  }
}
```

### Bulk Create Guests 🔒
```http
POST /api/guests/events/:eventId/guests/bulk
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "guests": [
    {
      "name": "Guest 1",
      "email": "guest1@example.com",
      "relation": "bride-side"
    },
    {
      "name": "Guest 2",
      "email": "guest2@example.com",
      "relation": "groom-side"
    }
  ]
}

Response: 201 Created
{
  "success": true,
  "message": "5 guests created successfully",
  "data": [ array_of_guests ]
}
```

### Get Event Guests 🔒
```http
GET /api/guests/events/:eventId/guests
GET /api/guests/events/:eventId/guests?search=john
GET /api/guests/events/:eventId/guests?relation=bride-side

Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "count": 50,
  "data": [ array_of_guests ]
}
```

### Get Single Guest
```http
GET /api/guests/:id

Response: 200 OK
{
  "success": true,
  "data": { guest_object }
}
```

### Update Guest 🔒
```http
PUT /api/guests/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Delete Guest 🔒
```http
DELETE /api/guests/:id
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "message": "Guest deleted successfully"
}
```

### Get Guest Photos (Public)
```http
GET /api/guests/:id/photos

Response: 200 OK
{
  "success": true,
  "data": {
    "guest": {
      "name": "John Smith",
      "photoCount": 25,
      "event": { ... }
    },
    "photos": [ array_of_tagged_photos ]
  }
}
```

---

## 📊 Analytics Routes (`/api/analytics`)

### Get Dashboard Statistics 🔒
```http
GET /api/analytics/dashboard
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "data": {
    "overview": {
      "totalEvents": 15,
      "activeEvents": 8,
      "totalPhotos": 1250,
      "totalGuests": 450
    },
    "recentActivity": {
      "views": 3420,
      "downloads": 856,
      "access": 123
    },
    "recentEvents": [ ... ]
  }
}
```

### Get Event Analytics 🔒
```http
GET /api/analytics/events/:eventId
GET /api/analytics/events/:eventId?startDate=2024-01-01&endDate=2024-12-31

Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "data": {
    "overview": {
      "totalPhotos": 150,
      "totalViews": 2340,
      "totalDownloads": 456,
      "uniqueGuests": 75
    },
    "topPhotos": [ ... ],
    "guestEngagement": [ ... ],
    "dailyActivity": [ ... ]
  }
}
```

### Get Photo Analytics 🔒
```http
GET /api/analytics/photos/:id
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "success": true,
  "data": {
    "photo": { ... },
    "analytics": {
      "view": 45,
      "download": 12
    },
    "timeline": [ ... ]
  }
}
```

---

## 🏥 Health Check

### Check API Status
```http
GET /api/health

Response: 200 OK
{
  "success": true,
  "message": "Wedding Photo Studio API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📁 Static Files

### Uploaded Images
```http
GET /uploads/filename.jpg
GET /uploads/thumbnails/filename.jpg
GET /uploads/watermarked/filename.jpg
```

---

## ⚠️ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in or invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing with cURL

### Example: Complete workflow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "studioName": "Test Studio"
  }'

# 2. Login (save the token)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.data.token')

# 3. Create Event
EVENT_ID=$(curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Test Wedding",
    "clientName": "Client Name",
    "eventDate": "2024-12-31",
    "eventType": "wedding"
  }' | jq -r '.data._id')

# 4. Upload Photo
curl -X POST http://localhost:5000/api/photos/events/$EVENT_ID/photos \
  -H "Authorization: Bearer $TOKEN" \
  -F "photos=@/path/to/photo.jpg"

# 5. Get Event Details
curl -X GET http://localhost:5000/api/events/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notes

- All date fields accept ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
- File uploads use `multipart/form-data` encoding
- Maximum file size: 10MB per image
- Supported image formats: JPG, JPEG, PNG, GIF, WEBP, HEIC, HEIF
- JWT tokens expire after 30 days
- QR codes are generated automatically and returned as Base64 data URLs

---

**Need more info? Check the source code in `/controllers` directory!**
