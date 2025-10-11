# IPO ML Prediction System Implementation

## Overview
This document describes the ML-powered IPO opening price prediction system integrated into the IPO Matchmaker application.

## System Architecture

### Components
1. **Python ML Service** (`server/src/ml/ipo_predictor.py`)
   - Loads pre-trained models: `model_lg.pkl`, `model_lp.pkl`, and `imputer.pkl`
   - Processes IPO data and makes predictions
   - Returns JSON response with prediction results

2. **Node.js API Route** (`server/src/routes/ml.js`)
   - `/predict` endpoint for ML predictions
   - `/ipos` endpoint for IPO data
   - Interfaces with Python ML service

3. **Next.js API Routes**
   - `client/app/api/ml/predict/route.ts` - Prediction API
   - `client/app/api/ml/ipos/route.ts` - IPO data API

4. **React Components**
   - `client/components/ipos/ipo-prediction-page.tsx` - Main prediction page
   - `client/app/dashboard/predict/page.tsx` - Dashboard route
   - Updated IPO cards with "Predict" buttons

## Features

### ML Model Features
The ML models use 3 key features for prediction:
1. **Offer Price** - Average of price range (₹450-500 → ₹475)
2. **Market Cap** - Company market capitalization in Crores
3. **GMP** - Grey Market Premium in ₹

### Prediction Output
- **Predicted Opening Price** - Expected opening price
- **Price Range** - Low and high estimates (±5%)
- **Confidence Score** - Model agreement indicator
- **Gain/Loss** - Expected profit/loss vs offer price
- **Gain/Loss %** - Percentage gain or loss
- **Listing Prediction** - Categorical prediction (Strong Positive, Positive, Neutral, Negative, Strong Negative)

### User Interface
- IPO selection dropdown with auto-fill functionality
- Editable form fields for fine-tuning predictions
- Real-time prediction results display
- Light/dark mode support
- Responsive design matching app theme

## Installation & Setup

### 1. Python Environment Setup
```bash
cd server
python3 -m venv ml_env
source ml_env/bin/activate
pip install -r requirements.txt
```

### 2. Required Files
Ensure these files exist:
- `server/model/imputer.pkl`
- `server/model/model_lg.pkl`
- `server/model/model_lp.pkl`
- `server/src/ml/ipo_predictor.py`

### 3. Testing
Run the test script:
```bash
./test-ml-prediction.sh
```

## API Endpoints

### POST /api/ml/predict
Predict IPO opening price

**Request Body:**
```json
{
  "ipoData": {
    "name": "TechCorp Solutions",
    "sector": "Technology",
    "priceRange": "₹450-500",
    "marketCap": "₹2400 Cr",
    "gmp": "₹75",
    "lotSize": 30,
    "subscriptionRatio": 2.5
  }
}
```

**Response:**
```json
{
  "predicted_opening_price": 222185.09,
  "price_range_low": 211075.83,
  "price_range_high": 233294.34,
  "confidence": 85.2,
  "gain_loss": 221710.09,
  "gain_loss_percent": 46675.81,
  "listing_prediction": "Strong Positive",
  "offer_price": 475.0,
  "status": "success",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "ipo_name": "TechCorp Solutions"
}
```

### GET /api/ml/ipos
Get available IPOs for prediction

**Response:**
```json
{
  "ipos": [...],
  "status": "success",
  "count": 5
}
```

## Usage

### From Dashboard
1. Navigate to `/dashboard/predict`
2. Select an IPO from dropdown
3. Review/edit IPO parameters
4. Click "Predict Opening Price"
5. View prediction results

### From IPO Cards
1. Browse IPOs in `/dashboard/ipos`
2. Click "Predict" button on any IPO card
3. Redirected to prediction page with pre-selected IPO
4. Make prediction as above

## Technical Notes

### Model Compatibility
- Models were trained with scikit-learn 1.2.2
- Current system uses 1.7.2 (compatibility warnings expected)
- Models work correctly despite version warnings

### Environment Variables
The system uses a Python virtual environment to isolate dependencies:
```bash
source server/ml_env/bin/activate
```

### Error Handling
- Input validation for required fields
- Model loading error handling
- Python process execution error handling
- JSON parsing error handling

## Customization

### Adding New Features
To add new prediction features:
1. Retrain models with additional features
2. Update `prepare_features()` method in `ipo_predictor.py`
3. Update UI form fields in prediction page component

### Model Updates
To update ML models:
1. Replace model files in `server/model/`
2. Ensure feature compatibility
3. Test with `test-ml-prediction.sh`

## Performance Considerations

### Optimization
- Models loaded once per process (not per prediction)
- Python virtual environment reduces startup overhead
- Ensemble prediction using two models for better accuracy

### Scaling
- Consider model caching for high-volume usage
- Implement prediction result caching
- Use background job queues for bulk predictions

## Troubleshooting

### Common Issues
1. **Module not found errors**: Ensure virtual environment is activated
2. **Model loading failures**: Check model file paths and permissions
3. **Feature mismatch errors**: Verify input data format matches expected features
4. **High prediction values**: Models may need retraining with current market data

### Debug Mode
Enable debug logging by setting environment variables:
```bash
export PYTHONPATH=/path/to/server/src
export DEBUG=1
```

## Integration Status

### Completed ✅
- Python ML service implementation
- API route integration
- React UI components
- Dashboard navigation
- IPO card integration
- End-to-end testing

### Future Enhancements 🚀
- Real-time data integration
- Historical prediction tracking
- Model performance monitoring
- Advanced feature engineering
- Batch prediction capabilities
