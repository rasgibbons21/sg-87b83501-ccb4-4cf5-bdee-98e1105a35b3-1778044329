import type { NextApiRequest, NextApiResponse } from "next";
import QRCode from "qrcode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, size = "180" } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const qrSvg = await QRCode.toString(url, {
      type: "svg",
      width: parseInt(size as string),
      color: {
        dark: "#2D4A3E",
        light: "#FFFFFF"
      }
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(qrSvg);
  } catch (error) {
    console.error("QR code generation error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
}