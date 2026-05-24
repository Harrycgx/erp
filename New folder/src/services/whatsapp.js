export function sendWhatsAppMessage(phone, message) {
  return Promise.resolve({ phone, message, status: 'queued' });
}

export function formatWhatsAppNumber(phone) {
  return phone.replace(/[\s+()-]/g, '');
}
