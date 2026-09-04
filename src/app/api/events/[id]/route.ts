import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse } from '@/lib/types';
import { deleteInMemoryEvent } from '@/lib/event-store';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const id = params.id;

    // Delete from in-memory fallback
    deleteInMemoryEvent(id);

    // Try deleting from Snowflake
    try {
      await executeQuery('DELETE FROM TMSL_AI.PUBLIC.EVENTS WHERE EVENT_ID = ?', [id]);
    } catch (e) {
      console.warn('Snowflake event delete fallback:', e);
    }

    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    console.error('Delete Event Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Delete event failed' },
      { status: 500 }
    );
  }
}
