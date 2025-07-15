# 🚂 Northern Railway Vehicle Pass Backend

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)
[![QR Code](https://img.shields.io/badge/QR_Code-Generation-purple.svg)](https://www.npmjs.com/package/qrcode)

A comprehensive RESTful API backend system for managing vehicle pass applications for Northern Railway employees and contractors. Features secure authentication, document management, admin approval workflows, and automatic QR code generation for approved passes.

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based authentication system
- Role-based access control (User/Admin)
- Secure password handling
- OTP verification system

### 📋 **Application Management**
- Vehicle pass application submission
- Document upload support (RC, ID Proof, Contract)
- Application status tracking
- Enum validation for applicant and vehicle types

### 👨‍💼 **Admin Panel**
- Application review and approval workflow
- Bulk application management
- Status update capabilities
- Comprehensive application analytics

### 📱 **QR Code System**
- Automatic QR code generation for approved passes
- Base64 PNG format for easy storage and display
- Contains complete pass information
- Unique pass number generation

### 🗄️ **Database Management**
- MongoDB integration with Mongoose ODM
- Structured schemas for all entities
- Data validation and error handling
- Optimized queries and indexing

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB 6.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nr-vehicle-pass-backend.git
cd nr-vehicle-pass-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/nr_vehicle_pass
JWT_SECRET=your_jwt_secret_key
PORT=3002
NODE_ENV=development
EMAIL_SERVICE_API_KEY=your_email_service_key
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Create admin user** (optional)
```bash
node createAdmin.js
```

6. **Start the server**
```bash
# Development mode with nodemon
npm start

# Production mode
npm run prod
```

The server will start on `http://localhost:3002`

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "userId": "USER001",
  "password": "user123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "USER",
  "userId": "USER001"
}
```

### Application Endpoints

#### Submit Application
```http
POST /api/application/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- applicantName: "John Doe"
- applicantType: "NON-GAZETTED"
- vehicleType: "FOUR WHEELER"
- vehicleNumber: "DL01AB1234"
- rcDocument: [file]
- idProof: [file]
- contractDocument: [file]
```

#### Get User Applications
```http
GET /api/application/user-applications
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Applications
```http
GET /api/admin/applications
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "count": 10,
  "data": [
    {
      "_id": "...",
      "applicantName": "John Doe",
      "applicantType": "NON-GAZETTED",
      "vehicleType": "FOUR WHEELER",
      "vehicleNumber": "DL01AB1234",
      "status": "APPROVED",
      "pass": {
        "passNumber": "NRP-123456",
        "issuedDate": "15/07/2025",
        "validUntil": "15/07/2026",
        "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgo..."
      }
    }
  ]
}
```

#### Approve Application
```http
POST /api/admin/approve/:applicationId
Authorization: Bearer <admin-token>
```

**Features:**
- Automatically generates unique pass number
- Creates QR code with pass details
- Updates application status to APPROVED
- Sets pass validity period

## 🏗️ Project Structure

```
nr-vehicle-pass-backend/
│
├── 📄 app.js                    # Main server application
├── 📄 package.json              # Dependencies and scripts
├── 📄 .env                      # Environment variables
├── 📄 createAdmin.js            # Admin user setup script
│
├── 📁 config/
│   └── db.js                    # MongoDB connection
│
├── 📁 controllers/
│   ├── adminController.js       # Admin functions + QR generation
│   ├── applicationController.js # Application management
│   ├── authController.js        # Authentication logic
│   ├── otpController.js         # OTP functionality
│   ├── passController.js        # Pass operations
│   └── userController.js        # User management
│
├── 📁 middleware/
│   ├── auth.js                  # JWT authentication
│   └── upload.js                # File upload handling
│
├── 📁 models/
│   ├── Application.js           # Application schema + QR field
│   ├── OTP.js                   # OTP schema
│   ├── pass.js                  # Pass schema
│   ├── User.js                  # User schema
│   └── VehiclePass.js           # Vehicle pass schema
│
├── 📁 routes/
│   ├── adminRoutes.js           # Admin API endpoints
│   ├── applicationRoutes.js     # Application API endpoints
│   ├── authRoutes.js            # Authentication endpoints
│   ├── otpRoutes.js             # OTP endpoints
│   ├── passRoutes.js            # Pass endpoints
│   └── userRouters.js           # User endpoints
│
├── 📁 uploads/                  # File storage
│   ├── contract/                # Contract documents
│   ├── idproof/                 # ID proof documents
│   └── rc/                      # RC documents
│
└── 📁 utils/
    ├── generateQR.js            # QR code generation utility
    ├── mailer.js                # Email utilities
    └── sendOtp.js               # OTP utilities
```

## 🔧 Technology Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer middleware
- **QR Code**: qrcode library
- **Email**: Nodemailer
- **Environment**: dotenv
- **Development**: Nodemon

## 📱 QR Code Implementation

The system generates QR codes for approved vehicle passes containing:

```javascript
{
  "passNumber": "NRP-123456",
  "vehicleNumber": "DL01AB1234",
  "applicantName": "John Doe",
  "validUntil": "15/07/2026",
  "issueDate": "15/07/2025"
}
```

**QR Code Features:**
- Base64 PNG format (2600+ characters)
- High error correction level
- Embedded in database as `qrCodeDataUrl`
- Ready for mobile app scanning
- Contains all essential pass verification data

## 🔐 Default Credentials

For testing purposes:

**User Account:**
- UserID: `USER001`
- Password: `user123`

**Admin Account:**
- UserID: `ADMIN001`
- Password: `admin123`

> ⚠️ **Security Note**: Change default credentials in production environment

## 🧪 Testing

Run the system validation:
```bash
node test-system.js
```

This will test:
- ✅ User authentication
- ✅ Admin authentication  
- ✅ Application management
- ✅ QR code generation
- ✅ Database operations

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**
   - Set secure JWT secret
   - Configure production MongoDB URI
   - Set up email service credentials

2. **Security**
   - Enable HTTPS
   - Set up rate limiting
   - Configure CORS properly
   - Use environment-specific configs

3. **Database**
   - Set up MongoDB Atlas or production instance
   - Configure database indexes
   - Set up backup strategies

4. **Monitoring**
   - Implement logging
   - Set up error tracking
   - Configure health checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@northernrailway.com
- Documentation: [API Docs](docs/api.md)

## 🙏 Acknowledgments

- Northern Railway for project requirements
- Express.js community for excellent framework
- MongoDB team for robust database solution
- QR code library contributors

---

**Built with ❤️ for Northern Railway Vehicle Pass Management System**
