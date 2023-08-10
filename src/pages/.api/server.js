const express = require('express');
const appRoute = require('./routes/route.js');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

/** routes */
app.use('/api', appRoute);

app.listen(5001, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
