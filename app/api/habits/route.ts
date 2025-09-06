import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth/lib/auth';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { date, ...data } = body;

  try {
    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    const habitEntry = await prisma.habitEntry.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: entryDate,
        },
      },
      update: {
        data: data,
        comments: body.comments, // Also update comments if they exist
      },
      create: {
        userId: userId,
        date: entryDate,
        data: data,
        comments: body.comments,
      },
    });

    return NextResponse.json(habitEntry, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// Waiting List Project: Google Sheets Integration
// import { google } from 'googleapis';
//
// export async function POST(req: NextRequest) {
//   const body = await req.json();
//
//   try {
//     const auth = new google.auth.GoogleAuth({
//       credentials: {
//         client_email: process.env.GOOGLE_CLIENT_EMAIL,
//         private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, '\n'),
//       },
//       scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//     });
//
//     const sheets = google.sheets({
//       auth,
//       version: 'v4',
//     });
//
//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: process.env.GOOGLE_SHEET_ID,
//       range: 'Sheet1!A1:D1', // Adjust the range as needed
//       valueInputOption: 'USER_ENTERED',
//       requestBody: {
//         values: [
//           [body.question1, body.question2, new Date().toISOString()], // Example data
//         ],
//       },
//     });
//
//     return NextResponse.json({ data: response.data }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
//   }
// }
