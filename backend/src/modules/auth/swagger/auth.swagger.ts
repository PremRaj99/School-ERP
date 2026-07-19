export const authSwaggerDocs = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'User Login',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Login successful' },
        400: { description: 'Invalid credentials / validation error' },
        404: { description: 'User not found' },
      },
    },
  },
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Admin Signup',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['username', 'password'],
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'User created successfully' },
        400: { description: 'User already exists or invalid input' },
      },
    },
  },
  '/auth/contact': {
    post: {
      tags: ['Auth'],
      summary: 'Submit Contact Us Message',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'mobile', 'message'],
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                mobile: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Contact message submitted successfully' },
      },
    },
  },
};
