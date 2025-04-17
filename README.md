# Patient Portal - Mental State Examination (MSE) System

A web-based application for administering, managing, and analyzing mental state examinations for patients. This system provides multilingual support (English and Hindi) for questionnaires, patient response management, and administrative controls.

## 📋 Table of Contents

- Features
- Tech Stack
- Installation
- Project Structure
- Usage
- Deployment
- License

## ✨ Features

### Patient Features
- Multi-language support (English/Hindi) for questionnaires
- MCQ-based mental state examination
- Patient information collection (name, DOB, doctor assigned, health worker)
- View and track previous test responses and scores
- Export test results to Excel with comprehensive information
- Auto-fill capability for repeat tests
- Option to retake tests

### Admin Features
- Comprehensive dashboard for patient management
- Add new patients with credentials
- Search patients by name or email
- View detailed patient responses with collapsible sections
- Add, modify, and delete questions with scoring options
- Upload images for visual assessment questions
- System logs for auditing admin actions
- Delete users and responses

## 🛠 Tech Stack

### Frontend
- React 19
- Material UI 6
- React Router 7
- Vite 6 (build tool)
- Day.js (date handling)
- XLSX (Excel export)

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
git clone https://github.com/preetamkamal/patient-portal.git
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

Create .env files in both frontend and backend folders:

Backend (./backend/.env):
```
PORT=5011
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development
```

Frontend (./frontend/.env):
```
VITE_API_BASE_URL=http://localhost:5011
```

Frontend Production (After hosting backend):
```
VITE_API_BASE_URL=https://your-backend.onrender.com
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
│   ├── db.js                # Database configuration and initial setup
│   ├── server.js            # Express server and API endpoints
│   ├── uploads/             # Uploaded images for questions
│   └── db.sqlite            # SQLite database file
│
└── frontend/
    ├── public/              # Static assets
    ├── src/
    │   ├── components/      # React components
    │   │   ├── AdminDashboard.jsx    # Admin main page
    │   │   ├── PatientMCQ.jsx        # Patient questionnaire
    │   │   ├── PatientInfoForm.jsx   # Patient information form
    │   │   ├── AdminResponses.jsx    # View patient responses
    │   │   └── ...                   # Other component files
    │   ├── App.jsx          # Main app component with routes
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
- Email: cho1@example.com / Password: pass1
- Email: cho2@example.com / Password: pass2
- (and so on for patients 3-5)

### Workflow

1. **Login**: Access the application using the provided credentials

2. **Patient Flow**: 
   - Complete patient information form with name, DOB, doctor assigned, and health worker details
   - Choose language (English/Hindi)
   - Complete MCQ questionnaire
   - View score and download results in Excel format
   - View historical responses
   - Take new tests with auto-filled information

3. **Admin Flow**:
   - Manage patients (add/delete)
   - Manage questions (add/edit/delete)
   - View and search patient responses
   - Export individual patient results to Excel
   - View system logs

## 📦 Deployment

### Database Persistence

To ensure your database data persists across deployments and app restarts:

1. Set the `DATA_DIR` environment variable to a directory path outside your deployment folder:
   ```
   DATA_DIR=/path/to/persistent/storage
   ```

2. Optionally, you can also set a custom database filename:
   ```
   DB_FILENAME=patient_portal_db.sqlite
   ```

3. For cloud deployments, use a volume or persistent storage service:
   - On Render.com: Add a persistent disk and set DATA_DIR to that mount path
   - On DigitalOcean: Use a volume mount
   - On other platforms: Configure according to their persistent storage options

### Deploying the Node Backend using [Render.com](https://render.com)

1. Sign up for a [Render.com](https://render.com) account
2. Create a new Web Service on Render.com
3. Link to your GitHub repository
4. Specify the build command (`npm install`) and start command (`npm start` or `node server.js`)
5. Add environment variables:
   - `JWT_SECRET` (your secure secret key)
   - `PORT=5011` 
   - `DATA_DIR=/data` (this is Render's persistent disk path)
6. Add a persistent disk to your Render service (in the Disks section)
7. Deploy. Render gives you a free domain like [your-backend.onrender.com](https://your-backend.onrender.com)

### Deploying the React Frontend using Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repo
3. Configure the build command (`npm run build`) and output folder (`dist`)
4. Add environment variable `VITE_API_BASE_URL` pointing to your backend deployment URL
5. Deploy. You get a domain like `your-frontend-app.vercel.app`

### Deploying to DigitalOcean

For a detailed guide on deploying to a DigitalOcean droplet:

1. Create a new droplet with your preferred OS (Ubuntu recommended)
2. SSH into your droplet
3. Install Node.js and npm
4. Clone your repository
5. Set up environment variables including `DATA_DIR=/var/lib/patient-portal-data`
6. Create the data directory: `mkdir -p /var/lib/patient-portal-data && chmod 755 /var/lib/patient-portal-data`
7. Install PM2: `npm install -g pm2`
8. Use PM2 to start your application: `pm2 start npm --name "patient-portal" -- start`
9. Set up Nginx as a reverse proxy to your Node application
10. Set up SSL with Let's Encrypt for HTTPS

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Developed for Dementia and Brain Health Outreach (DBHO)  
(Kellogg NW-TVI in Partnership with NIMHANS & KaBHI)