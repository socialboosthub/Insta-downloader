const express = require("express");
const fetch = require("node-fetch");

const app = express();

/*
|--------------------------------------------------------------------------
| API: Fetch Instagram data
|--------------------------------------------------------------------------
| Works for:
| - Reels
| - Posts
| - Videos
*/
app.get("/api", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // Instagram scraper API
    const apiUrl = `https://igram.world/api/ig/media?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 13; Mobile Safari)",
        "Accept": "application/json"
      }
    });

    const json = await response.json();

    if (!json || json.error) {
      return res.status(500).json({ error: "Failed to fetch Instagram data" });
    }

    res.json(json);
  } catch (error) {
    res.status(500).json({ error: "Instagram API failed" });
  }
});

/*
|--------------------------------------------------------------------------
| MP3 (Audio)
|--------------------------------------------------------------------------
*/
app.get("/mp3", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("No audio URL");

    const response = await fetch(url);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.query.name || "instagram-audio"}.mp3"`
    );

    response.body.pipe(res);
  } catch {
    res.status(500).send("Audio download failed");
  }
});

/*
|--------------------------------------------------------------------------
| VIDEO
|--------------------------------------------------------------------------
*/
app.get("/download", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("No video URL");

    const response = await fetch(url);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.query.name || "instagram-video"}.mp4"`
    );

    response.body.pipe(res);
  } catch {
    res.status(500).send("Video download failed");
  }
});

/*
|--------------------------------------------------------------------------
| IMAGE
|--------------------------------------------------------------------------
*/
app.get("/image", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("No image URL");

    const response = await fetch(url);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.query.name || "instagram-image"}.jpg"`
    );

    response.body.pipe(res);
  } catch {
    res.status(500).send("Image download failed");
  }
});

module.exports = app;
