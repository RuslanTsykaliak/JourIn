import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import { JournalEntryWithTimestamp, defaultTitles, CustomTitles } from '../../types';
import { rateLimitMiddleware, securityHeadersMiddleware, logSecurityEvent, validateSession } from '../../lib/security';

// Helper function to convert Prisma entry to JournalEntryWithTimestamp
function convertPrismaEntry(prismaEntry: {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  whatWentWell: string | null;
  whatILearned: string | null;
  whatWouldDoDifferently: string | null;
  nextStep: string | null;
  timeJournaling: string | null;
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
    timeJournaling: prismaEntry.timeJournaling || '',
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
    const date = new Date(entry.timestamp);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
    
    let entryContent = '';
    
    // Add standard fields with custom titles
    const standardFields = [
      { key: 'whatWentWell', value: entry.whatWentWell },
      { key: 'whatILearned', value: entry.whatILearned },
      { key: 'whatWouldDoDifferently', value: entry.whatWouldDoDifferently },
      { key: 'nextStep', value: entry.nextStep },
      { key: 'timeJournaling', value: entry.timeJournaling },
    ];
    
    standardFields.forEach(({ key, value }) => {
      if (value && value.trim() !== '') {
        const title = entry.customTitles?.[key] || defaultTitles[key];
        entryContent += `### ${title}\n${value}\n\n`;
      }
    });
    
    // Add dynamic fields with custom titles
    if (entry.dynamicFields && Object.keys(entry.dynamicFields).length > 0) {
      Object.entries(entry.dynamicFields).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim() !== '') {
          const title = entry.customTitles?.[key] || key;
          entryContent += `### ${title}\n${value}\n\n`;
        }
      });
    }

    return `## Journal Entry ${dayOfWeek}, ${dateStr}, ${timeStr}

${entryContent}---`;
  }).join('\n\n');
}

export async function GET(request: NextRequest) {
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

    // Log export access
    logSecurityEvent('DATA_EXPORT', { format: 'markdown' }, request);

    // CSV export temporarily disabled - only Markdown export available
    const { searchParams } = new URL(request.url);
    // const format = searchParams.get('format') || 'markdown';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build date filter
    const dateFilter: Record<string, unknown> = {};
    if (fromDate) {
      dateFilter.gte = new Date(fromDate);
    }
    if (toDate) {
      // Set to end of day for toDate
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    // Fetch user's journal entries from database
    const prismaEntries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
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
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const filename = `journal-history-${year}.${month}.${day}.${hour}.${minute}.md`;
      
      const response = new NextResponse(markdownContent, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });

      return securityHeadersMiddleware(response);
    // }
  } catch (error) {
    console.error('Export error:', error);
    logSecurityEvent('EXPORT_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' }, request);
    
    const errorResponse = NextResponse.json(
      { error: 'Failed to export journal entries' },
      { status: 500 }
    );
    return securityHeadersMiddleware(errorResponse);
  }
}
