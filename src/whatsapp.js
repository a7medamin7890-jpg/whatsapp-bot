// src/whatsapp.js
// المسؤول عن إرسال الرسائل للعميل عن طريق WhatsApp Cloud API (ميتا مباشرة، بدون Twilio)

const axios = require('axios');

const META_API_VERSION = 'v21.0';

async function sendWhatsAppMessage(toPhoneNumber, text) {
  const url = `https://graph.facebook.com/${META_API_VERSION}/${process.env.META_PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      to: toPhoneNumber,
      type: 'text',
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

module.exports = { sendWhatsAppMessage };
