const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://android-200e6-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

// 🧠 Test route
app.get("/", (req, res) => {
  res.json({ message: "Firebase API is running 🚀" });
});

// ✅ Save data
app.post("/save", async (req, res) => {
  try {
    const { userId, data } = req.body;
    if (!userId || !data) return res.status(400).json({ error: "Missing userId or data" });

    await db.ref(`users/${userId}`).set(data);
    res.json({ status: "success", saved: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📥 Get data
app.get("/get/:userId", async (req, res) => {
  try {
    const snapshot = await db.ref(`users/${req.params.userId}`).once("value");
    res.json(snapshot.val() || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔄 Update data
app.post("/update", async (req, res) => {
  try {
    const { userId, data } = req.body;
    await db.ref(`users/${userId}`).update(data);
    res.json({ status: "updated", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
