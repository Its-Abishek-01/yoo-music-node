// Server Code
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

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

const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, musicFolder),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type! Supported formats: MP3, WAV, FLAC, AAC, OGG.'), false);
        }
    },
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

    const inputFilePath = path.join(musicFolder, req.file.filename);
    const outputFilePath = inputFilePath.replace(path.extname(req.file.filename), '.mp3');

    if (req.file.mimetype !== 'audio/mpeg') {
        ffmpeg(inputFilePath)
            .toFormat('mp3')
            .save(outputFilePath)
            .on('end', () => {
                fs.unlinkSync(inputFilePath); // Delete the original file
                res.status(200).json({ message: 'File uploaded and converted to MP3 successfully', filename: path.basename(outputFilePath) });
            })
            .on('error', (err) => {
                res.status(500).json({ message: 'Error during file conversion', error: err.message });
            });
    } else {
        res.status(200).json({ message: 'File uploaded successfully', filename: req.file.filename });
    }
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

// Ping the server every 2 minutes to keep it alive
// Function to ping the server at random intervals (max 3 minutes)
const pingServer = () => {
    const interval = Math.floor(Math.random() * 180000) + 1; // Random interval between 1ms and 3 minutes
    console.log(`Next ping in ${Math.round(interval / 1000)} seconds`);
    setTimeout(async () => {
        try {
            await axios.get(`http://localhost:${port}`);
            console.log('Self-ping successful');
        } catch (err) {
            console.error('Error in self-ping:', err.message);
        }
        pingServer(); // Schedule the next ping
    }, interval);
};

// Start the random ping loop
pingServer();



// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
