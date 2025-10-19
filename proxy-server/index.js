// proxy-server/index.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// API Endpoint to handle requests
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, documents } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Combine documents content into a single string for context
    const context = documents.map(doc => doc.content).join('\\n\\n---\\n\\n');
    const fullPrompt = `${prompt}\\n\\nContext from documents:\\n${context}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    res.json({ generatedText: text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content from AI' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
