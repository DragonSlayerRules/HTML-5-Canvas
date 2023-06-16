// Input File

import React, { useRef, ChangeEvent, useEffect, useState } from "react";
import "./index.css";

function Test1() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const [selectedTool, setSelectedTool] = useState<string>("pen");

  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [drawings, setDrawings] = useState<
    { x: number; y: number; width: number; height: number }[]
  >([]);

  console.log(drawings)
  const canvas = canvasRef.current;
  const context = canvas?.getContext("2d");
  if (context?.strokeStyle || context?.lineWidth) {
    context.strokeStyle = "blue";
    context.lineWidth = 2;
  }

  const handleMouseDown = (event: MouseEvent) => {
    if (!canvas) return;

    isDrawingRef.current = true;
    if (selectedTool === "pen") {
      lastXRef.current = event.clientX - canvas.offsetLeft;
      lastYRef.current = event.clientY - canvas.offsetTop;
    } else if (selectedTool === "rectangle") {
      const rect = canvas.getBoundingClientRect();
      // console.log("e.clientX", e.clientX, "rect.left", rect.left);

      // save the starting x/y of the rectangle
      setStartX(event.clientX - rect.left);
      setStartY(event.clientY - rect.top);
      isDrawingRef.current = true;
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!canvas) return;

    if (!isDrawingRef.current) return;
    const currentX = event.clientX - canvas.offsetLeft;
    const currentY = event.clientY - canvas.offsetTop;

    if (context) {
      if (selectedTool === "pen") {
        // Pen drawing
        context.strokeStyle = "black";
        context.lineJoin = "round";
        context.lineWidth = 5;

        context.beginPath();
        context.moveTo(lastXRef.current, lastYRef.current);
        context.lineTo(currentX, currentY);
        context.closePath();
        context.stroke();
      } else if (selectedTool === "rectangle") {
        const rect = canvas.getBoundingClientRect();

        // get the current mouse position
        setMouseX(event.clientX - rect.left);
        setMouseY(event.clientY - rect.top);

        // Put your mousemove stuff here

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // redraw previous drawings
        drawings.forEach((drawing) => {
          ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
        });

        // calculate the rectangle width/height based
        // on starting vs current mouse position
        const width = mouseX - startX;
        const height = mouseY - startY;

        // draw a new rect from the start position
        // to the current mouse position
        ctx.strokeRect(startX, startY, width, height);
      }
    }

    lastXRef.current = currentX;
    lastYRef.current = currentY;
  };

  const handleMouseOut = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the drawing flag
    isDrawingRef.current = false;
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    if (selectedTool === "rectangle") {
      setDrawings((prevDrawings) => [
        ...prevDrawings,
        {
          x: startX,
          y: startY,
          width: mouseX - startX,
          height: mouseY - startY,
        },
      ]);
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");

          // Set canvas size equal to image size
          if (canvas) {
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image on canvas
            context?.drawImage(img, 0, 0);
          }
        };

        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleToolChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTool(event.target.value);
  };

  const clearCanvas = () => {
    
    setDrawings([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="tool">Select Tool: </label>
        <select id="tool" value={selectedTool} onChange={handleToolChange}>
          <option value="pen">Pen</option>
          <option value="rectangle">Rectangle</option>
        </select>
      </div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <canvas
        id="canvas"
        ref={canvasRef}
        width={500}
        height={500}
        className="border-4 border-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
      />

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={clearCanvas}
      >
        Clear Canvas
      </button>
    </div>
  );
}

export default Test1;
