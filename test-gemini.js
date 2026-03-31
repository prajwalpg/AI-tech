const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Read .env manualy since I might not have dotenv lib installed as a peer
let apiKey = "";
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (match) apiKey = match[1].trim();
} catch(e) {}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hello");
      console.log(`${m} works`);
    } catch (e) {
      console.log(`${m} fails: ${e.message}`);
    }
  }
}

test();
