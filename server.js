import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

if (!process.env.FIREBASE_KEY) {
  console.error("❌ FIREBASE_KEY not found");
  process.exit(1);
}

let serviceAccount;
try {
  const decoded = Buffer.from(process.env.FIREBASE_KEY, "base64").toString("utf8");
  serviceAccount = JSON.parse(decoded);
  console.log("✅ FIREBASE_KEY decoded successfully");
} catch (err) {
  console.error("❌ Failed to parse FIREBASE_KEY:", err);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://android-200e6-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

app.get("/", (req, res) => res.json({ message: "Firebase API is running 🚀" }));

app.post("/save", async (req, res) => {
  try {
    const { name } = req.body;
    await db.ref("test").push({ name, time: Date.now() });
    res.json({ status: "success", message: "Data saved!" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server started on port ${PORT}`));
