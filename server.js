const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Music folder setup
const musicFolder = path.join(__dirname, 'music');
if (!fs.existsSync(musicFolder)) {
    fs.mkdirSync(musicFolder);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, musicFolder),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/mpeg') {
            cb(null, true);
        } else {
            cb(new Error('Only .mp3 files are allowed!'), false);
        }
    },
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.js'));
});

app.get('/music', (req, res) => {
    fs.readdir(musicFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read music directory' });
        }
        const musicFiles = files.filter(file => file.endsWith('.mp3')).map(file => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/music/${file}`,
        }));
        res.json(musicFiles);
    });
});

app.get('/music/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(musicFolder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: `File '${filename}' not found.` });
    }

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size,
    });
    fs.createReadStream(filePath).pipe(res);
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
});

app.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(musicFolder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }
    res.download(filePath);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
