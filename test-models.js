const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;

async function check() {
  try {
    const list = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey)
    const json = await list.json()
    if (json.models) {
      json.models.forEach(m => console.log(m.name));
    } else {
      console.log(json);
    }
  } catch (e) {
    console.error(e);
  }
}
check();
