# Habit Tracker

A full-stack web application for tracking daily habits and routines with user authentication, task management, and progress tracking.

## Features

* **User Authentication**: Secure registration and login system
* **Task Management**: Create, update, and delete tasks
* **Schedule Management**: Save and reset your entire schedule
* **Task Completion Tracking**: Mark tasks as completed for specific dates
* **Progress Analytics**: View completion rates for date ranges
* **Feedback System**: Submit feedback directly to developers

## Technologies Used

### Backend
* Node.js
* Express.js
* MongoDB (with Mongoose)
* JWT for authentication
* Bcrypt for password hashing
* Nodemailer for email functionality

### Frontend
* HTML, CSS(Tailwind CSS), JavaScript
* Frontend code is served statically from the server

## Installation and Setup

1. **Clone the repository**
   ```
   git clone https://github.com/valiant-77/Habit-Tracker.git
   ```

   ```
   cd habit-tracker
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Create a .env file in the root directory with the following variables**
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_app_password
   FEEDBACK_EMAIL=email_to_receive_feedback
   ```

4. **Start the server**
   ```
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`



## Contact

Aditya TG - adityagirish812@gmail.com

