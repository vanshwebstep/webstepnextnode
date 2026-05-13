const { saveChatMessage } = require("../models/chatModel");
require("dotenv").config();

const SYSTEM_PROMPT = `You are a friendly and professional AI assistant for WebStep Solutions, a web development and digital marketing agency based in India.

Your job is to:
- Answer questions about WebStep's services: website development, SEO, digital marketing, mobile apps, e-commerce solutions, UI/UX design
- Help visitors understand pricing, timelines, and packages
- Collect basic lead info (name, business type, requirements) naturally in conversation
- Be warm, helpful, and concise — like a knowledgeable sales executive
- Respond in the same language the user is using (English or Hinglish)
- If someone asks for a quote or wants to talk to a human, guide them to call: 97818-90033 or visit /customize-package

Keep responses short (2-4 sentences max) unless detailed explanation is needed.
Never make up pricing — say "our team will provide a custom quote based on your needs."`;

function extractLeadInfo(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+91[\-\s]?)?[6-9]\d{9}/);
  const nameMatch = text.match(/(?:my name is|i am|mera naam|mai hun)\s+([a-zA-Z\s]{2,30})/i);

  return {
    detected_email: emailMatch ? emailMatch[0] : null,
    detected_phone: phoneMatch ? phoneMatch[0] : null,
    detected_name: nameMatch ? nameMatch[1].trim() : null,
  };
}

async function handleChat(req, res) {
  try {
    const { messages, session_id } = req.body;

    console.log("✅ 1. API hit hua!");
    console.log("✅ 2. Messages:", messages?.length);

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    const formattedMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    // Groq API call
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...formattedMessages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("✅ 3. Groq status:", response.status);

    if (data.error) throw new Error(data.error.message);

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that. Please try again!";

    console.log("✅ 4. Reply:", reply);

    // Last user message nikalo
    const lastUserMsg = messages.filter((m) => m.role === "user").pop();
    const leadInfo = extractLeadInfo(lastUserMsg?.content || "");

    console.log("✅ 5. Lead info:", leadInfo);

    // MySQL mein save karo
    await saveChatMessage({
      session_id: session_id || "anonymous",
      user_message: lastUserMsg?.content || "",
      ai_reply: reply,
      ...leadInfo,
    });

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("❌ Chat Error:", error.message);
    return res.status(500).json({
      reply: "Sorry, something went wrong. Please call us at 97818-90033!",
    });
  }
}

module.exports = { handleChat };