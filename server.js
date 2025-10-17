import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// Decode base64 environment variable
if (!process.env.FIREBASE_KEY) {
  console.error("❌ FIREBASE_KEY is missing!");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_KEY, "base64").toString("utf8")
  );
} catch (err) {
  console.error("❌ Failed to parse FIREBASE_KEY:", err);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://android-200e6-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.database();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Firebase API is running 🚀" });
});

// Save data route
app.post("/save", async (req, res) => {
  try {
    const { name } = req.body;
    await db.ref("test").push({ name, time: Date.now() });
    res.json({ status: "success", message: "Data saved!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server started on port ${PORT}`));
