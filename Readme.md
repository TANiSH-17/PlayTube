# 🎥 PlayTube

A video-sharing platform inspired by YouTube, built using modern web technologies. PlayTube allows users to upload videos, subscribe to channels, manage their profiles, and interact with content just like on popular video-sharing platforms.

---

## 🚀 Features

### 📺 Video Management
- Upload videos with titles, descriptions, and thumbnails.
- Stream videos with a built-in video player.
- Display video views, upload dates, and owner information.
- Like, dislike, and view count functionality.

### 👥 User Authentication & Profiles
- Secure user registration and login.
- JWT-based authentication for session handling.
- Each user has a personal profile with:
  - Username
  - Profile picture
  - Bio/description (optional)
  - List of uploaded videos
  - Subscriber count

### 🔔 Subscription System
- Users can subscribe to other creators.
- See the number of subscribers on each profile.
- Personalized feed based on subscriptions (optional enhancement).

### 📃 Dashboard
- User dashboard to manage:
  - Uploaded videos
  - View counts
  - Subscriptions
  - Profile settings

### 🔍 Search & Discovery
- Search videos by title, description, or username.
- Browse trending or latest videos.

---

## 🛠️ Tech Stack

| Frontend      | Backend             | Database | Storage  | Authentication | Others          |
|----------------|---------------------|----------|----------|----------------|-----------------|
| React / NextJS | NodeJS / Express.js | MongoDB  | Cloudinary / AWS S3 | JWT | Mongoose, Multer |

---

## 📂 Folder Structure

PlayTube/
├── client/ # Frontend (React or Next.js)
│ ├── public/ # Static assets
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Routes/pages
│ │ ├── services/ # API calls
│ │ ├── context/ # Auth and app context
│ │ └── App.js # Main app component
│
├── server/ # Backend (Node.js + Express)
│ ├── controllers/ # Business logic (videos, users, auth)
│ ├── models/ # MongoDB schemas (User, Video, Subscription)
│ ├── routes/ # API routes (auth, video, user)
│ ├── middleware/ # Auth middleware, error handlers
│ ├── config/ # DB, cloud config
│ └── server.js # Entry point
│
├── README.md
└── package.json


---

## 🔐 Authentication Flow
- Registration and login with encrypted passwords using bcrypt.
- JWT-based token authentication for protected routes.
- Users must be logged in to upload videos or subscribe to channels.

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint            | Description         |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Register user       |
| POST   | `/api/auth/login`    | Login user          |
| GET    | `/api/auth/profile`  | Get user profile    |

### Videos
| Method | Endpoint               | Description                   |
|--------|-------------------------|-------------------------------|
| POST   | `/api/videos/upload`    | Upload a new video            |
| GET    | `/api/videos/`          | Fetch all videos              |
| GET    | `/api/videos/:id`       | Fetch single video details    |
| DELETE | `/api/videos/:id`       | Delete a video                |

### Subscriptions
| Method | Endpoint                            | Description                          |
|--------|--------------------------------------|--------------------------------------|
| POST   | `/api/subscribe/:channelId`         | Subscribe to a user                  |
| DELETE | `/api/subscribe/:channelId`         | Unsubscribe from a user              |
| GET    | `/api/subscribe/status/:channelId`  | Check subscription status            |

---

## 🌟 Key Features Explained

### 🔥 Video Streaming
- Uses efficient video streaming with buffer support.
- Upload via `Multer` to store files temporarily before moving to cloud storage.

### 👤 User Profile & Dashboard
- Users can update their profile picture and bio.
- Dashboard shows:
  - All uploaded videos
  - Subscriber count
  - Total video views
  - Manage videos (edit/delete)

### 🔔 Subscription Model
- Each user acts as a "channel".
- When a user subscribes to a channel:
  - The channel's subscriber count increases.
  - The user gets the channel's new uploads in their feed (future enhancement).
- Subscriptions are stored as references between user documents in MongoDB.

---

## 🚀 Deployment
You can deploy PlayTube on:
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, Heroku
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary or AWS S3 for video and image assets

---

## 🏗️ Future Enhancements
- Commenting system on videos
- Like/Dislike buttons with counts
- Notifications for new uploads
- Dark/Light theme toggle
- Progressive Web App (PWA) support

---

## 💻 Run Locally

### Prerequisites:
- Node.js
- MongoDB (local or Atlas)

### Steps:

1. Clone the repository:

git clone https://github.com/TANiSH-17/PlayTube.git
cd PlayTube

2. Install dependencies for both client and server:
   cd server
   npm install
   
   cd ../client
   npm install

3. Add environment variables:
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

4. Run the server:
   cd server
   npm run dev

5. Run the client:
   cd client
   npm start

🤝 Contributing
Contributions, issues, and feature requests are welcome!

Fork the repo

Create a new branch (git checkout -b feature/feature-name)

Commit your changes (git commit -m 'Add some feature')

Push to the branch (git push origin feature/feature-name)

Open a pull request


📜 License
This project is licensed under the MIT License.

🙌 Acknowledgements
Inspired by YouTube and similar video-sharing platforms.

Thanks to open-source communities for tools and frameworks.


🌍 Connect with Me
GitHub: TANiSH-17

Email: tanishkskr@gmail.com 





