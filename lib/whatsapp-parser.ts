// WhatsApp chat file parser
// Supports multiple WhatsApp export formats

export interface WhatsAppMessage {
  sender: string;
  content: string;
  timestamp: string;
}

export function parseWhatsAppFile(text: string, selectedPerson: string): WhatsAppMessage[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  // Multiple patterns to handle different WhatsApp export formats
  const patterns = [
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\s?([AP]?M?)\]\s*([^:]+):\s*(.+)$/,
    /^\[(\d{1,2}\/\d{1,2}\/\d{2}), (\d{1,2}:\d{2}:\d{2})\s([AP]M)\]\s*([^:]+):\s*(.+)$/,
    /^(\d{1,2}\/\d{1,2}\/\d{4}), (\d{1,2}:\d{2})\s?-\s*([^:]+):\s*(.+)$/,
    /^\[(\d{1,2}\.\d{1,2}\.\d{2,4}), (\d{1,2}:\d{2}:\d{2})\]\s*([^:]+):\s*(.+)$/
  ];
  
  const systemMessages = [
    '<Media omitted>', 'image omitted', 'video omitted', 'audio omitted',
    'Messages and calls are end-to-end encrypted', 'This message was deleted',
    'document omitted', 'GIF omitted', 'sticker omitted'
  ];
  
  const messages: WhatsAppMessage[] = [];
  let successCount = 0;
  const totalLines = lines.length;
  
  lines.forEach(line => {
    let match = null;
    
    // Try each pattern
    for (const pattern of patterns) {
      match = line.match(pattern);
      if (match) break;
    }
    
    if (match) {
      // Extract sender and content (position varies by pattern)
      let sender, content;
      if (match.length === 6) { // [date, time, period?, sender, content]
        sender = match[4];
        content = match[5];
      } else if (match.length === 5) { // [date, time, sender, content]
        sender = match[3];
        content = match[4];
      }
      
      if (sender && content) {
        const cleanSender = sender.trim();
        const cleanContent = content.trim();
        
        // Skip system messages
        const isSystemMessage = systemMessages.some(sysMsg => 
          cleanContent.toLowerCase().includes(sysMsg.toLowerCase())
        );
        
        // Only keep messages from the selected person (excluding system messages)
        if (cleanSender === selectedPerson && !isSystemMessage && cleanContent.length > 3) {
          messages.push({
            sender: cleanSender,
            content: cleanContent,
            timestamp: line.substring(1, line.indexOf(']')) || `${match[1]}, ${match[2]}`
          });
          successCount++;
        }
      }
    }
  });
  
  console.log(`📊 Parsing stats: ${successCount}/${totalLines} lines parsed for ${selectedPerson}`);
  return messages;
} 