import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  pdfId: String,
  hashBefore: String,
  hashAfter: String,
  signedPdfPath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Audit", auditSchema);
