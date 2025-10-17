import express from "express";
import cors from "cors";       // <-- add this
import admin from "firebase-admin";

const app = express();

app.use(cors());             // <-- allow all origins
app.use(express.json());

// Decode Firebase Key (same as before)
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_KEY, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://android-200e6-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.database();

// Routes
app.get("/", (req, res) => res.json({ message: "Firebase API is running 🚀" }));

app.post("/save", async (req, res) => {
  try {
    const { name, email } = req.body;
    await db.ref("users").push({ name, email, time: Date.now() });
    res.json({ status: "success", message: "Data saved!" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server started on port ${PORT}`));

