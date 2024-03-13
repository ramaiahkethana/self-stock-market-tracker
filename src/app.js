import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.set('views', './src/views')
app.set('view engine', 'ejs'); // Set EJS as the view engine

// Connect to MongoDB
mongoose.set('strictQuery', true)
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});;

// Define MongoDB schemas
const sectorSchema = new mongoose.Schema({
  name: String,
  sector: String,
});

const industrySchema = new mongoose.Schema({
  name: String,
  sector_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
});

const eventSchema = new mongoose.Schema({
  name: String,
  status: String,
});

const portfolioSchema = new mongoose.Schema({
  name: String,
  mc_code: String,
  quantity: Number,
  average_price: Number,
  industry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry' },
});

// Create models
const Sector = mongoose.model('Sector', sectorSchema);
const Industry = mongoose.model('Industry', industrySchema);
const Event = mongoose.model('Event', eventSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// API routes
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/industries', (req, res) => {
  res.render('industries');
});
app.get('/events', (req, res) => {
  res.render('events');
});
app.get('/sectors', (req, res) => {
  res.render('sectors');
});
app.get('/portfolio', (req, res) => {
  res.render('portfolio');
});

// Get all industries
app.get('/api/industries', async (req, res) => {
  try {
    const industries = await Industry.find();
    res.json(industries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new sector
app.post('/api/sectors', async (req, res) => {
  const { name } = req.body;
  try {
    const newSector = new Sector({ name });
    await newSector.save();
    res.json(newSector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sectors
app.get('/api/sectors', async (req, res) => {
  try {
    const sectors = await Sector.find();
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new industry
app.post('/api/industries', async (req, res) => {
  const { name, sector_id } = req.body;
  try {
    const newIndustry = new Industry({ name, sector_id });
    await newIndustry.save();
    res.json(newIndustry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find()
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new event
app.post('/api/events', async (req, res) => {
  const { name, status } = req.body;
  try {
    const newEvent = new Event({ name, status });
    await newEvent.save();
    res.json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all portfolios
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolios = await Portfolio.find();
    const stockDetails = await getStockDetailsFromMc(portfolios[0].mc_code)
    console.log('stockDetails', stockDetails.data.data)
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getStockDetailsFromMc (mcCode) {
  const url = `https://api.moneycontrol.com/mcapi/v1/stock/get-stock-price?scIdList=AF32,HDF01&scId=HDF01`

  const stockDetails = await axios.get(url)

  return stockDetails
}

// Add new portfolio
app.post('/api/portfolio', async (req, res) => {
  const body = req.body;
  try {
    const newPortfolio = new Portfolio(body);
    await newPortfolio.save();
    res.json(newPortfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
