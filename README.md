


# SecureID — IAM Authentication System

SecureID is an Identity and Access Management (IAM) authentication system built as part of an IAM Authentication assignment.

The project currently implements the complete Registration Journey with password validation, email OTP verification, SMS OTP verification, and Multi-Factor Authentication (MFA).

**Part 1 Status: Completed**




## Live Demo

### Frontend
https://shreya-secureid.vercel.app

### Backend API
https://secureid-authentication.onrender.com

### GitHub Repository
https://github.com/shreya-1920/secureid-authentication

## Features

- User registration with name, email, mobile number, and password
- Password strength validation
- Secure password hashing using bcrypt
- Duplicate email and mobile validation
- Backend-generated Email OTP
- Email OTP verification
- OTP expiry and attempt limits
- Invalid and expired OTP handling
- Backend-generated SMS OTP
- Simulated Email and SMS OTP delivery
- SMS OTP verification
- Maximum-attempt handling
- Multi-Factor Authentication (MFA)
- Authenticator-based MFA setup
- QR code generation
- 6-digit MFA verification
- Registration success screen
- Responsive registration interface
## Registration Flow



1.Registration
      
2.Email OTP Verification
      
3.SMS OTP Verification
      
4.MFA Setup
      
5.MFA Verification
      
6.Registration Success

The authentication and security decisions are handled by the backend, while the frontend is responsible for displaying the registration journey and communicating with the APIs.
### 5. OTP Implementation



OTP generation and verification are performed on the backend.

For both Email and SMS verification:

- OTP is generated on the server.
- OTP is not generated in frontend JavaScript.
- OTP is not returned in the normal registration API response.
- Only a protected representation of the OTP is stored.
- OTPs have a short expiry period.
- Verification attempts are limited.
- OTPs are single-use.
- OTP challenges are invalidated after successful verification.

Email and SMS delivery are simulated as specified in the assignment guidelines.
## Tech Stack


### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Security
- bcrypt
- Express Session
- OTP hashing
- Multi-Factor Authentication

### Deployment
- Vercel
- Render
- MongoDB Atlas


## API Endpoints

### Registration

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/register` | Create a new user and start email verification |
| POST | `/api/send-email-otp` | Generate/send simulated email OTP |
| POST | `/api/verify-email-otp` | Verify email OTP |
| POST | `/api/send-sms-otp` | Generate/send simulated SMS OTP |
| POST | `/api/verify-sms-otp` | Verify SMS OTP |

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/login` | Login |
| POST | `/api/verify-login-otp` | Verify login OTP |
| GET | `/api/me` | Get authenticated user |
| POST | `/api/logout` | Logout |
| POST | `/api/token` | Generate JWT |
| GET | `/api/protected` | Protected API |
## Local setup

Click **Local setup** and paste:


### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Git

### Clone the Repository

```bash
git clone https://github.com/shreya-1920/secureid-authentication.git
cd secureid-authentication

Install Dependencies
cd backend
npm install
Environment Variables

Create a .env file inside the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret

Do not commit the .env file or expose secret values publicly.

Start the Backend


npm start

The backend runs locally on:

http://localhost:5000

Run the Frontend

Open the frontend directory using a local development server such as VS Code Live Server.



##Author
**Shreya**

SecureID — IAM Authentication System

Built as part of the IAM Authentication & Registration assignment.

### Project Status

**Part 1 — Registration Journey: Completed ✅**

Registration → Email OTP → SMS OTP → MFA → Registration Success
