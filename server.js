const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer'); // Middleware for handling file uploads

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable if available

// Enable CORS
app.use(cors());

// Setup file storage using multer
const musicFolder = path.join(__dirname, 'music');
if (!fs.existsSync(musicFolder)) {
    fs.mkdirSync(musicFolder); // Create the music folder if it doesn't exist
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, musicFolder);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique name
    },
});
const upload = multer({ storage });

// Get list of all music files
app.get('/music', (req, res) => {
    fs.readdir(musicFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read music directory' });
        }
        const musicFiles = files.filter(file => file.endsWith('.mp3'));
        res.json(musicFiles);
    });
});

// Stream music file
app.get('/music/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(musicFolder, filename);

    if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size,
        });
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// Upload music file
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Download music file
app.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(musicFolder, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
