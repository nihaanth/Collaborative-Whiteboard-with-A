import { useRef,useState } from 'react'

function App() {
  // 1. Create the reference container
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (event: React.MouseEvent) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
      }
    }
  }

  const draw = (event: React.MouseEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
        ctx.stroke()
      }
    }
  }


  return (
    <>
      <h1>Collab Board with AI</h1>
      

      <canvas 
        ref={canvasRef}        // Attach our reference to this DOM element
        width={800}            
        height={600}  
        onMouseDown={startDrawing}
        onMouseMove={draw}       
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}  
        style={{ 
          border: '1px solid black',
          backgroundColor: 'white'
        }} 
      />
    </>
  )
}

export default App