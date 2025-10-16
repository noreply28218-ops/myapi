const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.json({ message: "API is running!" });
});

// Example data storage route (in-memory)
const users = {};
app.post('/data/:userId', (req, res) => {
  users[req.params.userId] = req.body;
  res.json({ status: "saved" });
});

app.get('/data/:userId', (req, res) => {
  res.json(users[req.params.userId] || {});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
