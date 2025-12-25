import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { PDFDocument } from "pdf-lib";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { sha256FromFile } from "./utils/hash.js";
import Audit from "./models/Audit.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.post("/sign-pdf", async (req, res) => {
  try {
    const { pdfId, signature, coords } = req.body;

    // 1️⃣ Load original PDF
    const pdfPath = path.join(__dirname, "public", pdfId);

    const hashBefore = sha256FromFile(pdfPath);
    const existingPdfBytes = fs.readFileSync(pdfPath);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2️⃣ Embed signature image
    const base64Data = signature.split(",")[1];
    const imageBytes = Buffer.from(base64Data, "base64");

    const signatureImage = await pdfDoc.embedPng(imageBytes);

    // 3️⃣ Draw image on first page
    const page = pdfDoc.getPages()[0];

    page.drawImage(signatureImage, {
      x: coords.x,
      y: coords.y,
      width: coords.width,
      height: coords.height,
    });

    // 4️⃣ Save signed PDF
    const signedPdfBytes = await pdfDoc.save();

    const signedDir = path.join(__dirname, "uploads", "signed");

    if (!fs.existsSync(signedDir)) {
    fs.mkdirSync(signedDir, { recursive: true });
    }

    const outputPath = path.join(
    signedDir,
    `signed-${Date.now()}.pdf`
    );

    fs.writeFileSync(outputPath, signedPdfBytes);

    const hashAfter = sha256FromFile(outputPath);

    await Audit.create({
        pdfId,
        hashBefore,
        hashAfter,
        signedPdfPath: outputPath,
    });

    res.json({
      success: true,
        url: `/uploads/signed/${path.basename(outputPath)}`,
        hashBefore,
        hashAfter,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign PDF" });
  }
});

app.use("/uploads", express.static("uploads"));
app.use("/public", express.static("public"));

app.listen(process.env.PORT || 4000, () =>
  console.log("Backend running on http://localhost:4000")
);
