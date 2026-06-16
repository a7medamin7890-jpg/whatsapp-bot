// src/ai.js
// المسؤول عن توليد رد العميل باستخدام Claude، بناءً على تاريخ المحادثة معاه

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ⚠️ مهم جدًا: عدّل النص ده وحط معلومات بيزنسك الحقيقية
// (اسم المحل، المنتجات أو الخدمات، الأسعار، مواعيد العمل، سياسة الاستبدال...)
// كل ما المعلومات هنا أدق، كل ما رد البوت يكون أدق وأقل هلوسة
const SYSTEM_PROMPT = `
إنت موظف خدمة عملاء شاطر، بترد على رسايل واتساب باللهجة المصرية العامية الطبيعية، مش فصحى.

تعليمات:
- رد بشكل ودود ومحترم ومختصر، وما تطولش إلا لو العميل سأل سؤال محتاج تفصيل.
- لو معندكش معلومة مؤكدة عن سعر أو منتج أو حاجة معينة، قول للعميل إنك هتحول استفساره لحد من الفريق هيتواصل معاه، وما تأكدش معلومة إنت شاكك فيها.
- خليك مهذب حتى لو العميل كان متضايق أو بيشتكي، وحاول تهدي الجو.
- لو العميل سأل سؤال برا نطاق الشغل خالص، رجعه بلطف للموضوع.

معلومات البيزنس (عدّل القسم ده):
- اسم البيزنس: [اكتب اسم بيزنسك هنا]
- المنتجات/الخدمات: [اكتب تفاصيلها هنا]
- الأسعار: [اكتب الأسعار لو ثابتة]
- مواعيد العمل: [مثلاً: من 10 الصبح لـ 10 بالليل، كل يوم غير الجمعة]
- سياسة الاستبدال/الاسترجاع: [لو موجودة]
`.trim();

async function generateReply(history, newMessage) {
  const messages = [...history, { role: 'user', content: newMessage }];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock ? textBlock.text : 'حصل عندي مشكلة بسيطة، ممكن تبعت تاني؟';
}

module.exports = { generateReply };
