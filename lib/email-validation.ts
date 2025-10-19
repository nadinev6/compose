/**
 * Comprehensive email HTML validation service
 * Validates HTML templates for email client compatibility
 */

import { EMAIL_CONSTRAINTS } from './tambo';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 compatibility score
}

export interface ValidationError {
  type: 'error' | 'warning';
  category: 'structure' | 'css' | 'images' | 'compatibility' | 'accessibility';
  message: string;
  suggestion?: string;
  line?: number;
  column?: number;
}

export interface ValidationWarning extends ValidationError {
  type: 'warning';
}

export class EmailValidator {
  /**
   * Comprehensive HTML validation for email templates
   */
  static validate(html: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Structure validation
    this.validateStructure(html, errors, warnings);
    
    // CSS validation
    this.validateCSS(html, errors, warnings);
    
    // Image validation
    this.validateImages(html, errors, warnings);
    
    // Compatibility validation
    this.validateCompatibility(html, errors, warnings);
    
    // Accessibility validation
    this.validateAccessibility(html, errors, warnings);

    // Calculate compatibility score
    const score = this.calculateCompatibilityScore(errors, warnings);

    return {
      isValid: errors.length === 0,
      errors: [...errors, ...warnings],
      warnings,
      score
    };
  }

  /**
   * Validate HTML structure for email compatibility
   */
  private static validateStructure(html: string, errors: ValidationError[], warnings: ValidationWarning[]) {
    // Check for table-based layout
    if (!html.includes('<table')) {
      errors.push({
        type: 'error',
        category: 'structure',
        message: 'Email must use table-based layout for maximum email client compatibility',
        suggestion: 'Use <table> elements for layout instead of <div> elements'
      });
    }

    // Check for proper DOCTYPE
    if (!html.includes('DOCTYPE html PUBLIC')) {
      warnings.push({
        type: 'warning',
        category: 'structure',
        message: 'Missing HTML 4.01 Transitional DOCTYPE',
        suggestion: 'Add DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" for better compatibility'
      });
    }

    // Check for proper HTML structure
    if (!html.includes('<html') || !html.includes('<body')) {
      warnings.push({
        type: 'warning',
        category: 'structure',
        message: 'Missing proper HTML document structure',
        suggestion: 'Include <html> and <body> tags with proper attributes'
      });
    }

    // Check for meta tags
    if (!html.includes('viewport')) {
      warnings.push({
        type: 'warning',
        category: 'structure',
        message: 'Missing viewport meta tag',
        suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"/> for mobile support'
      });
    }

    // Check for JavaScript
    if (html.includes('<script') || html.includes('javascript:')) {
      errors.push({
        type: 'error',
        category: 'structure',
        message: 'JavaScript is not supported in email clients',
        suggestion: 'Remove all JavaScript code as it will be stripped by email clients'
      });
    }

    // Check for forms
    if (html.includes('<form')) {
      warnings.push({
        type: 'warning',
        category: 'structure',
        message: 'Forms have limited support in email clients',
        suggestion: 'Consider using links to external forms instead'
      });
    }
  }

  /**
   * Validate CSS for email compatibility
   */
  private static validateCSS(html: string, errors: ValidationError[], warnings: ValidationWarning[]) {
    // Check for external stylesheets
    if (html.includes('<link') && html.includes('stylesheet')) {
      errors.push({
        type: 'error',
        category: 'css',
        message: 'External stylesheets are blocked by most email clients',
        suggestion: 'Use inline styles instead of external CSS files'
      });
    }

    // Check for <style> tags
    if (html.includes('<style>')) {
      errors.push({
        type: 'error',
        category: 'css',
        message: 'Style tags have limited support in email clients',
        suggestion: 'Move all CSS to inline style attributes'
      });
    }

    // Check for unsupported CSS properties
    const unsupportedProperties = [
      { prop: 'position: fixed', message: 'Fixed positioning is not supported' },
      { prop: 'position: absolute', message: 'Absolute positioning has limited support' },
      { prop: 'float:', message: 'Float property has inconsistent support' },
      { prop: 'display: flex', message: 'Flexbox is not supported in most email clients' },
      { prop: 'display: grid', message: 'CSS Grid is not supported in email clients' },
      { prop: 'transform:', message: 'CSS transforms are not supported' },
      { prop: 'animation:', message: 'CSS animations are not supported' },
      { prop: '@media', message: 'Media queries have limited support' },
      { prop: '@keyframes', message: 'CSS animations are not supported' }
    ];

    unsupportedProperties.forEach(({ prop, message }) => {
      if (html.toLowerCase().includes(prop.toLowerCase())) {
        warnings.push({
          type: 'warning',
          category: 'css',
          message: `CSS property "${prop}" - ${message}`,
          suggestion: 'Use table-based layout and inline styles for better compatibility'
        });
      }
    });

    // Check width constraints
    const widthRegex = /width\s*[=:]\s*["\']?(\d+)(?:px)?["\']?/gi;
    let match;
    const widths: number[] = [];
    
    while ((match = widthRegex.exec(html)) !== null) {
      const width = parseInt(match[1]);
      if (!isNaN(width)) {
        widths.push(width);
      }
    }
    
    const maxWidth = widths.length > 0 ? Math.max(...widths) : 0;
    if (maxWidth > EMAIL_CONSTRAINTS.MAX_WIDTH) {
      errors.push({
        type: 'error',
        category: 'css',
        message: `Maximum width exceeded: ${maxWidth}px (limit: ${EMAIL_CONSTRAINTS.MAX_WIDTH}px)`,
        suggestion: `Use max-width: ${EMAIL_CONSTRAINTS.MAX_WIDTH}px for email compatibility`
      });
    }

    // Check for web-safe fonts
    const fontFamilyRegex = /font-family\s*:\s*([^;]+)/gi;
    let fontMatch;
    while ((fontMatch = fontFamilyRegex.exec(html)) !== null) {
      const fontFamily = fontMatch[1].toLowerCase();
      if (!fontFamily.includes('arial') && !fontFamily.includes('helvetica') && !fontFamily.includes('sans-serif')) {
        warnings.push({
          type: 'warning',
          category: 'css',
          message: 'Non-web-safe font detected',
          suggestion: 'Use web-safe fonts like Arial, Helvetica, or sans-serif with fallbacks'
        });
      }
    }
  }

  /**
   * Validate images for email compatibility
   */
  private static validateImages(html: string, errors: ValidationError[], warnings: ValidationWarning[]) {
    const imgRegex = /<img[^>]*>/gi;
    const images = html.match(imgRegex) || [];
    
    images.forEach((img, index) => {
      // Check for alt text
      if (!img.includes('alt=')) {
        warnings.push({
          type: 'warning',
          category: 'accessibility',
          message: `Image ${index + 1} is missing alt text`,
          suggestion: 'Add alt attribute for accessibility and when images are blocked'
        });
      }

      // Check for width and height attributes
      if (!img.includes('width=')) {
        warnings.push({
          type: 'warning',
          category: 'images',
          message: `Image ${index + 1} is missing width attribute`,
          suggestion: 'Add width attribute for consistent rendering across email clients'
        });
      }

      if (!img.includes('height=')) {
        warnings.push({
          type: 'warning',
          category: 'images',
          message: `Image ${index + 1} is missing height attribute`,
          suggestion: 'Add height attribute for consistent rendering across email clients'
        });
      }

      // Check for display block
      if (!img.includes('display: block') && !img.includes('display:block')) {
        warnings.push({
          type: 'warning',
          category: 'images',
          message: `Image ${index + 1} should use display: block`,
          suggestion: 'Add style="display: block;" to prevent spacing issues'
        });
      }
    });
  }

  /**
   * Validate email client compatibility
   */
  private static validateCompatibility(html: string, errors: ValidationError[], warnings: ValidationWarning[]) {
    // Check for proper table structure
    if (html.includes('<table')) {
      if (!html.includes('cellpadding="0"')) {
        warnings.push({
          type: 'warning',
          category: 'compatibility',
          message: 'Tables should include cellpadding="0"',
          suggestion: 'Add cellpadding="0" for consistent spacing across email clients'
        });
      }

      if (!html.includes('cellspacing="0"')) {
        warnings.push({
          type: 'warning',
          category: 'compatibility',
          message: 'Tables should include cellspacing="0"',
          suggestion: 'Add cellspacing="0" for consistent spacing across email clients'
        });
      }

      if (!html.includes('border="0"')) {
        warnings.push({
          type: 'warning',
          category: 'compatibility',
          message: 'Tables should include border="0"',
          suggestion: 'Add border="0" to remove default table borders'
        });
      }
    }

    // Check for Outlook-specific issues
    if (html.includes('background-image:')) {
      warnings.push({
        type: 'warning',
        category: 'compatibility',
        message: 'Background images have limited support in Outlook',
        suggestion: 'Consider using VML fallbacks for Outlook or avoid background images'
      });
    }
  }

  /**
   * Validate accessibility features
   */
  private static validateAccessibility(html: string, errors: ValidationError[], warnings: ValidationWarning[]) {
    // Check for semantic HTML
    if (html.includes('<div') && !html.includes('role=')) {
      warnings.push({
        type: 'warning',
        category: 'accessibility',
        message: 'Consider using semantic HTML or ARIA roles',
        suggestion: 'Add role attributes or use semantic HTML elements for better accessibility'
      });
    }

    // Check for color contrast (basic check)
    if (html.includes('color:') && !html.includes('background-color:')) {
      warnings.push({
        type: 'warning',
        category: 'accessibility',
        message: 'Ensure sufficient color contrast',
        suggestion: 'Test color combinations for accessibility compliance'
      });
    }
  }

  /**
   * Calculate compatibility score based on errors and warnings
   */
  private static calculateCompatibilityScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;
    
    // Deduct points for errors (more severe)
    const errorCount = errors.filter(e => e.type === 'error').length;
    score -= errorCount * 15;
    
    // Deduct points for warnings (less severe)
    const warningCount = warnings.length;
    score -= warningCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(result: ValidationResult): string {
    const { errors, warnings, score } = result;
    const errorCount = errors.filter(e => e.type === 'error').length;
    const warningCount = warnings.length;
    
    if (errorCount === 0 && warningCount === 0) {
      return `✅ Perfect! Your email template is fully compatible (Score: ${score}/100)`;
    } else if (errorCount === 0) {
      return `⚠️ Good compatibility with ${warningCount} minor issue${warningCount !== 1 ? 's' : ''} (Score: ${score}/100)`;
    } else {
      return `❌ ${errorCount} error${errorCount !== 1 ? 's' : ''} and ${warningCount} warning${warningCount !== 1 ? 's' : ''} found (Score: ${score}/100)`;
    }
  }
}

// Export the main validation function for backward compatibility
export function validateEmailHTML(html: string) {
  const result = EmailValidator.validate(html);
  return {
    isValid: result.isValid,
    errors: result.errors.map(e => e.message),
    warnings: result.warnings.map(w => w.message)
  };
}