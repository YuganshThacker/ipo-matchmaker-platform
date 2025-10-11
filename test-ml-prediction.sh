#!/bin/bash

# Test ML Prediction System
# This script tests the complete ML prediction flow

echo "🚀 Testing IPO ML Prediction System"
echo "=================================="

# Test Python ML service directly
echo "1. Testing Python ML service directly..."
cd /Users/yugansh/Downloads/hackathon/IPO-Matchmaker-404-THUGS/server

source ml_env/bin/activate

TEST_IPO_DATA='{
  "name": "TechCorp Solutions",
  "sector": "Technology", 
  "priceRange": "₹450-500",
  "marketCap": "₹2400 Cr",
  "gmp": "₹75",
  "lotSize": 30,
  "subscriptionRatio": 2.5
}'

echo "Testing with IPO data: $TEST_IPO_DATA"
RESULT=$(python3 src/ml/ipo_predictor.py "$TEST_IPO_DATA")

if [[ $RESULT == *"\"status\": \"success\""* ]]; then
  echo "✅ Python ML service test passed!"
  echo "Result: $RESULT"
else
  echo "❌ Python ML service test failed!"
  echo "Error: $RESULT"
  exit 1
fi

echo ""
echo "2. Testing different IPO scenarios..."

# Test with different IPO data
TEST_CASES=(
  '{"name": "GreenEnergy Ltd", "sector": "Renewable Energy", "priceRange": "₹280-320", "marketCap": "₹1800 Cr", "gmp": "₹45", "lotSize": 50}'
  '{"name": "FinTech Innovations", "sector": "Financial Services", "priceRange": "₹600-650", "marketCap": "₹3200 Cr", "gmp": "₹120", "lotSize": 25}'
  '{"name": "HealthTech Systems", "sector": "Healthcare", "priceRange": "₹380-420", "marketCap": "₹2100 Cr", "gmp": "₹60", "lotSize": 40}'
)

for i in "${!TEST_CASES[@]}"; do
  echo "Test case $((i+1)):"
  RESULT=$(python3 src/ml/ipo_predictor.py "${TEST_CASES[$i]}")
  if [[ $RESULT == *"\"status\": \"success\""* ]]; then
    echo "✅ Test case $((i+1)) passed"
  else
    echo "❌ Test case $((i+1)) failed"
    echo "Error: $RESULT"
  fi
done

echo ""
echo "3. Checking required files..."

# Check if all required files exist
FILES=(
  "model/imputer.pkl"
  "model/model_lg.pkl" 
  "model/model_lp.pkl"
  "src/ml/ipo_predictor.py"
  "src/routes/ml.js"
  "requirements.txt"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
  fi
done

echo ""
echo "4. Checking Python environment..."

# Check Python packages
python3 -c "
try:
    import numpy, pandas, pickle, sklearn
    print('✅ All required Python packages are installed')
except ImportError as e:
    print(f'❌ Missing Python package: {e}')
"

echo ""
echo "🎉 ML Prediction System Test Complete!"
echo ""
echo "Next steps to test the full system:"
echo "1. Start the client: cd client && npm run dev"
echo "2. Navigate to /dashboard/predict"
echo "3. Select an IPO and click 'Predict Opening Price'"
echo "4. Verify the prediction results display correctly"
