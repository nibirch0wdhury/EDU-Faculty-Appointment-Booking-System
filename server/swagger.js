const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EDU Meet - Faculty Appointment Booking System API',
      version: '1.0.0',
      description: `
🎓 EDU Meet API Documentation

East Delta University's centralized appointment system for students and faculty.

## Features
- 🔐 Authentication with JWT
- 📅 Book and manage appointments
- 👨‍🏫 Faculty management
- 👨‍🎓 Student management
- 🔧 Admin controls
- 📧 OTP Email verification
- 🛠️ System settings
      `,
      contact: {
        name: 'EDU Meet Team',
        email: 'support@eastdelta.edu.bd',
        url: 'https://github.com/nibirch0wdhury/EDU-Faculty-Appointment-Booking-System',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
      {
        url: process.env.BACKEND_URL || 'https://your-api.onrender.com/api',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token here',
        },
      },
      schemas: {
        // ==================== USER SCHEMAS ====================
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: '242021012@eastdelta.edu.bd' },
            role: { 
              type: 'string', 
              enum: ['student', 'faculty', 'admin'],
              example: 'student'
            },
            department: { type: 'string', example: 'Computer Science & Engineering' },
            studentId: { type: 'string', example: '242021012' },
            facultyId: { type: 'string', example: 'FAC-2024-001' },
            designation: { type: 'string', example: 'Professor' },
            officeRoom: { type: 'string', example: 'CS-301' },
            bio: { type: 'string', example: 'Passionate about teaching and research.' },
            profileImage: { type: 'string', example: 'https://example.com/profile.jpg' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: '242021012@eastdelta.edu.bd' },
            password: { type: 'string', example: 'password123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role', 'otp'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: '242021012@eastdelta.edu.bd' },
            password: { type: 'string', example: 'password123' },
            role: { type: 'string', enum: ['student', 'faculty', 'admin'], example: 'student' },
            department: { type: 'string', example: 'Computer Science & Engineering' },
            studentId: { type: 'string', example: '242021012' },
            facultyId: { type: 'string', example: 'FAC-2024-001' },
            otp: { type: 'string', example: '123456' },
          },
        },
        OTPRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: '242021012@eastdelta.edu.bd' },
          },
        },
        OTPVerifyRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string', example: '242021012@eastdelta.edu.bd' },
            otp: { type: 'string', example: '123456' },
          },
        },
        
        // ==================== APPOINTMENT SCHEMAS ====================
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            studentId: { $ref: '#/components/schemas/User' },
            facultyId: { $ref: '#/components/schemas/User' },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            startTime: { type: 'string', example: '09:00' },
            endTime: { type: 'string', example: '09:30' },
            purpose: { type: 'string', example: 'Discuss project proposal' },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'cancelled', 'completed'],
              example: 'pending'
            },
            meetingLink: { type: 'string' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        BookAppointmentRequest: {
          type: 'object',
          required: ['facultyId', 'date', 'startTime', 'purpose'],
          properties: {
            facultyId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            startTime: { type: 'string', example: '09:00' },
            purpose: { type: 'string', example: 'Discuss project proposal' },
          },
        },
        
        // ==================== CONTACT SCHEMAS ====================
        ContactMessage: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@eastdelta.edu.bd' },
            message: { type: 'string', example: 'I need help with my appointment.' },
            status: { type: 'string', enum: ['unread', 'read', 'replied'] },
            replyMessage: { type: 'string' },
            repliedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // ==================== SETTINGS SCHEMAS ====================
        Settings: {
          type: 'object',
          properties: {
            siteName: { type: 'string', example: 'EDU Appointment System' },
            siteDescription: { type: 'string' },
            maxAppointmentsPerDay: { type: 'number', example: 10 },
            appointmentDuration: { type: 'number', example: 30 },
            workingHours: {
              type: 'object',
              properties: {
                start: { type: 'string', example: '09:00' },
                end: { type: 'string', example: '17:00' },
              },
            },
            breakHours: {
              type: 'object',
              properties: {
                start: { type: 'string', example: '13:00' },
                end: { type: 'string', example: '14:00' },
              },
            },
            emailNotifications: { type: 'boolean' },
            smsNotifications: { type: 'boolean' },
            maintenanceMode: { type: 'boolean' },
          },
        },
        
        // ==================== SCHEDULE SCHEMAS ====================
        Schedule: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            facultyId: { $ref: '#/components/schemas/User' },
            date: { type: 'string', format: 'date' },
            startTime: { type: 'string', example: '09:00' },
            endTime: { type: 'string', example: '10:00' },
            isAvailable: { type: 'boolean', example: true },
          },
        },
        
        // ==================== RESPONSE SCHEMAS ====================
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                pages: { type: 'number' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'Auth endpoints - Login, Register, OTP' },
      { name: 'Appointments', description: 'Appointment management' },
      { name: 'Faculty', description: 'Faculty management and scheduling' },
      { name: 'Admin', description: 'Admin controls and management' },
      { name: 'Contact', description: 'Contact messages and support' },
      { name: 'User', description: 'User profile management' },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };