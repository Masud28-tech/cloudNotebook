const connectToMongo = require('./db');
const express = require('express');

connectToMongo();
const app = express();
const port = 5000;

app.use(express.json())

// AWAILABLE ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// app.get('/', (req, res) => {
//     res.send("hello world!!!")
// })

app.listen(port, ()=>{
    console.log(`App is listening at http://localhost${port}`);
})