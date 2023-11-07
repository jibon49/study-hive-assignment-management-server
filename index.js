const  express = require('express')
const cors = require('cors')
const app = express();
require ('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware

app.use(cors());
app.use(express.json());


//studyhive
//78Pgmvh3yoFdj0TW




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2zvoo0z.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const assignmentCollection = client.db('assignmentDB').collection('allAssignment');

    app.post('/create-assignment', async(req,res)=>{
        const createAssignment = req.body;
        console.log(createAssignment);
        const result = await assignmentCollection.insertOne(createAssignment);
        res.send(result);
    })

    app.get('/assignments',async(req,res)=>{
        const cursor = assignmentCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/assignment/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignmentCollection.findOne(query)
      res.send(result);
    })

    app.put('/assignment/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const options = {upset:true};
      const updatedAssignment = req.body;
      const assignment = {
        $set:{
          title:updatedAssignment.title, formattedDueDate:updatedAssignment.formattedDueDate, imageUrl:updatedAssignment.imageUrl, difficulty:updatedAssignment.difficulty, marks:updatedAssignment.marks, description:updatedAssignment.description,
        }
      }

      const result = await assignmentCollection.updateOne(filter, assignment, options)
      res.send(result);

    })

    app.get('/pagination-assignments',async(req,res)=>{

      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      console.log('pagination' ,req.query)
      const result = await assignmentCollection.find()
      .skip(page*size)
      .limit(size)
      .toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('study hive server is running on background')
})

app.listen(port,()=>{
    console.log('study hive running')
})