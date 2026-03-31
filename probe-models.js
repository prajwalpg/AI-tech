const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Read .env manualy
let apiKey = "";
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (match) apiKey = match[1].trim();
} catch(e) {}

const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  try {
     // We can't actually call listModels from this high-level SDK easily 
     // without an authenticated admin client.
     // But we can test very specific names.
     const candidates = [
       'gemini-1.5-flash-latest', 
       'gemini-1.5-flash', 
       'gemini-1.5-pro-latest',
       'gemini-1.0-pro',
       'gemini-pro'
     ];
     for (const m of candidates) {
       try {
         const model = genAI.getGenerativeModel({ model: m });
         await model.generateContent("test");
         console.log(`✅ SUCCESS: ${m}`);
       } catch (e) {
         console.log(`❌ FAIL: ${m} - ${e.message}`);
       }
     }
  } catch (e) {
    console.error("List failed", e);
  }
}

list();
