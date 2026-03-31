const { PDFParse } = require('pdf-parse');
console.log('PDFParse:', PDFParse);
const parser = new PDFParse({ data: Buffer.from('%PDF-1.5') });
console.log('Parser instance created');
parser.getText().then(res => console.log('Text Result:', res)).catch(err => console.error('Parse Error:', err));
