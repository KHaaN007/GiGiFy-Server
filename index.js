const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


/**Midelware**/
app.use(cors());
app.use(express.json());







app.get('/', (req, res) => {
    res.send('Server Is Running For Full Stack Website Marketplace')
})



app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})