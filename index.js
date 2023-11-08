const  express = require('express')
const cors = require('cors')
const app = express();
require ('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

//middleware

app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json());


const verifyToken = async(req,res,next) =>{
  const token = req.cookies?.token;
  if(!token){
    return res.status(401).send({message:'not authorized'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded)=>{
    if(err){
      console.log(err)
      return res.status(403).send({message:'forbidden'})
    }

    console.log('value int token', decoded)
    next()

  })

}




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
    const submittedCollection = client.db('submittedAssignmentDB').collection('submitted');


    //auth related

    // app.post('/jwt', async(req,res)=>{
    //   const user = req.body;
    //   console.log(user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET , {expiresIn: '1h'})
    //   res
    //   .cookie('token', token,{
    //     httpOnly:true,
    //     secure:false
    //   })
    //   .send({success:true})
    // })



    //assignment related
    app.post('/create-assignment', async(req,res)=>{
        const createAssignment = req.body;
        console.log(createAssignment);
        const result = await assignmentCollection.insertOne(createAssignment);
        res.send(result);
    })

    app.get('/assignments', async(req,res)=>{
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

    app.delete('/assignments/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assignmentCollection.deleteOne(query);
      res.send(result)
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





    //submitted assignment
    app.post('/submitted',async(req,res)=>{
      const submitted = req.body;
      console.log(submitted);
      const result = await submittedCollection.insertOne(submitted)
      res.send(result);
    })

    app.get('/submitted', async(req,res)=>{
      const cursor = submittedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.patch('/submitted/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedSubmitted = req.body;
      console.log(updatedSubmitted);

      const updateDoc = {
        $set:{
          status: updatedSubmitted.status,
          obtainedMarks: updatedSubmitted.obtainedMarks,
          examinersFeedback:updatedSubmitted.examinersFeedback
        },
      };
      const result = await submittedCollection.updateOne(filter,updateDoc);
      res.send(result)

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