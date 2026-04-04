import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/lib/auth';
import prisma from '../../lib/prisma';
import { JournalEntryWithTimestamp, defaultTitles, CustomTitles } from '../../types';

// Helper function to convert Prisma entry to JournalEntryWithTimestamp
function convertPrismaEntry(prismaEntry: {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  whatWentWell: string | null;
  whatILearned: string | null;
  whatWouldDoDifferently: string | null;
  nextStep: string | null;
  customTitles: unknown;
  dynamicFields: unknown;
  userId: string;
}): JournalEntryWithTimestamp {
  return {
    timestamp: new Date(prismaEntry.createdAt).getTime(),
    whatWentWell: prismaEntry.whatWentWell || '',
    whatILearned: prismaEntry.whatILearned || '',
    whatWouldDoDifferently: prismaEntry.whatWouldDoDifferently || '',
    nextStep: prismaEntry.nextStep || '',
    customTitles: (prismaEntry.customTitles as CustomTitles) || defaultTitles,
    dynamicFields: (prismaEntry.dynamicFields as Record<string, string>) || {},
  };
}

// Generate CSV format
// function generateCSV(entries: JournalEntryWithTimestamp[]): string {
//   const headers = ['Date', 'What Went Well', 'What I Learned', 'What Would Do Differently', 'Next Step'];
  
//   // Add dynamic field headers
//   const dynamicFieldKeys = new Set<string>();
//   entries.forEach(entry => {
//     if (entry.dynamicFields) {
//       Object.keys(entry.dynamicFields).forEach(key => dynamicFieldKeys.add(key));
//     }
//   });
  
//   const allHeaders = [...headers, ...Array.from(dynamicFieldKeys).sort()];
  
//   const csvRows = [
//     allHeaders.join(','),
//     ...entries.map(entry => {
//       const date = new Date(entry.timestamp).toLocaleDateString();
      
//       const row = [
//         `"${date}"`,
//         `"${(entry.whatWentWell || '').replace(/"/g, '""')}"`,
//         `"${(entry.whatILearned || '').replace(/"/g, '""')}"`,
//         `"${(entry.whatWouldDoDifferently || '').replace(/"/g, '""')}"`,
//         `"${(entry.nextStep || '').replace(/"/g, '""')}"`
//       ];
      
//       // Add dynamic field values
//       Array.from(dynamicFieldKeys).sort().forEach(key => {
//         const value = entry.dynamicFields?.[key] || '';
//         row.push(`"${value.replace(/"/g, '""')}"`);
//       });
      
//       return row.join(',');
//     })
//   ];
  
//   return csvRows.join('\n');
// }

// Generate Markdown format
function generateMarkdown(entries: JournalEntryWithTimestamp[]): string {
  return entries.map(entry => {
    const titles = { ...defaultTitles, ...entry.customTitles };
    const date = new Date(entry.timestamp).toLocaleDateString();
    
    // Get standard fields
    const standardFields = ['whatWentWell', 'whatILearned', 'whatWouldDoDifferently', 'nextStep'];
    
    let entryContent = '';
    
    // Add standard fields
    standardFields.forEach(key => {
      const value = entry[key];
      if (value && typeof value === 'string' && value.trim() !== '') {
        const title = entry[`${key}_title`] || titles[key] || key;
        entryContent += `### ${title}\n${value}\n\n`;
      }
    });
    
    // Add dynamic fields
    if (entry.dynamicFields && Object.keys(entry.dynamicFields).length > 0) {
      Object.entries(entry.dynamicFields).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim() !== '') {
          const title = entry.customTitles?.[`${key}_title`] || key;
          entryContent += `### ${title}\n${value}\n\n`;
        }
      });
    }

    return `# Journal Entry - ${date}\n\n${entryContent}---\n`;
  }).join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // CSV export temporarily disabled - only Markdown export available
    // const { searchParams } = new URL(request.url);
    // const format = searchParams.get('format') || 'markdown';

    // Fetch user's journal entries from database
    const prismaEntries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert to JournalEntryWithTimestamp format
    const entries = prismaEntries.map(convertPrismaEntry);

    // CSV export temporarily disabled - only Markdown export available
    // if (format === 'csv') {
    //   const csvContent = generateCSV(entries);
    //   const filename = `journal-history-${new Date().toISOString().split('T')[0]}.csv`;
      
    //   return new NextResponse(csvContent, {
    //     headers: {
    //       'Content-Type': 'text/csv',
    //       'Content-Disposition': `attachment; filename="${filename}"`
    //     }
    //   });
    // } else {
      const markdownContent = generateMarkdown(entries);
      const filename = `journal-history-${new Date().toISOString().split('T')[0]}.md`;
      
      return new NextResponse(markdownContent, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    // }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export journal entries' },
      { status: 500 }
    );
  }
}
