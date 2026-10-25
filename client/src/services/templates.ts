export interface MessageTemplate {
  id: string;
  category: 'birthday' | 'hr_salary' | 'meeting' | 'payment' | 'followup';
  title: string;
  language: 'en' | 'es' | 'hi' | 'ur' | 'ar' | 'fr' | 'de';
  text: string;
}

export const OCCASION_TEMPLATES: MessageTemplate[] = [
  // --- BIRTHDAYS ---
  {
    id: 'bday-en-warm',
    category: 'birthday',
    title: 'Warm Birthday Wishes (English)',
    language: 'en',
    text: 'Wishing you a very Happy Birthday! 🎉🎂 May your year ahead be filled with happiness, health, and great success. Have a wonderful celebration!',
  },
  {
    id: 'bday-en-prof',
    category: 'birthday',
    title: 'Professional Birthday (English)',
    language: 'en',
    text: 'Dear {Name}, on behalf of the entire team, wishing you a very Happy Birthday! 🎈 We appreciate all your hard work and wish you continued growth and prosperity in the coming year.',
  },
  {
    id: 'bday-es-warm',
    category: 'birthday',
    title: 'Feliz Cumpleaños (Spanish)',
    language: 'es',
    text: '¡Te deseo un muy feliz cumpleaños! 🎂🎉 Que este nuevo año de vida te traiga mucha salud, felicidad y grandes éxitos. ¡Que tengas un día maravilloso!',
  },
  {
    id: 'bday-hi-warm',
    category: 'birthday',
    title: 'जन्मदिन की हार्दिक शुभकामनाएँ (Hindi)',
    language: 'hi',
    text: 'आपको जन्मदिन की बहुत-बहुत शुभकामनाएँ! 🎂🎉 ईश्वर आपको उत्तम स्वास्थ्य, दीर्घायु और अपार खुशियाँ प्रदान करे। आपका दिन शुभ हो!',
  },
  {
    id: 'bday-ur-warm',
    category: 'birthday',
    title: 'سالگرہ مبارک (Urdu)',
    language: 'ur',
    text: 'آپ کو سالگرہ بہت بہت مبارک ہو! 🎂🎉 دعا ہے کہ آنے والا سال آپ کے لیے خوشیوں، صحت اور بے شمار کامیابیوں کا سال ثابت ہو۔',
  },
  {
    id: 'bday-ar-warm',
    category: 'birthday',
    title: 'عيد ميلاد سعيد (Arabic)',
    language: 'ar',
    text: 'أتمنى لك عيد ميلاد سعيد! 🎉🎂 جعل الله عامك الجديد مليئاً بالصحة، السعادة والنجاح والتوفيق الدائم.',
  },
  {
    id: 'bday-fr-warm',
    category: 'birthday',
    title: 'Joyeux Anniversaire (French)',
    language: 'fr',
    text: 'Je te souhaite un très joyeux anniversaire ! 🎂🎉 Que cette nouvelle année t\'apporte santé, bonheur et beaucoup de succès.',
  },
  {
    id: 'bday-de-warm',
    category: 'birthday',
    title: 'Herzlichen Glückwunsch (German)',
    language: 'de',
    text: 'Herzlichen Glückwunsch zum Geburtstag! 🎂🎉 Ich wünsche dir für das neue Lebensjahr viel Gesundheit, Glück und Erfolg.',
  },

  // --- HR & SALARY INQUIRIES ---
  {
    id: 'hr-salary-polite',
    category: 'hr_salary',
    title: 'Polite Salary Slip & Transfer Follow-Up',
    language: 'en',
    text: 'Hello, I hope you are having a productive week. I am writing to kindly check on the status of my salary slip for this month. Please let me know if any further details are required from my side. Thank you!',
  },
  {
    id: 'hr-salary-ur',
    category: 'hr_salary',
    title: 'HR تنخواہ سلپ استفسار (Urdu)',
    language: 'ur',
    text: 'السلام علیکم، امید ہے آپ خیریت سے ہوں گے۔ برائے مہربانی اس ماہ کی تنخواہ کی سلپ اور ٹرانسفر کی صورتحال سے آگاہ فرما دیں۔ آپ کے تعاون کا شکریہ۔',
  },
  {
    id: 'hr-salary-hi',
    category: 'hr_salary',
    title: 'वेतन पर्ची अनुरोध (Hindi)',
    language: 'hi',
    text: 'नमस्ते, आशा है आप सकुशल हैं। कृपया इस महीने की वेतन पर्ची और विवरण की स्थिति की जानकारी देने की कृपा करें। आपके सहयोग हेतु धन्यवाद।',
  },

  // --- MEETING REMINDERS ---
  {
    id: 'meeting-friendly',
    category: 'meeting',
    title: 'Upcoming Meeting Check-in',
    language: 'en',
    text: 'Hi {Name}, just a gentle reminder about our upcoming meeting scheduled for tomorrow. Looking forward to connecting and discussing our agenda!',
  },

  // --- INVOICE & PAYMENT ---
  {
    id: 'payment-polite',
    category: 'payment',
    title: 'Polite Invoice Reminder',
    language: 'en',
    text: 'Dear {Name}, I hope this message finds you well. This is a courteous reminder regarding Invoice #{Number}, which was due recently. Please let me know if you need another copy of the invoice.',
  },

  // --- GENERAL FOLLOW-UP ---
  {
    id: 'followup-gentle',
    category: 'followup',
    title: 'Gentle Project Follow-Up',
    language: 'en',
    text: 'Hi {Name}, I wanted to quickly follow up on our previous conversation to see if you had a chance to review the details. Let me know if you have any questions!',
  },
];

// Smart Autofill dictionary
export const AUTOFILL_PHRASES = [
  'Wishing you a very Happy Birthday! 🎉',
  'I hope you are having a productive week.',
  'Just following up on our previous discussion.',
  'Please find the attached document for your review.',
  'Thank you for your time and assistance.',
  'Kindly let me know once you have a moment to review this.',
  'Gentle reminder regarding our scheduled appointment tomorrow.',
  'Looking forward to speaking with you soon.',
  'Please confirm receipt when convenient.',
];
