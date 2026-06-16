// src/db.js
// قاعدة بيانات SQLite بسيطة - بتحفظ كل رسالة (من العميل أو من البوت) مرتبطة برقم تليفونه
// SQLite كافي جدًا لحجم 100 عميل وأكتر، وميحتاجش سيرفر قاعدة بيانات منفصل

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'conversations.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_phone_number ON conversations(phone_number);
`);

// بيحفظ رسالة جديدة (role بتكون 'user' لو من العميل أو 'assistant' لو من البوت)
function saveMessage(phoneNumber, role, message) {
  const stmt = db.prepare(
    'INSERT INTO conversations (phone_number, role, message) VALUES (?, ?, ?)'
  );
  stmt.run(phoneNumber, role, message);
}

// بيرجع آخر N رسالة لعميل معين، بالترتيب الزمني الصحيح، جاهزة للاستخدام مع Claude
function getHistory(phoneNumber, limit = 20) {
  const stmt = db.prepare(
    `SELECT role, message FROM conversations
     WHERE phone_number = ?
     ORDER BY id DESC
     LIMIT ?`
  );
  const rows = stmt.all(phoneNumber, limit);
  return rows.reverse().map((row) => ({
    role: row.role,
    content: row.message,
  }));
}

module.exports = { saveMessage, getHistory };
