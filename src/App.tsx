import { useRef,useState,useEffect } from 'react'


import {io,Socket} from 'socket.io-client';



function App() {
  // 1. Create the reference container
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<Socket | null>(null);



  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;
    socket.on('connect',() => {
      console.log('Connected to server with ID:', socket.id);
    })

    socket.on('draw',(data) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const { prevX, prevY, currX, currY } = data;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(currX, currY);
          ctx.stroke();
        }
      }
    });

    console.log(socket);

    return () => {
      socket.disconnect();
    };


  }, []);





const isDrawing = useRef(false);
const lastPos = useRef({x:0,y:0});

  const startDrawing = (event: React.MouseEvent) => {
    isDrawing.current = true
    const canvas = canvasRef.current
    lastPos.current = {x:event.nativeEvent.offsetX,y:event.nativeEvent.offsetY};
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
      }
    }
  }

  const draw = (event: React.MouseEvent) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
        ctx.stroke()
        socketRef.current?.emit('draw', {
          prevX:lastPos.current.x,
          prevY:lastPos.current.y,
          currX: event.nativeEvent.offsetX,
          currY: event.nativeEvent.offsetY
        });
        lastPos.current = {x:event.nativeEvent.offsetX,y:event.nativeEvent.offsetY};
      }
    }
  }

// console.log(isDrawing)
// console.log(setIsDrawing)


  return (
    <>
      <h1>Collab Board with AI</h1>
      

      <canvas 
        ref={canvasRef}        // Attach our reference to this DOM element
        width={1000}            
        height={1000}  
        onMouseDown={startDrawing}
        onMouseMove={draw}       
        onMouseUp={() => isDrawing.current = false}
        onMouseLeave={() => isDrawing.current = false}

        style={{ 
          border: '10px solid black',
          backgroundColor: 'white'
        }} 
      />
    </>
  )
}

export default App