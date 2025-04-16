const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

// 🔐 তোমার OpenAI API Key এখানে বসাও
const OPENAI_API_KEY = "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";

app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userQuestion }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "কোন উত্তর পাওয়া যায়নি।";
    res.json({ answer: aiReply });
  } catch (error) {
    res.status(500).json({ error: 'AI সার্ভার থেকে উত্তর পাওয়া যায়নি।' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server চলছে http://localhost:${PORT}`);
});
