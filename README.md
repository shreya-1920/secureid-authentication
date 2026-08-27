# SecureID — IAM Authentication System

A full-stack Identity and Access Management (IAM) authentication system built using HTML, CSS, JavaScript, Node.js, Express and MongoDB.

## 🚀 Live Demo

**Vercel:**  
https://shreya-secureid.vercel.app

## 💻 GitHub Repository

https://github.com/shreya-1920/secureid-authentication

## ✨ Features

### Registration Journey

- User registration
- Password validation
- Password hashing
- Email OTP verification
- SMS OTP verification
- MFA setup
- MFA verification
- Registration success

### Login Journey

- Email/username and password login
- Show/hide password
- Remember me option
- MFA verification
- Email OTP verification
- OTP expiry and attempt handling
- Authenticated session
- Logout
- Protected user information

## 🔐 Authentication

The backend handles authentication and security-related decisions.

Implemented:

- Password hashing
- OTP generation and verification
- OTP expiry
- OTP attempt limits
- Session-based authentication
- JWT-based authentication
- Protected API routes
- MFA

## 🛠️ Tech Stack

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- MongoDB

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

## 🔄 Authentication Flow

### Registration

Registration  
↓  
Email OTP  
↓  
SMS OTP  
↓  
MFA Setup  
↓  
MFA Verification  
↓  
Registration Success

### Login

Login  
↓  
Credentials Validation  
↓  
MFA Required  
↓  
Email OTP  
↓  
OTP Verification  
↓  
Authenticated Session  
↓  
Dashboard

## 📡 API Endpoints

- `POST /api/register`
- `POST /api/send-email-otp`
- `POST /api/verify-email-otp`
- `POST /api/send-sms-otp`
- `POST /api/verify-sms-otp`
- `POST /api/login`
- `POST /api/verify-login-otp`
- `GET /api/me`
- `POST /api/logout`
- `POST /api/token`
- `GET /api/protected`

## 📱 Responsive Design

The application is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

## 🧪 OTP Testing

Email/SMS delivery is simulated for this assignment.

OTP generation and verification are handled by the backend. Generated OTPs can be viewed through the backend server logs for evaluator testing.

## 📚 Assignment

This project was developed as part of the IAM Authentication & Registration assignment.

I have also completed the assigned IAM Basics learning videos.

## 👤 Author

**Shreya**
