# 📘 Attendance Portal

A comprehensive attendance management system for educational institutions.

## 🚀 Features

- User authentication with role-based access control
- Attendance tracking and management
- Leave request system
- Dashboard for different user roles (Admin, Staff, Student, HOD, Principal, Placement Officer)
- Real-time attendance monitoring
- Reports and analytics

## 🧰 Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MySQL
- Authentication: JWT

## 📦 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/madhan404/biometric_attendance_portal.git
cd attendance-portal
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
   - Create `.env` file in the backend directory
   - Add the following variables:
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
DB_HOST=your_database_host
JWT_SECRET=your_jwt_secret
PORT=your_port_number
REACT_APP_API_URL=http://localhost:3001/api
```

4. Import the database:
```bash
mysql -u root -p att < att_backup.sql
```

5. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

## 🚀 Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Configure production environment variables

3. Start the production server:
```bash
cd backend
npm start
```

## 🗄️ Database Migration

To migrate the database to a new server:

1. Export the database:
```bash
mysqldump -u root -p att > att_backup.sql
```

2. Import to the new server:
```bash
mysql -u root -p att < att_backup.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 🖼️ Screenshots

### 🔐 Login Page  
![Login Page](frontend/public/readme-assets/login_page.png)

### 🛠️ Admin Dashboard  
![Admin Dashboard](frontend/public/readme-assets/admin-dashboard.png)

### 👨‍🏫 Staff Dashboard  
![Staff Dashboard](frontend/public/readme-assets/staff-dashboard.png)

### 👨‍🏫 Principal Dashboard  
![Principal Dashboard](frontend/public/readme-assets/principal-dashboard.png)

### 🧑‍💼 HOD Dashboard  
![HOD Dashboard](frontend/public/readme-assets/hod-dashboard.png)

### 🧑‍🏫 Mentor Dashboard  
![Mentor Dashboard](frontend/public/readme-assets/mentor-dashboard.png)

### 📚 Class Advisor Dashboard  
![Class Advisor Dashboard](frontend/public/readme-assets/classAdvisor-dashboard.png)

### 🧑‍🎓 Class Advisor – Student List  
![Class Advisor – Student List](frontend/public/readme-assets/classAdvisor-stdList.png)

### 👥 Mentees List  
![Mentees List](frontend/public/readme-assets/mentees-list.png)

### 👤 All Users  
![All Users](frontend/public/readme-assets/all-users.png)

### 🗑️ Deleted Users  
![Deleted Users](frontend/public/readme-assets/deleted-users.png)

### 🎓 Student Dashboard  
![Student Dashboard](frontend/public/readme-assets/student_dashboard.png)

### 📝 Student Application  
![Student Application](frontend/public/readme-assets/std-application.png)

### 🕒 Student Attendance  
![Student Attendance](frontend/public/readme-assets/std-attendance.png)

### 🏖️ Student Leave Status  
![Student Leave Status](frontend/public/readme-assets/std-leave-sts.png)

### 📩 All Leave Requests  
![All Leave Requests](frontend/public/readme-assets/allLeave-requests.png)

### 🧾 Total Student List  
![Total Student List](frontend/public/readme-assets/totalStd-list.png)

### 🧑‍💼 Placement Officer Dashboard  
![Placement Officer Dashboard](frontend/public/readme-assets/placementOfficer-dashboard.png)

### 📊 Device Logs Analytics  
![Device Logs Analytics](frontend/public/readme-assets/Device-Logs-Analytics.png)

### ⚙️ System Configuration  
![System Configuration](frontend/public/readme-assets/system-config.png)

### 💾 Backup  
![Backup](frontend/public/readme-assets/backup.png)

## 🚀✨ Live Preview

Experience the Attendance Portal in action!  
👉 [**Try the Live Demo Here**](https://biometric-attendance-system.netlify.app/) 👈

---

### 👥 Example User Logins

| 🏷️ Role              | 📧 Email                              | 🔑 Password |
|----------------------|----------------------------------------|-------------|
| 🎓 Student           | e21cs028@shanmugha.edu.in              | 12345       |
| 👨‍🏫 Staff            | cajaseenash@shanmugha.edu.in           | 12345       |
| 🧑‍💼 HOD              | hodcse@shanmugha.edu.in                | 12345       |
| 🧑‍💻 Placement Officer| placementofficer@shanmugha.edu.in      | 12345       |
| 👨‍🎓 Principal        | principalengg@shanmugha.edu.in         | 12345       |

> ⚠️ **Note:** Admin credentials are not shared for security reasons, as admin users have full permissions.

---

Enjoy exploring the demo! 💡🎉

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
