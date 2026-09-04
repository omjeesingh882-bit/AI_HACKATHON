import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents } from '@/lib/auth';
import { ApiResponse, User } from '@/lib/types';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    const students = await getAllStudents();
    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    console.error('Fetch Students Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
