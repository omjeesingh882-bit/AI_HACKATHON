import { NextRequest, NextResponse } from 'next/server';
import { registerStudent } from '@/lib/auth';
import { ApiResponse, User } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ user: User }>>> {
  try {
    const body = await req.json();
    const { email, password, name, department, rollNumber, year } = body;

    if (!email || !password || !name || !department || !year) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, password, department, and year of study are all mandatory.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    const { user, error } = await registerStudent({
      email,
      password,
      name,
      department,
      rollNumber,
      year,
    });

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error('Auth Register Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
