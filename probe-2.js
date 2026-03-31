const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

let apiKey = "";
try {
  const envText = fs.readFileSync('.env', 'utf-8');
  apiKey = envText.match(/GEMINI_API_KEY=["']?(.*?)["']?(\s|$)/)?.[1] || "";
} catch(e) {}

console.log("Testing with prefix:", apiKey.substring(0, 10));

const genAI = new GoogleGenerativeAI(apiKey);

async function check() {
  const m = "gemini-1.5-flash-latest";
  try {
    const model = genAI.getGenerativeModel({ model: m });
    const r = await model.generateContent("hi");
    console.log(`✅ ${m} WORKS`);
  } catch(e) {
    console.log(`❌ ${m} FAILS: ${e.message}`);
  }
}
check();
