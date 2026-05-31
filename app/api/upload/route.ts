import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import { rateLimitMiddleware, securityHeadersMiddleware, logSecurityEvent, validateSession } from '../../lib/security';
import { validateFileUpload, sanitizeMarkdownContent } from '../../lib/input-validation';

function parseMarkdownFile(content: string): { timestamp: number; fields: { title: string; content: string }[] }[] {
  
  const entries: { timestamp: number; fields: { title: string; content: string }[] }[] = [];
  const lines = content.split('\n');
  let currentEntry: { timestamp: number; fields: { title: string; content: string }[] } | null = null;
  let currentField: { title: string; content: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip standalone --- lines
    if (trimmedLine === '---') {
      continue;
    }
    
    // Check for entry title: # Journal Entry - 4/3/2026 OR --- Journal Entry Friday, 4/3/2026, 12:00:00 PM ---
    const entryMatch = trimmedLine.match(/^# Journal Entry\s+-\s+(\d{1,2}\/\d{1,2}\/\d{4})$/) || 
                      trimmedLine.match(/^---\s+Journal Entry\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*,\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (entryMatch) {
      // Save current field if exists
      if (currentField && currentEntry) {
        currentEntry.fields.push(currentField);
      }
      // Save current entry if it exists
      if (currentEntry && currentEntry.fields.length > 0) {
        entries.push(currentEntry);
      }
      
      // Start new entry
      const dateStr = entryMatch[1];
      const [month, day, year] = dateStr.split('/').map(Number);
      const entryDate = new Date(year, month - 1, day, 12, 0, 0);
      currentEntry = { timestamp: entryDate.getTime(), fields: [] };
      currentField = null;
      continue;
    }
    
    // Check for field header: ### What went well today
    const fieldMatch = trimmedLine.match(/^###\s+(.+)$/);
    if (fieldMatch) {
      // Save current field if it has content
      if (currentField && currentEntry) {
        currentEntry.fields.push(currentField);
      }
      // Start new field
      currentField = { title: fieldMatch[1].trim(), content: '' };
      continue;
    }
    
    // Add content to current field
    if (currentField && currentEntry) {
      currentField.content += (currentField.content ? '\n' : '') + line;
    }
  }
  
  // Save final field and entry
  if (currentField && currentEntry) {
    currentEntry.fields.push(currentField);
  }
  if (currentEntry && currentEntry.fields.length > 0) {
    entries.push(currentEntry);
  }

  return entries;
}

export async function GET() {
  // Test the parser with sample content
  const testContent = `# Journal Entry - 4/3/2026
### What went well today
I have get up early, read, follow my miracle morning routine.

### What I learned today
The importance of taking breaks.

---

# Journal Entry - 4/4/2026
### What went well today
Another productive day.

### What I learned today
Think with the end in mind.

---`;

  const entries = parseMarkdownFile(testContent);
  
  return NextResponse.json({
    message: 'Parser test results',
    entries: entries,
    count: entries.length
  });
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return securityHeadersMiddleware(rateLimitResponse);
    }

    // Validate session
    const session = await validateSession(request);
    if (session instanceof NextResponse) {
      return securityHeadersMiddleware(session);
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const errorResponse = NextResponse.json({ error: 'No file provided' }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    // Enhanced file validation
    const fileValidation = validateFileUpload(file);
    if (!fileValidation.valid) {
      logSecurityEvent('INVALID_FILE_UPLOAD', { 
        fileName: file.name, 
        fileSize: file.size, 
        error: fileValidation.error 
      }, request);
      
      const errorResponse = NextResponse.json({ error: fileValidation.error }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    const content = await file.text();
    
    // Sanitize content
    const sanitized = await sanitizeMarkdownContent(content);
    if (!sanitized.safe) {
      logSecurityEvent('DANGEROUS_CONTENT_DETECTED', { 
        fileName: file.name, 
        error: sanitized.error 
      }, request);
      
      const errorResponse = NextResponse.json({ error: sanitized.error }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }
    
    // Parse the markdown file
    const entries = parseMarkdownFile(sanitized.content!);

    if (entries.length === 0) {
      const errorResponse = NextResponse.json({ error: 'No valid journal entries found in file' }, { status: 400 });
      return securityHeadersMiddleware(errorResponse);
    }

    // Save entries to database
    const savedEntries = [];

    for (const entry of entries) {
      try {
        // Convert fields to dynamicFields object
        const dynamicFields: Record<string, string> = {};
        entry.fields.forEach((field: { title?: string; content?: string }) => {
          if (field && typeof field === 'object' && field.title && field.content) {
            dynamicFields[field.title] = field.content;
          }
        });
        
        const entryDate = new Date(entry.timestamp);
        
        const savedEntry = await prisma.journalEntry.create({
          data: {
            userId: session.user.id,
            createdAt: entryDate,
            whatWentWell: '',
            whatILearned: '',
            whatWouldDoDifferently: '',
            nextStep: '',
            timeJournaling: '',
            customTitles: {},
            dynamicFields: dynamicFields,
          },
        });
        savedEntries.push(savedEntry);
      } catch (error) {
        console.error('Error saving entry:', error);
        // Continue with other entries even if one fails
      }
    }

    const successResponse = NextResponse.json({
      message: `Successfully uploaded ${savedEntries.length} journal entries`,
      entriesCount: savedEntries.length,
      entries: savedEntries
    });

    return securityHeadersMiddleware(successResponse);

  } catch (error) {
    console.error('Upload error:', error);
    logSecurityEvent('UPLOAD_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' }, request);
    
    const errorResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    return securityHeadersMiddleware(errorResponse);
  }
}
