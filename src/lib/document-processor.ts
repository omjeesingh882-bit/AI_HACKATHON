import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';

export async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const data = await pdf(buffer);
    return data.text;
  } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return buffer.toString('utf-8');
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    file.name.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  
  throw new Error(`Unsupported file type: ${file.type || file.name}`);
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .trim();
}

export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = i + chunkSize;
    
    if (end < text.length) {
      let spaceIdx = text.lastIndexOf(' ', end);
      let newlineIdx = text.lastIndexOf('\n', end);
      let breakIdx = Math.max(spaceIdx, newlineIdx);
      if (breakIdx > i + chunkSize / 2) {
        end = breakIdx;
      }
    } else {
      end = text.length;
    }
    
    chunks.push(text.substring(i, end).trim());
    i = end - overlap;
    
    if (i >= text.length || end === text.length) {
      break;
    }
  }
  
  return chunks.filter(c => c.length > 0);
}

export async function processDocument(
  file: File, 
  metadata: { title: string; category: string; department: string; source: string }
): Promise<{ 
  documentId: string; 
  chunks: { chunkId: string; chunkIndex: number; content: string }[]; 
  fullText: string 
}> {
  const rawText = await extractText(file);
  const cleanedText = cleanText(rawText);
  const textChunks = chunkText(cleanedText);
  
  const documentId = uuidv4();
  
  const chunks = textChunks.map((content, index) => ({
    chunkId: uuidv4(),
    chunkIndex: index,
    content
  }));
  
  return {
    documentId,
    chunks,
    fullText: cleanedText
  };
}
