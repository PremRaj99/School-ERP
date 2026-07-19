export const userSwaggerDocs = {
  '/user': {
    get: {
      tags: ['User'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'User details retrieved' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/user/change-password': {
    post: {
      tags: ['User'],
      summary: 'Change password',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['oldPassword', 'newPassword'],
              properties: {
                oldPassword: { type: 'string' },
                newPassword: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        202: { description: 'Password changed successfully' },
        400: { description: 'Validation error' },
      },
    },
  },
  '/user/logout': {
    post: {
      tags: ['User'],
      summary: 'User logout',
      security: [{ bearerAuth: [] }],
      responses: {
        202: { description: 'Logged out successfully' },
      },
    },
  },
  '/user/refresh': {
    post: {
      tags: ['User'],
      summary: 'Refresh Access Token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refresh'],
              properties: {
                refresh: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        202: { description: 'New access and refresh tokens returned' },
        403: { description: 'Invalid or expired refresh token' },
      },
    },
  },
};
