import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { endpoint, body } = req.body;

    if (!endpoint || !body) {
      return res.status(400).json({ error: "Missing endpoint or body" });
    }

    const auth = new GoogleAuth({
      credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Vertex API error", details: data });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
