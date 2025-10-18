// server.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

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

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "Firebase Dynamic API is running 🚀" });
});

// ✅ Save ANY data (auto-detect JSON type)
app.post("/save", async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No data provided in request body",
      });
    }

    // Push data dynamically with unique ID
    const ref = db.ref("data").push();
    const payload = {
      id: ref.key,
      type: typeof data,
      content: data,
      timestamp: Date.now(),
    };

    await ref.set(payload);

    res.json({
      status: "success",
      message: "Data saved dynamically!",
      id: ref.key,
    });
  } catch (err) {
    console.error("❌ Error saving data:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Fetch specific data by ID
app.get("/fetch/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const snapshot = await db.ref(`data/${id}`).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ status: "error", message: "Data not found" });
    }

    res.json({ status: "success", data: snapshot.val() });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Update data by ID (merge with existing)
app.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const newData = req.body;

    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ status: "error", message: "No data provided" });
    }

    const ref = db.ref(`data/${id}`);
    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ status: "error", message: "Data not found" });
    }

    await ref.update({
      content: newData,
      updatedAt: Date.now(),
    });

    res.json({ status: "success", message: "Data updated dynamically!" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Delete specific data by ID
app.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ref = db.ref(`data/${id}`);
    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ status: "error", message: "Data not found" });
    }

    await ref.remove();
    res.json({ status: "success", message: "Data deleted successfully!" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🔥 Dynamic Server started on port ${PORT}`));

