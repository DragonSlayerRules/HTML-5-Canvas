import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import "tailwindcss/tailwind.css";

interface Shape {
  id: number;
  type: "rectangle" | "triangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
}

const Test6 = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState<Shape[]>([]);
  const [{ startX, startY, mouseX, mouseY }, setCoordinates] = useState<{
    startX: number;
    startY: number;
    mouseX: number;
    mouseY: number;
  }>({
    startX: 0,
    startY: 0,
    mouseX: 0,
    mouseY: 0,
  });
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [selectedBoxPosition, setSelectedBoxPosition] = useState<{
    startX: number;
    startY: number;
  }>({
    startX: 0,
    startY: 0,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (selectedTool === "pen") {
      setCoordinates({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top,
      });
    } else if (selectedTool === "erase"){
      const foundDrawing = drawings.find(
        (drawing) =>
          clickX >= drawing.x &&
          clickX <= drawing.x + drawing.width &&
          clickY >= drawing.y &&
          clickY <= drawing.y + drawing.height
      );

      if (foundDrawing) {
        setSelectedBox(foundDrawing.id);
      }
    }else if (selectedTool === "move") {
        const foundDrawing = drawings.find(
          (drawing) =>
            clickX >= drawing.x &&
            clickX <= drawing.x + drawing.width &&
            clickY >= drawing.y &&
            clickY <= drawing.y + drawing.height
        );
    
        if (foundDrawing) {
          setSelectedBox(foundDrawing.id);
          setSelectedBoxPosition({
            startX: clickX - foundDrawing.x,
            startY: clickY - foundDrawing.y,
          });
        }
      }

    setIsDrawing(true);
  };

 const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
  e.preventDefault();
  e.stopPropagation();

  if (!isDrawing) {
    return;
  }

  const canvas = canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (selectedTool === "pen") {
    setCoordinates((prevCoordinates) => ({
      ...prevCoordinates,
      mouseX,
      mouseY,
    }));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image !== undefined) {
      ctx.drawImage(image, 0, 0);
    }

    drawings.forEach((drawing) => {
      ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
    });

    const width = mouseX - startX;
    const height = mouseY - startY;

    ctx.strokeRect(startX, startY, width, height);
  } else if (selectedTool === "move" && selectedBox !== null) {
    const newDrawings = drawings.map((drawing) =>
      drawing.id === selectedBox
        ? {
            ...drawing,
            x: mouseX - selectedBoxPosition.startX,
            y: mouseY - selectedBoxPosition.startY,
          }
        : drawing
    );

    setDrawings(newDrawings);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image !== undefined) {
      ctx.drawImage(image, 0, 0);
    }

    newDrawings.forEach((drawing) => {
      ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
    });
  }
};


const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
  e.preventDefault();
  e.stopPropagation();

  setIsDrawing(false);

  if (selectedTool === "pen") {
    setDrawings((prevDrawings) => [
      ...prevDrawings,
      {
        id: drawings.length + 1,
        x: startX,
        y: startY,
        width: mouseX - startX,
        height: mouseY - startY,
      },
    ]);
  } else if (selectedTool === "erase") {
    const unDeletedBox = drawings.filter((unit) => unit.id !== selectedBox);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    if (image !== undefined) {
      ctx?.drawImage(image, 0, 0);
    }
    unDeletedBox.forEach((drawing) => {
      ctx?.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
    });
    setDrawings(unDeletedBox);
  } else if (selectedTool === "move") {
    setSelectedBox(null);
  }
};


const handleMouseOut = (e: React.MouseEvent<HTMLCanvasElement>) => {
  e.preventDefault();
  e.stopPropagation();

  setIsDrawing(false);

  if (selectedTool === "move") {
    setSelectedBox(null);
  }
};

 

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        setImage(img);
        img.onload = () => {
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");

          if (canvas && context) {
            canvas.width = img.width;
            canvas.height = img.height;

            context.drawImage(img, 0, 0);
          }
        };

        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    setDrawings([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas) return
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleToolChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTool(event.target.value);
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <h4 className="mb-4">Drag the mouse to create a rectangle</h4>
      <canvas
        id="canvas"
        ref={canvasRef}
        width={500}
        height={500}
        className="border-2 border-red-500"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
      ></canvas>
      <div>
        <label htmlFor="tool">Select Tool: </label>
        <select id="tool" value={selectedTool} onChange={handleToolChange}>
    <option value="pen">Pen</option>
    <option value="erase">Erase</option>
    <option value="move">Move</option>
  </select>

      </div>
      <div className="mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={clearCanvas}
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Test6;
