import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationsByStudentEmail } from '@/lib/event-registration-store';
import { ApiResponse, EventRegistration } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ registrations: EventRegistration[]; registeredEventIds: string[] }>>> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: true,
        data: { registrations: [], registeredEventIds: [] },
      });
    }

    const registrations = getRegistrationsByStudentEmail(email);
    const registeredEventIds = Array.from(new Set(registrations.map((r) => r.event_id)));

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        registeredEventIds,
      },
    });
  } catch (error: any) {
    console.error('Error fetching my registrations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
