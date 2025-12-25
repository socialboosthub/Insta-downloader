const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* ======================================================
   API ROUTE (INSTAGRAM DATA FETCH)
   Frontend stays EXACTLY the same
====================================================== */
app.get("/api", async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ error: "No URL provided" });
        }

        const response = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify({
                url: url,
                vCodec: "h264",
                vQuality: "720",
                aFormat: "mp3",
                isAudioOnly: false
            })
        });

        const data = await response.json();

        // Convert response to TikTok-style structure
        const result = {
            data: {
                play: data.url || null,       // video
                music: data.audio || null,    // mp3
                images: data.pictures || []   // images / carousel
            }
        };

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Instagram API failed" });
    }
});

/* ======================================================
   VIDEO DOWNLOAD
====================================================== */
app.get("/download", async (req, res) => {
    try {
        const videoUrl = req.query.url;
        const fileName = req.query.name || "instagram_video";

        if (!videoUrl) return res.status(400).send("Missing video URL");

        const response = await fetch(videoUrl);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}.mp4"`
        );
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Cache-Control", "no-store");

        response.body.pipe(res);
    } catch (err) {
        res.status(500).send("Video download failed");
    }
});

/* ======================================================
   MP3 DOWNLOAD
====================================================== */
app.get("/mp3", async (req, res) => {
    try {
        const audioUrl = req.query.url;
        const fileName = req.query.name || "instagram_audio";

        if (!audioUrl) return res.status(400).send("Missing audio URL");

        const response = await fetch(audioUrl);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}.mp3"`
        );
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "no-store");

        response.body.pipe(res);
    } catch (err) {
        res.status(500).send("Audio download failed");
    }
});

/* ======================================================
   IMAGE DOWNLOAD
====================================================== */
app.get("/image", async (req, res) => {
    try {
        const imageUrl = req.query.url;
        const fileName = req.query.name;

        if (!imageUrl || !fileName) {
            return res.status(400).send("Missing image url or filename");
        }

        const response = await fetch(imageUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Cache-Control", "no-store");

        response.body.pipe(res);
    } catch (err) {
        res.status(500).send("Image download failed");
    }
});

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Instagram Downloader running on http://localhost:${PORT}`);
});
