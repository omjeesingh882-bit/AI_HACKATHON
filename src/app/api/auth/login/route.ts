import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { ApiResponse, User } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ user: User }>>> {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { user, error } = await authenticateUser(email, password);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error('Auth Login Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
