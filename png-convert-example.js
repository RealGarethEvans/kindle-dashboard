const { convert } = require('convert-svg-to-png');
const express = require('express');

const app = express();

app.post('/convert', async(req, res) => {
  const png = await convert(req.body);

  res.set('Content-Type', 'image/png');
  res.send(png);
});

app.listen(3000);