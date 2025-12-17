import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number().default(3000),
  
  DATABASE_URL: Joi.string().required()
    .messages({
      'any.required': 'DATABASE_URL is required in environment variables'
    }),
  
  JWT_SECRET: Joi.string().min(32).required()
    .messages({
      'string.min': 'JWT_SECRET must be at least 32 characters long for security',
      'any.required': 'JWT_SECRET is required'
    }),
  
  JWT_REFRESH_SECRET: Joi.string().min(32).required()
    .messages({
      'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters long for security',
      'any.required': 'JWT_REFRESH_SECRET is required'
    }),
  
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  
  GMAIL_USER: Joi.string().email().required()
    .messages({
      'any.required': 'GMAIL_USER is required (your Gmail address)',
      'string.email': 'GMAIL_USER must be a valid email address'
    }),
  
  GMAIL_APP_PASSWORD: Joi.string().length(16).required()
    .messages({
      'any.required': 'GMAIL_APP_PASSWORD is required (16-character app password from Google)',
      'string.length': 'GMAIL_APP_PASSWORD must be exactly 16 characters (remove spaces)'
    }),
  
  APP_NAME: Joi.string().default('FlowState'),
  
  FRONTEND_URL: Joi.string().uri().default('http://localhost:4200'),
  
  // Redis configuration - support both REDIS_URL (Render format) and REDIS_HOST/REDIS_PORT (local/Docker)
  REDIS_URL: Joi.string().uri().allow('').optional(),
  REDIS_HOST: Joi.string().allow('').default('localhost'),
  REDIS_PORT: Joi.number().integer().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
}).options({ convert: true, allowUnknown: true });

