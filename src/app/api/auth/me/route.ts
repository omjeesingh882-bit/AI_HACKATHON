import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth';
import { ApiResponse, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<User | null>>> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: true, data: null });
    }

    const user = await getUserByEmail(email);
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
