import { useRef,useState,useEffect } from 'react'


import {io,Socket} from 'socket.io-client';



function App() {
  // 1. Create the reference container
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<Socket | null>(null);

  const isDrawing = useRef(false);
  const lastPos = useRef({x:0,y:0});

  const [color,setColor] = useState('black');
  const [brushSize,setBrushSize] = useState(5);

  const [strokes,setStrokes] = useState<any[]>([]);
  const [currentStroke,setCurrentStroke] = useState<any>(null);
  const [redoStack,setRedoStack] = useState<any[]>([]);


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
          ctx.strokeStyle = data.color;
          ctx.lineWidth = data.brushSize;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(currX, currY);
          ctx.stroke();
        }
      }
    });

    socket.on('undo', (data) => {
      redrawCanvas(data.strokes);
    });

    socket.on('redo', (data) => {
      redrawCanvas(data.strokes);
    });

    console.log(socket);

    return () => {
      socket.disconnect();
    };


  }, []);




  const redrawCanvas = (strokeList: any[] = strokes) => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokeList.forEach(stroke =>{
     

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.brushSize;
      ctx.beginPath();

      stroke.points.forEach((point:{x:number,y:number},index:number) =>{

        if(index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x,point.y);
      })
      ctx.stroke();
     })

    }

    const undo = () =>{
      if(strokes.length === 0) return;

      const lastStroke = strokes[strokes.length - 1];
      const newStrokes = strokes.slice(0, -1);

      setRedoStack([...redoStack,lastStroke]);
      setStrokes(newStrokes);
      redrawCanvas(newStrokes);
      socketRef.current?.emit('undo', { strokes: newStrokes });
    }

    const redo = () =>{
      if(redoStack.length === 0) return;


      const lastRedo = redoStack[redoStack.length -1];


     const newStrokes = [...strokes,lastRedo];

      setRedoStack(redoStack.slice(0,-1));
      setStrokes(newStrokes);
      redrawCanvas(newStrokes);
      socketRef.current?.emit('redo', { strokes: newStrokes });
    }








  const startDrawing = (event: React.MouseEvent) => {
    isDrawing.current = true
    const canvas = canvasRef.current
    lastPos.current = {x:event.nativeEvent.offsetX,y:event.nativeEvent.offsetY};
    setCurrentStroke({
      color: color,
      brushSize: brushSize,
      points: [{x:event.nativeEvent.offsetX,y:event.nativeEvent.offsetY}]
    });
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
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
        ctx.stroke()
        ctx.strokeStyle = color;                                                                        
        ctx.lineWidth = brushSize;   
        socketRef.current?.emit('draw', {
          prevX:lastPos.current.x,
          prevY:lastPos.current.y,
          currX: event.nativeEvent.offsetX,
          currY: event.nativeEvent.offsetY,
          color: color,
          brushSize: brushSize
        });
        lastPos.current = {x:event.nativeEvent.offsetX,y:event.nativeEvent.offsetY};
        
        if (currentStroke) {
          setCurrentStroke({
            ...currentStroke,
            points: [...currentStroke.points, {x:event.nativeEvent.offsetX,y:event.nativeEvent.offsetY}]
          });
          // console.log(currentStroke);
        }
      }
    }
  }

  const stopDrawing = () => {

    isDrawing.current = false;

    if(currentStroke) {
      setStrokes([...strokes,currentStroke]);
      setCurrentStroke(null);
      setRedoStack([]);
    }
  }

// console.log(isDrawing)
// console.log(setIsDrawing)


  return (
    <>
      <h1>Collab Board with AI</h1>
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>               
    <label>                                                                                       
      Color:                                                                                      
      <input                                                                                      
        type="color"                                                                              
        value={color}                                                                             
        onChange={(e) => setColor(e.target.value)}                                                
        style={{ marginLeft: '10px', marginRight: '20px' }}                                       
      />                                                                                          
    </label>                                                                                      
                                                                                                  
    <label>                                                                                       
      Brush Size: {brushSize}px                                                                   
      <input                                                                                      
        type="range"                                                                              
        min="1"                                                                                   
        max="20"                                                                                  
        value={brushSize}                                                                         
        onChange={(e) => setBrushSize(Number(e.target.value))}                                    
        style={{ marginLeft: '10px' }}                                                            
      />       
       <button onClick={undo}>Undo</button>
  <button onClick={redo}>Redo</button>                                                                                   
    </label>                                                                                      
  </div>       
      

      <canvas 
        ref={canvasRef}        // Attach our reference to this DOM element
        width={1000}            
        height={1000}  
        onMouseDown={startDrawing}
        onMouseMove={draw}       
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}

        style={{ 
          border: '10px solid black',
          backgroundColor: 'white'
        }} 
      />
    </>
  )
}

export default App