import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

export const setupSwagger = (app: Application): void => {
  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Campus Placement & Career Platform API',
      version: '1.0.0',
      description: 'Enterprise-grade campus placement portal API with role-based access control',
      contact: {
        name: 'Campus Placement Portal',
        email: 'support@campusplacement.com',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development Server' },
      { url: 'https://api.campusplacement.com/api', description: 'Production Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Students', description: 'Student profile & features' },
      { name: 'Recruiters', description: 'Recruiter features' },
      { name: 'Jobs', description: 'Job management' },
      { name: 'Applications', description: 'Application workflow' },
      { name: 'Drives', description: 'Placement drives' },
      { name: 'Interviews', description: 'Interview management' },
      { name: 'Admin', description: 'Admin features' },
      { name: 'Analytics', description: 'Analytics & reports' },
      { name: 'Notifications', description: 'Notification system' },
    ],
    paths: {},
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Campus Placement API Docs',
    customCss: '.swagger-ui .topbar { background-color: #4F46E5; }',
  }));
};
