const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// IPO Prediction API
router.post('/predict', async (req, res) => {
  try {
    const { ipoData } = req.body;
    
    if (!ipoData) {
      return res.status(400).json({
        error: 'IPO data is required',
        status: 'error'
      });
    }

    // Validate required IPO data fields
    const requiredFields = ['name', 'priceRange', 'sector', 'marketCap'];
    const missingFields = requiredFields.filter(field => !ipoData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        status: 'error'
      });
    }

    // Path to Python script
    const pythonScript = path.join(__dirname, '..', 'ml', 'ipo_predictor.py');
    
    // Spawn Python process with virtual environment
    const pythonProcess = spawn('bash', ['-c', `cd ${path.dirname(pythonScript)} && source ../../ml_env/bin/activate && python3 ${path.basename(pythonScript)} '${JSON.stringify(ipoData)}'`]);
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const prediction = JSON.parse(result);
          
          // Add additional metadata
          prediction.timestamp = new Date().toISOString();
          prediction.ipo_name = ipoData.name;
          
          res.json(prediction);
        } catch (parseError) {
          console.error('Error parsing Python output:', parseError);
          res.status(500).json({
            error: 'Failed to parse prediction result',
            status: 'error',
            details: result
          });
        }
      } else {
        console.error('Python process error:', error);
        res.status(500).json({
          error: 'ML model prediction failed',
          status: 'error',
          details: error
        });
      }
    });
    
  } catch (err) {
    console.error('Prediction API error:', err);
    res.status(500).json({
      error: 'Internal server error',
      status: 'error'
    });
  }
});

// Get IPO list for prediction
router.get('/ipos', async (req, res) => {
  try {
    // Mock IPO data - in production, fetch from database
    const ipos = [
      {
        id: 1,
        name: "TechCorp Solutions",
        sector: "Technology",
        priceRange: "₹450-500",
        marketCap: "₹2,400 Cr",
        gmp: "₹75",
        lotSize: 30,
        subscriptionRatio: null,
        status: "upcoming"
      },
      {
        id: 2,
        name: "GreenEnergy Ltd",
        sector: "Renewable Energy", 
        priceRange: "₹280-320",
        marketCap: "₹1,800 Cr",
        gmp: "₹45",
        lotSize: 50,
        subscriptionRatio: 2.4,
        status: "live"
      },
      {
        id: 3,
        name: "FinTech Innovations",
        sector: "Financial Services",
        priceRange: "₹600-650", 
        marketCap: "₹3,200 Cr",
        gmp: "₹120",
        lotSize: 25,
        subscriptionRatio: 8.7,
        status: "closed"
      },
      {
        id: 4,
        name: "HealthTech Systems",
        sector: "Healthcare",
        priceRange: "₹380-420",
        marketCap: "₹2,100 Cr", 
        gmp: "₹60",
        lotSize: 40,
        subscriptionRatio: null,
        status: "upcoming"
      },
      {
        id: 5,
        name: "EduTech Platform",
        sector: "Education",
        priceRange: "₹220-250",
        marketCap: "₹1,500 Cr",
        gmp: "₹35", 
        lotSize: 60,
        subscriptionRatio: null,
        status: "upcoming"
      }
    ];
    
    res.json({
      ipos,
      status: 'success',
      count: ipos.length
    });
    
  } catch (err) {
    console.error('Error fetching IPOs:', err);
    res.status(500).json({
      error: 'Failed to fetch IPO data',
      status: 'error'
    });
  }
});

module.exports = router;
