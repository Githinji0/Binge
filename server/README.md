# Binge Streaming Platform Backend REST API

This is the production-ready backend for the Binge mobile streaming platform, built with Node.js, Express, MongoDB, and Mongoose.

## Technical Details & Binding Configuration

### Connecting from Mobile Devices
The server binds to `0.0.0.0` instead of `localhost`:
```javascript
app.listen(PORT, '0.0.0.0', ...);
```
**Why `localhost` fails:** When you test a React Native app on a physical mobile device, the device has its own network stack. Making requests to `localhost` or `127.0.0.1` will look for the server *on the mobile device itself*, which fails because the API is running on your development machine.

**Why `0.0.0.0` works:** Binding to `0.0.0.0` instructs the Express server to listen on all network interfaces of the host machine (IPv4 loopback, Wi-Fi adapter, ethernet, etc.). This allows physical mobile devices connected to the **same local Wi-Fi network** to access the API using your development computer's local IP address (e.g., `http://192.168.x.x:5000`).

---

## API Endpoints & Testing Examples

All endpoints (except Authentication and Video Catalog) are protected by JWT middleware and expect the token to be sent in the headers:
```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### 1. Register User
- **Route**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "strongpassword123"
}
```
- **Example Response (201 Created)**:
```json
{
  "_id": "64bfbc6d888db7070197475d",
  "username": "johndoe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Example Error Response (400 Bad Request)**:
```json
{
  "error": {
    "message": "User already exists with this email",
    "status": 400
  }
}
```

### 2. Login User
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "strongpassword123"
}
```
- **Example Response (200 OK)**:
```json
{
  "_id": "64bfbc6d888db7070197475d",
  "username": "johndoe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Example Error Response (401 Unauthorized)**:
```json
{
  "error": {
    "message": "Invalid email or password",
    "status": 401
  }
}
```

### 3. Get Video Catalog
- **Route**: `GET /api/videos`
- **Access**: Public
- **Example Response (200 OK)**:
```json
[
  {
    "_id": "64bfbc9b888db70701974766",
    "title": "Big Buck Bunny",
    "thumbnail": "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?...",
    "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "duration": 596,
    "category": "Animation"
  }
]
```

### 4. Toggle Favorite Video
- **Route**: `POST /api/user/favorite/:videoId`
- **Access**: Protected (JWT required)
- **Example Response (200 OK - Added)**:
```json
{
  "message": "Added to favorites",
  "favorites": [
    {
      "_id": "64bfbc9b888db70701974766",
      "title": "Big Buck Bunny",
      "thumbnail": "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?...",
      "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "duration": 596,
      "category": "Animation"
    }
  ]
}
```

### 5. Update Watch History Progress
- **Route**: `POST /api/user/history`
- **Access**: Protected (JWT required)
- **Request Body**:
```json
{
  "videoId": "64bfbc9b888db70701974766",
  "progressSeconds": 120
}
```
- **Example Response (200 OK)**:
```json
[
  {
    "video": {
      "_id": "64bfbc9b888db70701974766",
      "title": "Big Buck Bunny",
      "thumbnail": "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?...",
      "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "duration": 596,
      "category": "Animation"
    },
    "progressSeconds": 120,
    "timestamp": "2026-06-14T08:30:59.525Z"
  }
]
```

### 6. Get Dashboard Metadata
- **Route**: `GET /api/user/dashboard`
- **Access**: Protected (JWT required)
- **Example Response (200 OK)**:
```json
{
  "favorites": [
    {
      "_id": "64bfbc9b888db70701974766",
      "title": "Big Buck Bunny",
      "thumbnail": "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?...",
      "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "duration": 596,
      "category": "Animation"
    }
  ],
  "continueWatching": [
    {
      "video": {
        "_id": "64bfbc9b888db70701974766",
        "title": "Big Buck Bunny",
        "thumbnail": "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?...",
        "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "duration": 596,
        "category": "Animation"
      },
      "progressSeconds": 120,
      "timestamp": "2026-06-14T08:30:59.525Z"
    }
  ],
  "recentActivity": [
    {
      "video": {
        "_id": "64bfbc9b888db70701974766",
        "title": "Big Buck Bunny",
        "thumbnail": "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?...",
        "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "duration": 596,
        "category": "Animation"
      },
      "progressSeconds": 120,
      "timestamp": "2026-06-14T08:30:59.525Z"
    }
  ]
}
```

---

## Expo React Native Integration Examples

In React Native development, replace `192.168.x.x` in the template below with your computer's actual local IP address (obtainable via `ipconfig` on Windows or `ifconfig` on macOS/Linux).

### Configuration Setup
```javascript
// config.js
export const API_BASE_URL = 'http://192.168.x.x:5000/api';
```

### 1. User Registration
```javascript
const registerUser = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Registration failed');
    return data; // Contains _id, username, email, and token
  } catch (error) {
    console.error('Registration Error:', error);
    throw error;
  }
};
```

### 2. User Login
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Login failed');
    return data; // Contains token and user details
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};
```

### 3. Fetch Public Video Catalog
```javascript
const getVideos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`);
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to load videos');
    return data; // Array of videos
  } catch (error) {
    console.error('Fetch Videos Error:', error);
    throw error;
  }
};
```

### 4. Toggle Favorite Video
```javascript
const toggleFavorite = async (videoId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/favorite/${videoId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Failed to toggle favorite');
    return data; // Contains updated favorites list
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    throw error;
  }
};
```

### 5. Update Watch History Progress
```javascript
const updateHistory = async (videoId, progressSeconds, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ videoId, progressSeconds })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Failed to update history');
    return data; // Returns updated watch history list
  } catch (error) {
    console.error('Update History Error:', error);
    throw error;
  }
};
```

### 6. Fetch Mobile Dashboard
```javascript
const getDashboard = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Failed to load dashboard');
    return data; // Contains { favorites, continueWatching, recentActivity }
  } catch (error) {
    console.error('Dashboard Error:', error);
    throw error;
  }
};
```
