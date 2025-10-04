require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { convertGPA, convertMedical } = require('./conversion');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: "*", // Allow all origins for now
  credentials: true
}));

// Ensure uploads folder exists
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Gemini API setup
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

if (!GOOGLE_API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in .env file");
  process.exit(1);
}

/* ================= Test Endpoint ================= */
app.get('/test', (req, res) => {
  console.log("✅ Test endpoint hit from:", req.headers.origin);
  res.json({ 
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    endpoints: ['/test', '/chat', '/upload', '/upload-base64', '/upload-text', '/convert']
  });
});

/* ================= Chat Endpoint ================= */
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Please ask a question." });

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from AI";
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "⚠️ AI request failed" });
  }
});

/* ================= Upload Endpoint (FormData) ================= */
app.post("/upload", upload.single("file"), (req, res) => {
  console.log("📥 Upload endpoint hit (FormData)");
  console.log("Headers:", req.headers['content-type']);
  console.log("File received:", req.file);

  if (!req.file) {
    console.log("❌ No file received by multer");
    return res.status(400).json({ 
      message: "No file uploaded - FormData issue",
      receivedBody: req.body
    });
  }

  console.log("✅ File uploaded successfully via FormData");

  res.json({
    message: "✅ File uploaded successfully",
    file: {
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    }
  });
});

/* ================= Base64 Upload Endpoint ================= */
app.post("/upload-base64", (req, res) => {
  console.log("📥 Base64 upload endpoint hit");
  
  const { filename, data, mimeType } = req.body;
  
  if (!data) {
    console.log("❌ No base64 data received");
    return res.status(400).json({ message: "No file data" });
  }

  try {
    const buffer = Buffer.from(data, 'base64');
    const safeFilename = filename || `upload_${Date.now()}.dat`;
    const filePath = path.join(uploadFolder, Date.now() + '-' + safeFilename);
    
    fs.writeFileSync(filePath, buffer);
    
    console.log("✅ File saved via base64:", filePath, "Size:", buffer.length);
    
    res.json({
      message: "✅ File uploaded successfully via base64",
      file: { 
        path: filePath, 
        name: safeFilename,
        size: buffer.length
      }
    });
  } catch (err) {
    console.error("❌ Base64 upload error:", err);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});
/* ================= Text Upload Endpoint ================= */
app.post("/upload-text", (req, res) => {
  console.log("📥 Text upload endpoint hit");
  console.log("Request body received:", {
    filename: req.body.filename,
    contentLength: req.body.content ? req.body.content.length : 'NO CONTENT',
    mimeType: req.body.mimeType
  });
  
  const { filename, content, mimeType } = req.body;
  
  // Check if content exists (even empty string should be allowed)
  if (content === undefined || content === null) {
    console.log("❌ No content received in request body");
    return res.status(400).json({ 
      message: "No file content received",
      receivedKeys: Object.keys(req.body)
    });
  }

  try {
    const safeFilename = filename || `upload_${Date.now()}.txt`;
    const filePath = path.join(uploadFolder, Date.now() + '-' + safeFilename);
    
    // Ensure content is treated as string
    const contentString = String(content);
    
    fs.writeFileSync(filePath, contentString, 'utf8');
    
    console.log("✅ Text file saved:", filePath, "Size:", contentString.length);
    
    res.json({
      message: "✅ File uploaded successfully as text",
      file: { 
        path: filePath, 
        name: safeFilename,
        size: contentString.length
      }
    });
  } catch (err) {
    console.error("❌ Text upload error:", err);
    res.status(500).json({ 
      message: "Upload failed: " + err.message,
      error: err.stack 
    });
  }
});
/* ================= Convert Endpoint ================= */
app.post("/convert", (req, res) => {
  const { type, filePath } = req.body;

  if (!filePath || !type) {
    return res.status(400).json({ message: "Missing file path or type" });
  }

  try {
    // Read uploaded file as text
    const content = fs.readFileSync(filePath, "utf-8");
    let converted;

    if (type === "gpa") converted = convertGPA(content);
    else if (type === "medical") converted = convertMedical(content);
    else return res.status(400).json({ message: "Unknown conversion type" });

    res.json({ original: content, converted });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ message: "Error during conversion" });
  }
});

/* ================= Server ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`✅ Also accessible via your local IP`);
  console.log("Endpoints available: /test, /chat, /upload, /upload-base64, /upload-text, /convert");
});