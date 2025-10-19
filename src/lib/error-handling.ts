/**
 * Comprehensive error handling system
 * Centralized error management with user-friendly messages and retry mechanisms
 */

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  EMAIL_SENDING = 'email_sending',
  TEMPLATE_GENERATION = 'template_generation',
  IMAGE_GENERATION = 'image_generation'
}