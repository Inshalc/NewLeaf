const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory data store
let users = [];

// Create or update a user profile
app.post('/api/profile', (req, res) => {
  const { name, fromCountry, city, interests } = req.body;

  if (!name || !city) return res.status(400).json({ error: 'Missing required fields' });

  const user = {
    id: Date.now().toString(),
    name,
    fromCountry,
    city,
    interests,
  };

  users.push(user);
  res.json(user);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Find matching buddies
app.get('/api/find-buddy/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const matches = users.filter(
    u =>
      u.id !== user.id &&
      u.city === user.city &&
      u.interests.some(i => user.interests.includes(i))
  );

  res.json(matches);
});

// Start server
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));