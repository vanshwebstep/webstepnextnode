const { pool } = require("../DB/db");

async function saveChatMessage(data) {
  try {
    const { session_id, user_message, ai_reply, detected_name, detected_email, detected_phone } = data;
    
    const [result] = await pool.query(
      `INSERT INTO chat_leads 
        (session_id, user_message, ai_reply, detected_name, detected_email, detected_phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [session_id, user_message, ai_reply, detected_name || null, detected_email || null, detected_phone || null]
    );
    
    console.log("✅ Chat saved! ID:", result.insertId);
    return result;
    
  } catch (err) {
    console.error("❌ Save error:", err.message);
  }
}

async function getAllLeads() {
  const [rows] = await pool.query(
    `SELECT * FROM chat_leads ORDER BY created_at DESC`
  );
  return rows;
}

module.exports = { saveChatMessage, getAllLeads };