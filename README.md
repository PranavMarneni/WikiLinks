# WikiLinks

WikiLinks is a daily Wikipedia link navigation game inspired by **Wordle**.  
Players are given a **start page** and a **target page** and must reach the target in as few clicks and as little time as possible. Daily scores are ranked on a leaderboard.

This repository contains the **full-stack MERN setup** used by the team.

---

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- Socket.IO

---

## Repository Structure

```txt
WikiLinks/
├── client/     # React frontend
└── server/     # Node/Express backend
```

---

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.developers.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Set the application type to **Web application**.
6. Add the following to **Authorized redirect URIs**:
   - `http://localhost:5000/auth/google/callback`
7. Save and copy your **Client ID** and **Client Secret**.
8. Create a `.env` file in the `server/` directory with:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
SESSION_SECRET=your_session_secret_here
MONGODB=your_mongodb_username:your_mongodb_password
```

9. Start the backend server:

```
npm start
```

---
