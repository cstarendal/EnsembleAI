import dotenv from "dotenv";
import { createApp } from "./app.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory (works in both src/ and dist/)
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Log for debugging (remove in production)
if (!process.env.OPENROUTER_API_KEY) {
  console.warn(`[WARN] OPENROUTER_API_KEY not found. Checked: ${envPath}`);
} else {
  console.log(
    `[INFO] OPENROUTER_API_KEY found: ${process.env.OPENROUTER_API_KEY?.substring(0, 15)}...`
  );
}

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
