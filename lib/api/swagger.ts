/**
 * Swagger/OpenAPI Documentation Generator
 */

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'IEMS - Integrated Engineering Management System API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for IEMS project management system',
    contact: {
      name: 'IEMS Support',
      email: 'support@iems.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Development server'
    },
    {
      url: 'https://api.iems.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'string' },
          status: { type: 'string', enum: ['active', 'completed', 'on-hold'] },
          budget: { type: 'number' },
          progress: { type: 'number' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          projectId: { type: 'string' },
          name: { type: 'string' },
          status: { type: 'string', enum: ['not_started', 'in_progress', 'completed'] },
          progress: { type: 'number' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      NCR: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          status: { type: 'string', enum: ['open', 'inspection', 'corrective_action', 'verification', 'closed'] },
          projectId: { type: 'string' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Get all projects',
        responses: {
          '200': {
            description: 'List of projects',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Project' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Create new project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Project' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Project created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' }
              }
            }
          }
        }
      }
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Project details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' }
              }
            }
          },
          '404': {
            description: 'Project not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get all tasks',
        parameters: [
          {
            name: 'projectId',
            in: 'query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' }
                }
              }
            }
          }
        }
      }
    },
    '/ncrs': {
      get: {
        tags: ['Quality'],
        summary: 'Get all NCRs',
        responses: {
          '200': {
            description: 'List of NCRs',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/NCR' }
                }
              }
            }
          }
        }
      }
    },
    '/approvals': {
      get: {
        tags: ['Approvals'],
        summary: 'Get pending approvals for user',
        responses: {
          '200': {
            description: 'List of approval requests',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      entityType: { type: 'string' },
                      entityId: { type: 'string' },
                      status: { type: 'string' },
                      currentStage: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/approvals/{id}/approve': {
      post: {
        tags: ['Approvals'],
        summary: 'Approve a request',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  comment: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Approval successful'
          }
        }
      }
    },
    '/reports/generate': {
      post: {
        tags: ['Reports'],
        summary: 'Generate report',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['project_summary', 'cost_analysis', 'quality_report', 'safety_report']
                  },
                  projectId: { type: 'string' },
                  format: { type: 'string', enum: ['pdf', 'csv', 'excel'] }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Report generated',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    { name: 'Projects', description: 'Project management endpoints' },
    { name: 'Tasks', description: 'Task management endpoints' },
    { name: 'Quality', description: 'Quality control (NCR) endpoints' },
    { name: 'Approvals', description: 'Approval workflow endpoints' },
    { name: 'Reports', description: 'Report generation endpoints' }
  ]
};
