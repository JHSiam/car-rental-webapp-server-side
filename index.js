import 'dotenv/config';
import express from 'express';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbName = 'cardrentaldatabase';

async function run() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const carsCollection = db.collection('cars');
    const bookingsCollection = db.collection('bookings');
    const favoritesCollection = db.collection('favorites');

    // User Registration Route
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Cars APIs
    app.post('/cars', async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    app.get('/cars', async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.send(result);
    });

    app.get('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    // Bookings APIs
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.get('/bookings/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/all-bookings', async (req, res) => {
      const result = await bookingsCollection.find().toArray();
      res.send(result);
    });

    // Favorites APIs
    app.post('/favorites', async (req, res) => {
      const favorite = req.body;
      const result = await favoritesCollection.insertOne(favorite);
      res.send(result);
    });

    app.get('/favorites/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await favoritesCollection.find(query).toArray();
      res.send(result);
    });

    // Get all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Get user by email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // Make user admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

// Basic Route
app.get('/', (req, res) => {
  res.send('Car Rental Backend is running');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
