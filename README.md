#SecureID Authentication & Registration System

A full-stack Identity and Access Management (IAM) authentication system built as part of an internship assignment.

The application implements secure user registration, OTP-based verification, multi-factor authentication (MFA), login authentication, server-side sessions, and JWT-based protected APIs.

## 🚀 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Security & Authentication
- bcrypt password hashing
- OTP generation and verification
- Multi-Factor Authentication (MFA)
- Server-side sessions
- JWT authentication
- Secure HTTP cookies

## 🔐 Planned Features

- User registration
- Email OTP verification
- SMS OTP verification
- OTP expiry and attempt limits
- MFA enablement
- Login with email and password
- Failed-login attempt handling
- Temporary account lockout
- Email/SMS OTP-based login verification
- Server-side session authentication
- JWT authentication
- Protected API endpoints
- Logout and session invalidation
- Responsive authentication interface

## 🔄 Authentication Flows

### Registration

Registration Form  
↓  
Email OTP Verification  
↓  
SMS OTP Verification  
↓  
MFA Enabled  
↓  
Registration Success  
↓  
Login

### Login

Login  
↓  
Credential Validation  
↓  
MFA Required  
↓  
Email/SMS OTP  
↓  
OTP Verification  
↓  
Authenticated Session  
↓  
Dashboard

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/register` | Register a new user |
| POST | `/api/send-email-otp` | Generate email OTP |
| POST | `/api/verify-email-otp` | Verify email OTP |
| POST | `/api/send-sms-otp` | Generate SMS OTP |
| POST | `/api/verify-sms-otp` | Verify SMS OTP |
| POST | `/api/login` | Authenticate user |
| POST | `/api/verify-login-otp` | Verify login OTP |
| GET | `/api/me` | Get authenticated user |
| POST | `/api/logout` | Logout and invalidate session |
| POST | `/api/token` | Generate JWT |
| GET | `/api/protected` | Access protected resource |

## 🛡️ Security Considerations

- Passwords are hashed before storage.
- OTPs are generated on the backend.
- OTPs are stored only as protected representations.
- OTPs have expiry times and limited verification attempts.
- OTPs are single-use.
- Authentication decisions are handled by the backend.
- Session cookies use secure attributes such as HttpOnly, Secure and SameSite.
- JWTs are short-lived.
- Authentication tokens are not stored in localStorage.

## 📁 Project Structure

```text
iam-authentication-system/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
└── README.md
