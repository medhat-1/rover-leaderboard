const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));
app.use(express.json());

let scores = JSON.parse(fs.readFileSync('./scores.json'));
let codes = JSON.parse(fs.readFileSync('./codes.json'));

// WebSocket connection
io.on('connection', (socket) => {
  socket.emit('score-update', scores);
});

app.get('/submit', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/submit.html'));
});

// Score submission
app.post('/submit-code', (req, res) => {
  const { team, code } = req.body;
  const points = codes[code];

  // Debugging
  // console.log("Submitted team:", team);
  // console.log("Submitted code:", code);
  // console.log("Available teams:", Object.keys(scores));
  // console.log("Available codes:", Object.keys(codes));


  if (!points || !scores[team]) {
    return res.status(400).send('Invalid team or code.');
  }

  scores[team] += points;
  delete codes[code];

  fs.writeFileSync('./scores.json', JSON.stringify(scores, null, 2));
  fs.writeFileSync('./codes.json', JSON.stringify(codes, null, 2));

  io.emit('score-update', scores);
  res.send('Score updated!');
});

http.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

