import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt, resolution = "720p", sampleCount = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const veoUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/veo-3.0-generate-preview:predictLongRunning?key=${apiKey}`;

    const response = await fetch(veoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { resolution, sampleCount }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Google API Error",
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
