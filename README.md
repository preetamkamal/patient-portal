# Patient Portal - Mental State Examination (MSE) System

A web-based application for administering, managing, and analyzing mental state examinations for patients. This system provides multilingual support (English and Hindi) for questionnaires, patient response management, and administrative controls.

## 📋 Table of Contents

- Features
- Tech Stack
- Installation
- Project Structure
- Usage
- Deployment
- Screenshots
- License

## ✨ Features

### Patient Features
- Multi-language support (English/Hindi) for questionnaires
- MCQ-based mental state examination
- View and track previous test responses 
- Score calculation based on responses
- Option to retake tests

### Admin Features
- Comprehensive dashboard for patient management
- Add new patients with credentials
- View all patient responses and scores
- Add, modify, and delete questions
- Upload images for visual questions
- Toggle patient's ability to edit responses
- System logs for auditing
- Delete users and responses

## 🛠 Tech Stack

### Frontend
- React 19
- Material UI 6
- React Router 7
- Vite 6 (build tool)

### Backend
- Node.js
- Express
- JSON Web Tokens (JWT) for authentication
- Multer for file uploads

### Database
- SQLite3

## 📥 Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/patient-portal.git
cd patient-portal
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create `.env` files in both frontend and backend folders:

Backend (./backend/.env):
```
PORT=5011
JWT_SECRET=FmnH92QPWbMh6JKWEzphZW2NPLBgpnNiWfPcvg3PwFVmeH47g3F3mdDvi0WU
NODE_ENV=production
```

Frontend (./frontend/.env):
```
VITE_API_BASE_URL=http://localhost:5011
```

Frontend Production (After hosting backend make a .env.production file and update the url):
```
VITE_API_BASE_URL=https://your-backend.onrender.com/ 
```

5. **Run the application**

Start the backend server:
```bash
cd backend
npm start
```

In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
patient-portal/
├── backend/
│   ├── db.js                # Database configuration
│   ├── server.js            # Express server and API endpoints
│   ├── uploads/             # Uploaded images for questions
│   └── db.sqlite            # SQLite database file
│
└── frontend/
    ├── public/              # Static assets
    ├── src/
    │   ├── components/      # React components
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   └── theme.js         # Material UI theme customization
    ├── index.html           # HTML template
    └── vite.config.js       # Vite configuration
```

## 🚀 Usage

### Default Login Credentials

**Admin Users:**
- Email: admin1@example.com / Password: admin123
- Email: admin2@example.com / Password: admin123

**Patient Users:**
- Email: patient1@example.com / Password: pass1
- Email: patient2@example.com / Password: pass2
- (and so on for patients 3-5)

### Workflow

1. **Login**: Access the application using the provided credentials
2. **Patient Flow**: 
   - Complete MCQ questionnaire in preferred language
   - View historical responses and scores
3. **Admin Flow**:
   - Manage patients (add/delete)
   - Manage questions (add/delete)
   - View patient responses
   - Configure system settings

## 📦 Deployment

### Deploying the Node Backend using [Render.com](Render.com)

1. Sign up for a [Render.com](Render.com) account
2. Create a new Web Service on [Render.com](Render.com).
3. Link to your GitHub repository
4. Specify the build command (`npm install`) and start command (`npm start` or `node server.js`).
5. Add environment variables (e.g. `JWT_SECRET`, `PORT=5011`).
7. Deploy. Render gives you a free domain like [your-backend.onrender.com](https://your-backend.onrender.com).

###  Deploying the React Frontend using Vercel

1. Go to [vercel.com](vercel.com)
2. Import your Git repo
3. Configure the build command (`npm run build`) and output folder (`dist`).
4. Deploy. You get a domain like `your-frontend-app.vercel.app`.

Important: In your React code, ensure your fetch calls point to your backend’s deployed URL (e.g., https://your-backend.onrender.com/api/...).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Developed for Dementia and Brain Health Outreach (DBHO)  
(Kellogg NW-TVI in Partnership with NIMHANS & KaBHI)