import { NextRequest, NextResponse } from 'next/server';
import {
  getRegistrationsByEventId,
  getGroupedRegistrationsByEventId,
  addRegistration,
} from '@/lib/event-registration-store';
import { getInMemoryEvents } from '@/lib/event-store';
import { ApiResponse, EventRegistration } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ registrations: EventRegistration[]; grouped: any[]; count: number }>>> {
  try {
    const eventId = params.id;
    const registrations = getRegistrationsByEventId(eventId);
    const grouped = getGroupedRegistrationsByEventId(eventId);

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        grouped,
        count: registrations.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching event registrations:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<EventRegistration>>> {
  try {
    const eventId = params.id;
    const body = await req.json();

    const {
      full_name,
      roll_number,
      department,
      phone_number,
      gender,
      email,
      participation_type,
      group_name,
      team_members,
      student_id,
    } = body;

    // Validate mandatory fields
    if (!full_name?.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is mandatory' }, { status: 400 });
    }
    if (!roll_number?.trim()) {
      return NextResponse.json({ success: false, error: 'College Roll Number is mandatory' }, { status: 400 });
    }
    if (!department?.trim()) {
      return NextResponse.json({ success: false, error: 'Department is mandatory' }, { status: 400 });
    }
    if (!phone_number?.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number is mandatory' }, { status: 400 });
    }
    if (!gender) {
      return NextResponse.json({ success: false, error: 'Gender selection is mandatory' }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ success: false, error: 'Email address is mandatory' }, { status: 400 });
    }

    if (participation_type === 'group' && !group_name?.trim()) {
      return NextResponse.json({ success: false, error: 'Group / Team name is mandatory for group participation' }, { status: 400 });
    }

    // Find event title from store
    const allEvents = getInMemoryEvents();
    const targetEvent = allEvents.find((e) => e.event_id === eventId);
    const eventTitle = targetEvent ? targetEvent.title : 'Campus Event';

    const newRegistration = addRegistration({
      event_id: eventId,
      event_title: eventTitle,
      student_id: student_id || `student-${email.split('@')[0]}`,
      full_name: full_name.trim(),
      roll_number: roll_number.trim(),
      department: department.trim(),
      phone_number: phone_number.trim(),
      gender,
      email: email.trim().toLowerCase(),
      participation_type: participation_type === 'group' ? 'group' : 'individual',
      group_name: participation_type === 'group' ? group_name.trim() : undefined,
      team_members: participation_type === 'group' && Array.isArray(team_members) ? team_members : undefined,
    });

    return NextResponse.json({
      success: true,
      data: newRegistration,
    });
  } catch (error: any) {
    console.error('Error creating event registration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit event registration' },
      { status: 500 }
    );
  }
}
