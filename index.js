const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


/**Midelware**/
app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2jxlghj.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection



        /**Add Job DataBase For Adding Data From Add Data**/
        const jobCollection = client.db("jobsDB").collection("job")



        /**Create Or Post Data (*-Job-* Data)**/
        app.post('/job', async (req, res) => {
            // delete req.body._id
            const newjob = req.body;
            const result = await jobCollection.insertOne(newjob)
            res.send(result)
        })

        /**Get All *-Jobs-* Data From DataBase**/
        app.get('/jobs', async (req, res) => {
            const jobs = jobCollection.find();
            const result = await jobs.toArray()
            res.send(result)
        })


        app.get('/jobDetail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.findOne(query)
            res.send(result)
        })











        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Server Is Running For Full Stack Website Marketplace')
})



app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})