const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// CORS को एनेबल करें
app.use(cors());

// रूट रूट (Root Route) - जब कोई Backend URL ओपन करे
app.get('/', (req, res) => {
    res.send('Website is running!');
});

// YouTube वीडियो डाउनलोड एंडपॉइंट
app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    // URL वैलिडेशन
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        // वीडियो इन्फो प्राप्त करें
        const info = await ytdl.getInfo(videoURL);

        // वीडियो डाउनलोड करें
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

        // Send the appropriate headers for downloading the video
        res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
        res.header('Content-Type', 'video/mp4');  // Make sure the content type is video

        // Pipe the video stream to the response
        ytdl(videoURL, { format: format }).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error downloading video' });
    }
});

// सर्वर शुरू करें
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
