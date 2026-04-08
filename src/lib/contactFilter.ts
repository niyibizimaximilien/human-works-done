// Detects phone numbers, emails, social handles in messages
const CONTACT_PATTERNS = [
  /\b[\w.+-]+@[\w-]+\.[\w.]+\b/i,                    // email
  /\b(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/, // phone
  /(?:whatsapp|telegram|signal|viber|snapchat|instagram|ig|tiktok|twitter|x\.com|facebook|fb)\s*[:\-@]?\s*\S+/i, // social
  /(?:wa\.me|t\.me|bit\.ly|linktr\.ee)\S*/i,          // short links
  /\b0\d{9,10}\b/,                                     // local phone
];

export function containsContactInfo(text: string): boolean {
  return CONTACT_PATTERNS.some(pattern => pattern.test(text));
}

export function sanitizeMessage(text: string): string {
  let sanitized = text;
  CONTACT_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[contact removed]');
  });
  return sanitized;
}

export function formatRWF(amount: number | string | null): string {
  if (amount === null || amount === undefined) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return `RWF ${num.toLocaleString()}`;
}
