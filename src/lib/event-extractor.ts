import { extractEvents } from './snowflake-ai';
import { EventData } from './types';
import { v4 as uuidv4 } from 'uuid';

export async function extractEventsFromDocument(documentId: string, text: string): Promise<EventData[]> {
  try {
    const rawEvents = await extractEvents(text, documentId);
    
    return rawEvents.map(event => ({
      ...event,
      event_id: event.event_id || uuidv4(),
      document_id: documentId
    }));
  } catch (error) {
    console.error('Error extracting events:', error);
    return [];
  }
}
