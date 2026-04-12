export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (10MB limit)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  // Check file extension
  const allowedExtensions = ['.md', '.markdown'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { valid: false, error: 'Invalid file type. Only .md and .markdown files are allowed.' };
  }

  // Check MIME type
  const allowedMimeTypes = ['text/markdown', 'text/plain', 'application/octet-stream'];
  if (!allowedMimeTypes.includes(file.type) && file.type !== '') {
    return { valid: false, error: 'Invalid file type.' };
  }

  return { valid: true };
}

export async function sanitizeMarkdownContent(content: string): Promise<{ safe: boolean; content?: string; error?: string }> {
  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi,
    /<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /file:/gi,
    /ftp:/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return { safe: false, error: 'Potentially dangerous content detected' };
    }
  }

  // Check for excessive content length
  if (content.length > 1000000) { // 1MB of text
    return { safe: false, error: 'Content too long' };
  }

  // Sanitize content by removing any HTML tags (except markdown syntax)
  const sanitized = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')   // Restore escaped less-than signs
    .replace(/&gt;/g, '>')   // Restore escaped greater-than signs
    .replace(/&amp;/g, '&'); // Restore escaped ampersands

  return { safe: true, content: sanitized };
}

export function generateSecureFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.toLowerCase().endsWith('.markdown') ? '.markdown' : '.md';
  return `journal_${timestamp}_${random}${extension}`;
}

export function validateJSONInput(data: unknown): { valid: boolean; error?: string } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid data format' };
  }

  // Check for potentially dangerous nested objects
  const dataString = JSON.stringify(data);
  if (dataString.length > 100000) { // 100KB limit
    return { valid: false, error: 'Data too large' };
  }

  // Check for script injection attempts
  if (/<script|javascript:|on\w+\s*=/i.test(dataString)) {
    return { valid: false, error: 'Potentially dangerous content detected' };
  }

  return { valid: true };
}
