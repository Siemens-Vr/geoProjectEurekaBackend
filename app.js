const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env variables
dotenv.config();

const app = express();
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = ['http://localhost:5102'];
app.use(cors({
    origin: allowedOrigins,   
    credentials: true         
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Connected to mongoDB`);
}).catch((err) => {
    console.error('Connection error', err);
});

// Routes
const baseUrl = process.env.BASE_URL;
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

app.use(`${baseUrl}/auth`, authRoutes);
app.use(`${baseUrl}/data`, dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
