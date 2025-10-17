// server.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON body

// 🔐 Firebase Key
if (!process.env.FIREBASE_KEY) {
  console.error("❌ FIREBASE_KEY environment variable is missing!");
  process.exit(1);
}

// Decode Base64 Firebase service account key
let serviceAccount;
try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_KEY, "base64").toString("utf8")
  );
  console.log("✅ FIREBASE_KEY decoded successfully");
} catch (err) {
  console.error("❌ Failed to decode FIREBASE_KEY:", err.message);
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://android-200e6-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.database();

// ---------------------- ROUTES ----------------------

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Firebase API is running 🚀" });
});

// Save data
app.post("/save", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ status: "error", message: "Name and email required" });
    }

    const ref = db.ref("users");
    await ref.push({ name, email, timestamp: Date.now() });

    res.json({ status: "success", message: "Data saved!" });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Optional: Fetch all users
app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.ref("users").once("value");
    res.json(snapshot.val() || {});
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🔥 Server started on port ${PORT}`));
