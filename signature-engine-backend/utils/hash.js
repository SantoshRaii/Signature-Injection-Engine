import crypto from "crypto";
import fs from "fs";

export function sha256FromFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
