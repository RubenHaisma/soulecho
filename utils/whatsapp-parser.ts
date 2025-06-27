export interface WhatsAppMessage {
  sender: string;
  content: string;
  timestamp: string;
  date?: Date;
}

export interface ParsedData {
  totalMessages: number;
  dateRange: string;
  participants: string[];
  preview: string[];
  messages: WhatsAppMessage[];
}

export function parseWhatsAppFile(text: string): ParsedData {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Multiple patterns to handle different WhatsApp export formats
  const patterns = [
    // Pattern 1: [DD/MM/YYYY, HH:MM:SS] Sender: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\s?([AP]?M?)\]\s*([^:]+):\s*(.+)$/,
    // Pattern 2: [DD/MM/YY, HH:MM:SS AM/PM] Sender: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{2}), (\d{1,2}:\d{2}:\d{2})\s([AP]M)\]\s*([^:]+):\s*(.+)$/,
    // Pattern 3: DD/MM/YYYY, HH:MM - Sender: Message
    /^(\d{1,2}\/\d{1,2}\/\d{4}), (\d{1,2}:\d{2})\s?-\s*([^:]+):\s*(.+)$/
  ];
  
  const messages: WhatsAppMessage[] = [];
  const participants = new Set<string>();
  
  lines.forEach(line => {
    let match = null;
    let patternIndex = -1;
    
    // Try each pattern
    for (let i = 0; i < patterns.length; i++) {
      match = line.match(patterns[i]);
      if (match) {
        patternIndex = i;
        break;
      }
    }
    
    if (match) {
      let sender: string;
      let content: string;
      let dateStr: string;
      let timeStr: string;
      
      switch (patternIndex) {
        case 0: // [DD/MM/YYYY, HH:MM:SS] format
          [, dateStr, timeStr, , sender, content] = match;
          break;
        case 1: // [DD/MM/YY, HH:MM:SS AM/PM] format
          [, dateStr, timeStr, , sender, content] = match;
          break;
        case 2: // DD/MM/YYYY, HH:MM - format
          [, dateStr, timeStr, sender, content] = match;
          break;
        default:
          return;
      }
      
      const cleanSender = sender.trim();
      const cleanContent = content.trim();
      
      // Skip system messages
      if (cleanContent.includes('<Media omitted>') || 
          cleanContent.includes('Messages and calls are end-to-end encrypted') ||
          cleanContent.includes('This message was deleted')) {
        return;
      }
      
      participants.add(cleanSender);
      messages.push({
        sender: cleanSender,
        content: cleanContent,
        timestamp: `${dateStr}, ${timeStr}`,
        date: parseDate(dateStr, timeStr)
      });
    }
  });

  if (messages.length === 0) {
    throw new Error('No valid WhatsApp messages found. Please check your file format.');
  }

  // Sort messages by date
  messages.sort((a, b) => {
    if (a.date && b.date) {
      return a.date.getTime() - b.date.getTime();
    }
    return 0;
  });

  const dateRange = messages.length > 0 ? 
    `${messages[0].timestamp.split(',')[0]} - ${messages[messages.length - 1].timestamp.split(',')[0]}` : 
    'Unknown';

  return {
    totalMessages: messages.length,
    dateRange,
    participants: Array.from(participants),
    preview: messages.slice(0, 5).map(m => `${m.sender}: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`),
    messages
  };
}

function parseDate(dateStr: string, timeStr: string): Date | undefined {
  try {
    // Handle different date formats
    const [day, month, year] = dateStr.split('/').map(Number);
    const [time, period] = timeStr.includes('M') ? timeStr.split(' ') : [timeStr, ''];
    const [hours, minutes, seconds = 0] = time.split(':').map(Number);
    
    let adjustedHours = hours;
    if (period === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (period === 'AM' && hours === 12) {
      adjustedHours = 0;
    }
    
    // Handle 2-digit years by assuming they're in 2000s
    const fullYear = year < 100 ? 2000 + year : year;
    
    return new Date(fullYear, month - 1, day, adjustedHours, minutes, seconds);
  } catch (error) {
    console.warn('Failed to parse date:', dateStr, timeStr);
    return undefined;
  }
}

export function filterMessagesBySender(messages: WhatsAppMessage[], selectedSender: string): WhatsAppMessage[] {
  return messages.filter(message => message.sender === selectedSender);
}