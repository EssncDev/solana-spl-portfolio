const { GetRedisData } = require('../redis/redis');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

// Body parsing middleware
app.use(express.json());
const redisClient = new GetRedisData();

app.get('/portfolio', (req,res) => {
    redisClient.getPortfolio()
        .then(data => res.json(data))
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});