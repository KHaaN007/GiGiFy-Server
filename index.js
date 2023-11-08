const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


/**Midelware**/
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())





/**JWT Token**/
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    console.log('Token in the middleware', token);
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        console.log(err);
        if (err) {
            console.log(decoded);
            return res.status(401).send({ message: 'Unauthorized' })
        }
        req.user = decoded;

        next()
    })
}







// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const bidCollection = client.db("bidsDB").collection("bid")






        // Auth Related Api 
        app.post('/jwt', async (req, res) => {
            const user = req.body
            // console.log('User For token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })

            // console.log('Create Token For Cookies', token);
            res
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                
            })
                .send({ token })
        })


        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res
                .clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true })
                .send({ success: true })
        })








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

        /**Get Specific Data For Job Detail Page**/
        app.get('/jobDetail/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.findOne(query)
            res.send(result)
        })


        /**Deleted My Post Job From DataBase**/
        app.delete('/postedJob/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.deleteOne(query)
            res.send(result)
        })



        /**Create Or Post Data (*-Bid-* Data)**/
        app.post('/bid',verifyToken, async (req, res) => {
            // delete req.body._id
            const newBid = req.body;
            const result = await bidCollection.insertOne(newBid)
            res.send(result)
        })



        /**Get All *-Bids-* Data From DataBase**/
        app.get('/bids',verifyToken, async (req, res) => {
            const bids = bidCollection.find();
            const result = await bids.toArray()
            res.send(result)
        })


        /**Update Job From My Posted JOb**/


        /****Update Step---01****/
        app.get('/updateJob/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.findOne(query)
            res.send(result)
        })

        // Second
        app.put('/updateJob/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = req.body
            const options = { upsert: true }
            const job = {
                $set: {
                    jobTitle: updateDoc.jobTitle,
                    deadline: updateDoc.deadline,
                    shortDescription: updateDoc.shortDescription,
                    name: updateDoc.name,
                    priceRange: updateDoc.priceRange


                }
            }
            const result = await jobCollection.updateOne(filter, job, options)
            res.send(result)
            console.log(result);

        })



        app.get('/updateBidReq/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bidCollection.findOne(query)
            res.send(result)
        })



        app.patch('/updateBidReq/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = req.body
            const options = { upsert: true }
            const bid = {
                $set: {
                    status: updateDoc.status,

                }
            }
            const result = await bidCollection.updateOne(filter, bid, options)
            res.send(result)
            console.log(result);

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