"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, Calculator, Target, DollarSign, BarChart3, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface IPO {
  id: number
  name: string
  sector: string
  priceRange: string
  marketCap: string
  gmp: string
  lotSize: number
  subscriptionRatio: number | null
  status: string
  openDate?: string
  closeDate?: string
  listingDate?: string
  description?: string
  issueSize?: string
}

interface PredictionResult {
  predicted_opening_price: number
  price_range_low: number
  price_range_high: number
  confidence: number
  gain_loss: number
  gain_loss_percent: number
  listing_prediction: string
  offer_price: number
  model_lg_prediction: number
  model_lp_prediction: number
  status: string
  timestamp?: string
  ipo_name?: string
}

export function IPOPredictionPage() {
  const searchParams = useSearchParams()
  const preselectedIpoId = searchParams.get('ipoId')
  
  const [ipos, setIpos] = useState<IPO[]>([])
  const [selectedIPO, setSelectedIPO] = useState<IPO | null>(null)
  const [customData, setCustomData] = useState({
    issueSize: "",
    offerPrice: "",
    subscriptionRate: "",
    qibSubscription: "",
    retailSubscription: "",
  })
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingIPOs, setFetchingIPOs] = useState(true)

  useEffect(() => {
    fetchIPOs()
  }, [])

  useEffect(() => {
    // Auto-select IPO if provided in URL
    if (preselectedIpoId && ipos.length > 0) {
      handleIPOSelect(preselectedIpoId)
    }
  }, [preselectedIpoId, ipos])

  const fetchIPOs = async () => {
    try {
      const response = await fetch('/api/ml/ipos')
      const data = await response.json()
      
      if (data.status === 'success') {
        setIpos(data.ipos)
      } else {
        toast({
          title: "Error",
          description: "Failed to load IPO data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching IPOs:', error)
      toast({
        title: "Error", 
        description: "Failed to load IPO data",
        variant: "destructive"
      })
    } finally {
      setFetchingIPOs(false)
    }
  }

  const handleIPOSelect = (ipoId: string) => {
    const ipo = ipos.find(i => i.id.toString() === ipoId)
    if (ipo) {
      setSelectedIPO(ipo)
      setPrediction(null)
      
      // Auto-populate fields from database
      const [low, high] = extractPriceRange(ipo.priceRange)
      const avgPrice = (low + high) / 2
      
      setCustomData({
        issueSize: ipo.issueSize?.replace('₹', '').replace('Cr', '').trim() || "",
        offerPrice: avgPrice.toString(),
        subscriptionRate: ipo.subscriptionRatio?.toString() || "1.0",
        qibSubscription: ipo.subscriptionRatio ? (ipo.subscriptionRatio * 0.8).toFixed(1) : "0.8",
        retailSubscription: ipo.subscriptionRatio ? (ipo.subscriptionRatio * 1.2).toFixed(1) : "1.2",
      })
    }
  }

  const extractPriceRange = (priceRange: string): [number, number] => {
    const cleanStr = priceRange.replace('₹', '').replace(',', '')
    if (cleanStr.includes('-')) {
      const [low, high] = cleanStr.split('-').map(p => parseFloat(p.trim()))
      return [low, high]
    }
    const price = parseFloat(cleanStr.trim())
    return [price, price]
  }

  const predictOpeningPrice = async () => {
    if (!selectedIPO) {
      toast({
        title: "Error",
        description: "Please select an IPO first",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      // Prepare IPO data with custom inputs
      const ipoData = {
        ...selectedIPO,
        issueSize: customData.issueSize ? `₹${customData.issueSize} Cr` : selectedIPO.issueSize,
        priceRange: customData.offerPrice ? `₹${customData.offerPrice}-${customData.offerPrice}` : selectedIPO.priceRange,
        subscriptionRatio: parseFloat(customData.subscriptionRate) || selectedIPO.subscriptionRatio,
        qibSubscription: parseFloat(customData.qibSubscription) || 0.8,
        retailSubscription: parseFloat(customData.retailSubscription) || 1.2,
      }

      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipoData }),
      })

      const result = await response.json()

      if (result.status === 'success') {
        setPrediction(result)
        toast({
          title: "Success",
          description: "IPO prediction generated successfully",
        })
      } else {
        throw new Error(result.error || 'Prediction failed')
      }

    } catch (error) {
      console.error('Prediction error:', error)
      toast({
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "Strong Positive":
        return "text-green-600 dark:text-green-400"
      case "Positive":
        return "text-green-500 dark:text-green-300"
      case "Neutral":
        return "text-yellow-600 dark:text-yellow-400"
      case "Negative":
        return "text-red-500 dark:text-red-400"
      case "Strong Negative":
        return "text-red-600 dark:text-red-500"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case "Strong Positive":
      case "Positive":
        return <TrendingUp className="w-4 h-4" />
      case "Negative":
      case "Strong Negative":
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  if (fetchingIPOs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            IPO Price Predictor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            AI-powered opening price prediction using advanced machine learning models
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          ML Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IPO Selection & Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Select IPO & Configure Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* IPO Selection */}
            <div className="space-y-2">
              <Label htmlFor="ipo-select">Select IPO</Label>
              <Select onValueChange={handleIPOSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an IPO for prediction" />
                </SelectTrigger>
                <SelectContent>
                  {ipos.map((ipo) => (
                    <SelectItem key={ipo.id} value={ipo.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{ipo.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {ipo.sector}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIPO && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                {/* IPO Info Display */}
                <Card className="bg-slate-50 dark:bg-slate-800/50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Sector:</span>
                        <p className="font-medium">{selectedIPO.sector}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Price Range:</span>
                        <p className="font-medium">{selectedIPO.priceRange}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Market Cap:</span>
                        <p className="font-medium">{selectedIPO.marketCap}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">GMP:</span>
                        <p className="font-medium text-green-600">{selectedIPO.gmp}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue-size">Issue Size (₹ Cr)</Label>
                    <Input
                      id="issue-size"
                      value={customData.issueSize}
                      onChange={(e) => setCustomData(prev => ({ ...prev, issueSize: e.target.value }))}
                      placeholder="e.g., 1200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer-price">Offer Price (₹)</Label>
                    <Input
                      id="offer-price"
                      value={customData.offerPrice}
                      onChange={(e) => setCustomData(prev => ({ ...prev, offerPrice: e.target.value }))}
                      placeholder="e.g., 475"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription-rate">Subscription Rate</Label>
                    <Input
                      id="subscription-rate"
                      value={customData.subscriptionRate}
                      onChange={(e) => setCustomData(prev => ({ ...prev, subscriptionRate: e.target.value }))}
                      placeholder="e.g., 2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qib-subscription">QIB Subscription</Label>
                    <Input
                      id="qib-subscription"
                      value={customData.qibSubscription}
                      onChange={(e) => setCustomData(prev => ({ ...prev, qibSubscription: e.target.value }))}
                      placeholder="e.g., 2.0"
                    />
                  </div>
                </div>

                <Button 
                  onClick={predictOpeningPrice}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Predict Opening Price
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Prediction Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!prediction ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Prediction Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Select an IPO and click predict to see AI-powered opening price analysis
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Prediction */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    ₹{prediction.predicted_opening_price.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Predicted Opening Price
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className={`${getPredictionColor(prediction.listing_prediction)} flex items-center gap-1`}>
                      {getPredictionIcon(prediction.listing_prediction)}
                      {prediction.listing_prediction}
                    </Badge>
                    <Badge variant="outline">
                      {prediction.confidence}% Confidence
                    </Badge>
                  </div>

                  <div className="text-lg font-semibold">
                    <span className={prediction.gain_loss_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {prediction.gain_loss_percent >= 0 ? '+' : ''}{prediction.gain_loss_percent.toFixed(2)}%
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                      (₹{Math.abs(prediction.gain_loss).toFixed(2)} {prediction.gain_loss >= 0 ? 'gain' : 'loss'})
                    </span>
                  </div>
                </div>

                {/* Price Range */}
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Low</div>
                        <div className="font-semibold">₹{prediction.price_range_low}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-slate-500 dark:text-slate-400">High</div>
                        <div className="font-semibold">₹{prediction.price_range_high}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Model Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Model LG:</span>
                    <p className="font-medium">₹{prediction.model_lg_prediction}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Model LP:</span>
                    <p className="font-medium">₹{prediction.model_lp_prediction}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Offer Price:</span>
                    <p className="font-medium">₹{prediction.offer_price}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Predicted At:</span>
                    <p className="font-medium">
                      {prediction.timestamp ? new Date(prediction.timestamp).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    This prediction is based on machine learning models and historical data. 
                    Actual opening prices may vary due to market conditions. 
                    Please conduct your own research before making investment decisions.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
