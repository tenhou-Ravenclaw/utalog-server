import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 全ての履歴を取得するAPI
export async function GET() {
  try {
    const allHistory = await prisma.songHistory.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(allHistory);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}