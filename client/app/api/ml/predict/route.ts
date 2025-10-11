import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ipoData } = body

    if (!ipoData) {
      return NextResponse.json({
        error: 'IPO data is required',
        status: 'error'
      }, { status: 400 })
    }

    // Validate required IPO data fields
    const requiredFields = ['name', 'priceRange', 'sector', 'marketCap']
    const missingFields = requiredFields.filter(field => !ipoData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        status: 'error'
      }, { status: 400 })
    }

    // Path to Python script (adjust path to server directory)
    const serverDir = path.join(process.cwd(), '../server')
    const pythonScript = path.join(serverDir, 'src/ml/ipo_predictor.py')
    
    return new Promise<NextResponse>((resolve, reject) => {
      // Spawn Python process with virtual environment
      const pythonProcess = spawn('bash', ['-c', `cd "${serverDir}" && source ml_env/bin/activate && python3 "${pythonScript}" '${JSON.stringify(ipoData)}'`])
      
      let result = ''
      let error = ''
      
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
      })
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const prediction = JSON.parse(result)
            
            // Add additional metadata
            prediction.timestamp = new Date().toISOString()
            prediction.ipo_name = ipoData.name
            
            resolve(NextResponse.json(prediction))
          } catch (parseError) {
            console.error('Error parsing Python output:', parseError)
            resolve(NextResponse.json({
              error: 'Failed to parse prediction result',
              status: 'error',
              details: result
            }, { status: 500 }))
          }
        } else {
          console.error('Python process error:', error)
          resolve(NextResponse.json({
            error: 'ML model prediction failed',
            status: 'error',
            details: error
          }, { status: 500 }))
        }
      })

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err)
        resolve(NextResponse.json({
          error: 'Failed to start prediction service',
          status: 'error'
        }, { status: 500 }))
      })
    })
    
  } catch (err) {
    console.error('Prediction API error:', err)
    return NextResponse.json({
      error: 'Internal server error',
      status: 'error'
    }, { status: 500 })
  }
}
