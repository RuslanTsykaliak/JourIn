import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/lib/auth';
import prisma from '../../lib/prisma';

function parseMarkdownFile(content: string): { timestamp: number; fields: { title: string; content: string }[] }[] {
  console.log('Starting parseMarkdownFile with content length:', content.length);
  
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
      console.log('Found new entry with date:', dateStr);
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
      console.log('Found field:', currentField.title);
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

  console.log(`Parsed ${entries.length} entries from ${lines.length} lines`);
  return entries;
}

export async function GET(request: NextRequest) {
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
    console.log('Upload request received');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file?.name, file?.size);

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      console.log('Invalid file type:', file.name);
      return NextResponse.json({ error: 'Invalid file type. Only .md and .markdown files are allowed.' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    console.log('Reading file content...');
    const content = await file.text();
    console.log('Content length:', content.length);
    
    // Parse the markdown file
    const entries = parseMarkdownFile(content);
    console.log('Parsed entries:', entries.length);

    if (entries.length === 0) {
      console.log('No valid journal entries found');
      return NextResponse.json({ error: 'No valid journal entries found in file' }, { status: 400 });
    }

    // Save entries to database
    const userId = session.user.id;
    const savedEntries = [];

    console.log('Starting to save entries to database...');
    for (const entry of entries) {
      try {
        // Convert fields to dynamicFields object
        const dynamicFields: Record<string, string> = {};
        entry.fields.forEach(field => {
          dynamicFields[field.title] = field.content;
        });
        
        const entryDate = new Date(entry.timestamp);
        console.log('DEBUG: Raw timestamp:', entry.timestamp);
        console.log('DEBUG: Parsed entry date:', entryDate.toISOString());
        console.log('DEBUG: Entry date local string:', entryDate.toLocaleDateString());
        console.log('DEBUG: Saving with createdAt:', entryDate);
        
        const savedEntry = await prisma.journalEntry.create({
          data: {
            userId: session.user.id,
            createdAt: entryDate,
            whatWentWell: '',
            whatILearned: '',
            whatWouldDoDifferently: '',
            nextStep: '',
            customTitles: {},
            dynamicFields: dynamicFields,
          },
        });
        savedEntries.push(savedEntry);
        console.log('Entry saved successfully');
      } catch (error) {
        console.error('Error saving entry:', error);
        // Continue with other entries even if one fails
      }
    }

    console.log(`Successfully saved ${savedEntries.length} entries to database`);

    return NextResponse.json({
      message: `Successfully uploaded ${savedEntries.length} journal entries`,
      entriesCount: savedEntries.length,
      entries: savedEntries
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
