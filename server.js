const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

// 🔐 OpenAI API Key
const OPENAI_API_KEY = "your-api-key-here"; // Replace with your actual API key

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 requests per windowMs
});
app.use(limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'সার্ভারে সমস্যা হয়েছে!' });
});

// API endpoint
app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;

  if (!userQuestion || typeof userQuestion !== 'string') {
    return res.status(400).json({ error: 'সঠিক প্রশ্ন প্রদান করুন' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ 
          role: 'system', 
          content: 'আপনি একজন সহায়ক এআই। বাংলায় স্পষ্ট এবং সঠিক উত্তর দিন।'
        }, { 
          role: 'user', 
          content: userQuestion 
        }],
        temperature: 0.7,
        max_tokens: 1000
      }),
      timeout: 15000 // 15 seconds timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "কোন উত্তর পাওয়া যায়নি।";
    res.json({ answer: aiReply });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'এআই সার্ভার থেকে উত্তর পাওয়া যায়নি।',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ সার্ভার চলছে http://localhost:${PORT}`);
});
