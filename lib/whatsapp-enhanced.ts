export interface WhatsAppMessage {
  sender: string;
  content: string;
  timestamp: string;
  date?: Date;
  isSystemMessage?: boolean;
}

export interface ParsedData {
  totalMessages: number;
  dateRange: string;
  participants: string[];
  preview: string[];
  messages: WhatsAppMessage[];
  successRate: number;
}

export interface ParsingStats {
  totalLines: number;
  successfullyParsed: number;
  skippedSystemMessages: number;
  errors: number;
}

export class WhatsAppParser {
  private static readonly PATTERNS = [
    // Pattern 1: [DD/MM/YYYY, HH:MM:SS] Sender: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\s?([AP]?M?)\]\s*([^:]+):\s*(.+)$/,
    // Pattern 2: [DD/MM/YY, HH:MM:SS AM/PM] Sender: Message  
    /^\[(\d{1,2}\/\d{1,2}\/\d{2}), (\d{1,2}:\d{2}:\d{2})\s([AP]M)\]\s*([^:]+):\s*(.+)$/,
    // Pattern 3: DD/MM/YYYY, HH:MM - Sender: Message
    /^(\d{1,2}\/\d{1,2}\/\d{4}), (\d{1,2}:\d{2})\s?-\s*([^:]+):\s*(.+)$/,
    // Pattern 4: [DD.MM.YY, HH:MM:SS] Sender: Message (European format)
    /^\[(\d{1,2}\.\d{1,2}\.\d{2,4}), (\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.+)$/,
    // Pattern 5: MM/DD/YYYY, HH:MM AM/PM - Sender: Message (US format)
    /^(\d{1,2}\/\d{1,2}\/\d{4}), (\d{1,2}:\d{2})\s([AP]M)\s-\s([^:]+):\s*(.+)$/
  ];

  private static readonly SYSTEM_MESSAGES = [
    '<Media omitted>',
    'Messages and calls are end-to-end encrypted',
    'This message was deleted',
    'You deleted this message',
    'This message was deleted.',
    'image omitted',
    'video omitted',
    'audio omitted',
    'document omitted',
    'GIF omitted',
    'sticker omitted',
    'Contact card omitted',
    'Location omitted',
    '‎image omitted',
    '‎video omitted',
    '‎audio omitted',
    '‎document omitted',
    'Missed voice call',
    'Missed video call',
    'Voice call',
    'Video call'
  ];

  static parseFile(text: string): ParsedData {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const messages: WhatsAppMessage[] = [];
    const participants = new Set<string>();
    const stats: ParsingStats = {
      totalLines: lines.length,
      successfullyParsed: 0,
      skippedSystemMessages: 0,
      errors: 0
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const parsedMessage = this.parseLine(line, i);
        
        if (parsedMessage) {
          if (parsedMessage.isSystemMessage) {
            stats.skippedSystemMessages++;
          } else {
            messages.push(parsedMessage);
            participants.add(parsedMessage.sender);
            stats.successfullyParsed++;
          }
        } else {
          // Try to append to previous message (continuation)
          if (messages.length > 0 && !this.looksLikeNewMessage(line)) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.content += ' ' + line;
            continue;
          }
          stats.errors++;
        }
      } catch (error) {
        stats.errors++;
        console.warn(`Error parsing line ${i + 1}: ${line}`, error);
      }
    }

    if (messages.length === 0) {
      throw new Error(`No valid WhatsApp messages found. 
        Parsed ${stats.totalLines} lines, found ${stats.errors} errors.
        Please check your file format. Supported formats:
        - [DD/MM/YYYY, HH:MM:SS] Name: Message
        - DD/MM/YYYY, HH:MM - Name: Message`);
    }

    // Sort messages by date
    messages.sort((a, b) => {
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime();
      }
      return 0;
    });

    const dateRange = this.getDateRange(messages);
    const successRate = Math.round((stats.successfullyParsed / stats.totalLines) * 100);

    return {
      totalMessages: messages.length,
      dateRange,
      participants: Array.from(participants).sort(),
      preview: this.generatePreview(messages),
      messages,
      successRate
    };
  }

  private static parseLine(line: string, lineNumber: number): WhatsAppMessage | null {
    for (let i = 0; i < this.PATTERNS.length; i++) {
      const match = line.match(this.PATTERNS[i]);
      if (match) {
        return this.extractMessageFromMatch(match, i, line);
      }
    }
    return null;
  }

  private static extractMessageFromMatch(
    match: RegExpMatchArray, 
    patternIndex: number, 
    originalLine: string
  ): WhatsAppMessage {
    let sender: string;
    let content: string;
    let dateStr: string;
    let timeStr: string;
    let period: string = '';

    switch (patternIndex) {
      case 0: // [DD/MM/YYYY, HH:MM:SS] format
        [, dateStr, timeStr, period, sender, content] = match;
        break;
      case 1: // [DD/MM/YY, HH:MM:SS AM/PM] format
        [, dateStr, timeStr, period, sender, content] = match;
        break;
      case 2: // DD/MM/YYYY, HH:MM - format
        [, dateStr, timeStr, sender, content] = match;
        break;
      case 3: // [DD.MM.YY, HH:MM:SS] format (dots)
        [, dateStr, timeStr, sender, content] = match;
        dateStr = dateStr.replace(/\./g, '/'); // Convert dots to slashes
        break;
      case 4: // MM/DD/YYYY, HH:MM AM/PM format (US)
        [, dateStr, timeStr, period, sender, content] = match;
        break;
      default:
        throw new Error(`Unknown pattern index: ${patternIndex}`);
    }

    const cleanSender = sender.trim();
    const cleanContent = content.trim();
    const isSystemMessage = this.isSystemMessage(cleanContent);

    return {
      sender: cleanSender,
      content: cleanContent,
      timestamp: `${dateStr}, ${timeStr}${period ? ' ' + period : ''}`,
      date: this.parseDate(dateStr, timeStr, period),
      isSystemMessage
    };
  }

  private static isSystemMessage(content: string): boolean {
    return this.SYSTEM_MESSAGES.some(systemMsg => 
      content.toLowerCase().includes(systemMsg.toLowerCase())
    );
  }

  private static looksLikeNewMessage(line: string): boolean {
    // Check if line starts with typical message patterns
    return this.PATTERNS.some(pattern => pattern.test(line));
  }

  private static parseDate(dateStr: string, timeStr: string, period?: string): Date | undefined {
    try {
      const [day, month, year] = dateStr.split(/[\/\.]/).map(Number);
      const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
      
      let adjustedHours = hours;
      if (period) {
        if (period.toUpperCase() === 'PM' && hours !== 12) {
          adjustedHours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
          adjustedHours = 0;
        }
      }
      
      // Handle 2-digit years
      const fullYear = year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;
      
      const date = new Date(fullYear, month - 1, day, adjustedHours, minutes, seconds);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return undefined;
      }
      
      return date;
    } catch (error) {
      console.warn('Failed to parse date:', dateStr, timeStr, period);
      return undefined;
    }
  }

  private static getDateRange(messages: WhatsAppMessage[]): string {
    if (messages.length === 0) return 'Unknown';
    
    const firstDate = messages[0].timestamp.split(',')[0];
    const lastDate = messages[messages.length - 1].timestamp.split(',')[0];
    
    return firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;
  }

  private static generatePreview(messages: WhatsAppMessage[]): string[] {
    return messages
      .filter(m => !m.isSystemMessage && m.content.length > 10)
      .slice(0, 5)
      .map(m => {
        const preview = m.content.substring(0, 80);
        return `${m.sender}: ${preview}${m.content.length > 80 ? '...' : ''}`;
      });
  }

  static filterMessagesBySender(messages: WhatsAppMessage[], selectedSender: string): WhatsAppMessage[] {
    return messages
      .filter(message => 
        message.sender === selectedSender && 
        !message.isSystemMessage &&
        message.content.length > 3 // Filter out very short messages
      )
      .map(message => ({
        ...message,
        content: this.cleanContent(message.content)
      }));
  }

  private static cleanContent(content: string): string {
    // Remove common artifacts and clean up the content
    return content
      .replace(/\u200E/g, '') // Remove left-to-right mark
      .replace(/\u200F/g, '') // Remove right-to-left mark
      .replace(/\u202A/g, '') // Remove left-to-right embedding
      .replace(/\u202B/g, '') // Remove right-to-left embedding
      .replace(/\u202C/g, '') // Remove pop directional formatting
      .trim();
  }

  static validateFile(text: string): { isValid: boolean; errors: string[]; suggestions: string[] } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    if (!text || text.trim().length === 0) {
      errors.push('File is empty');
      return { isValid: false, errors, suggestions };
    }
    
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 5) {
      errors.push('File seems too short to be a WhatsApp export');
      suggestions.push('Make sure you exported the full chat history');
    }
    
    // Check if any line matches our patterns
    const hasValidMessages = lines.some(line => 
      this.PATTERNS.some(pattern => pattern.test(line))
    );
    
    if (!hasValidMessages) {
      errors.push('No valid WhatsApp message format detected');
      suggestions.push('Make sure you exported as "Without Media" from WhatsApp');
      suggestions.push('File should contain lines like: [DD/MM/YYYY, HH:MM:SS] Name: Message');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }
}

// Export for backward compatibility
export const parseWhatsAppFile = WhatsAppParser.parseFile.bind(WhatsAppParser);
export const filterMessagesBySender = WhatsAppParser.filterMessagesBySender.bind(WhatsAppParser); 