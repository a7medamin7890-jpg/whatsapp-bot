// server.js
// السيرفر الرئيسي: بيستقبل رسائل العملاء من واتساب، بيولّد رد بالذكاء الاصطناعي، وبيرد عليهم

require('dotenv').config();
const express = require('express');
const { saveMessage, getHistory } = require('./src/db');
const { generateReply } = require('./src/ai');
const { sendWhatsAppMessage } = require('./src/whatsapp');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

// 1) التحقق من الـ Webhook - ميتا بتطلب ده مرة واحدة وقت ربط الرابط في لوحة التحكم
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2) استقبال رسائل العملاء الجديدة
app.post('/webhook', (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') return;

    const fromNumber = message.from;
    const userText = message.text.body;

    handleIncomingMessage(fromNumber, userText);
  } catch (err) {
    console.error('خطأ في استقبال الرسالة:', err);
  }
});

async function handleIncomingMessage(fromNumber, userText) {
  try {
    const history = getHistory(fromNumber, 20);
    const replyText = await generateReply(history, userText);

    saveMessage(fromNumber, 'user', userText);
    saveMessage(fromNumber, 'assistant', replyText);

    await sendWhatsAppMessage(fromNumber, replyText);
  } catch (err) {
    console.error(
      `فشل الرد على ${fromNumber}:`,
      err.response?.data || err.message
    );
  }
}

app.listen(PORT, () => {
  console.log(`السيرفر شغال على المنفذ ${PORT}`);
});
