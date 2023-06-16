import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import "tailwindcss/tailwind.css";

interface Shape {
  id: number;
  type: "pen" | "rectangle" | "triangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  line: { mouseX: number; mouseY: number }[];
}

interface coordinate {
  startX: number;
  startY: number;
  mouseX: number;
  mouseY: number;
}

const Test7 = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState<Shape[]>([]);
  const [line, setLine] = useState<[{ mouseX: number; mouseY: number }]>([
    {
      mouseX: 0,
      mouseY: 0,
    },
  ]);
  const [{ startX, startY, mouseX, mouseY }, setCoordinates] =
    useState<coordinate>({
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

  console.log(drawings)

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
      setLine([{ mouseX: clickX, mouseY: clickY }]);
    } else if (
      selectedTool === "rectangle" ||
      selectedTool === "triangle" ||
      selectedTool === "circle"
    ) {
      setCoordinates({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top,
      });
    } else if (selectedTool === "erase") {
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
    } else if (selectedTool === "move") {
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

    if (
      selectedTool === "pen" ||
      selectedTool === "rectangle" ||
      selectedTool === "triangle" ||
      selectedTool === "circle"
    ) {
      setCoordinates((prevCoordinates) => ({
        ...prevCoordinates,
        mouseX,
        mouseY,
      }));

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

    if (  selectedTool !== "pen"){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (image !== undefined) {
        ctx.drawImage(image, 0, 0);
      }
    }
    

      drawings.forEach((drawing) => {
        if (drawing.type === "pen") {
          ctx.beginPath();
          ctx.moveTo(drawing.line[0].mouseX, drawing.line[0].mouseY);
          drawing.line.map((dots) => {
            return ctx.lineTo(dots.mouseX, dots.mouseY);
          });
          ctx.stroke();
        } else if (drawing.type === "rectangle") {
          ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
        } else if (drawing.type === "triangle") {
          ctx.beginPath();
          ctx.moveTo(drawing.x, drawing.y);
          ctx.lineTo(drawing.x + drawing.width, drawing.y);
          ctx.lineTo(drawing.x + drawing.width, drawing.y + drawing.height);
          ctx.closePath();
          ctx.stroke();
        } else if (drawing.type === "circle") {
          const radius =
            Math.sqrt(drawing.width ** 2 + drawing.height ** 2) / 2;
          const centerX = drawing.x + drawing.width / 2;
          const centerY = drawing.y + drawing.height / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });

      const width = mouseX - startX;
      const height = mouseY - startY;

      if (selectedTool === "pen" && line !== undefined) {
        let newLine = line;
        ctx.beginPath();
        ctx.moveTo(
          newLine[newLine.length - 1].mouseX,
          newLine[newLine.length - 1].mouseY
        );
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        newLine.push({ mouseX: mouseX, mouseY: mouseY });
        setLine(newLine);
      } else if (selectedTool === "rectangle") {
        ctx.strokeRect(
          startX,
          startY,
          width,
          height
        );
      } else if (selectedTool === "triangle") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mouseX, mouseY);
        ctx.lineTo(startX + width, startY);
        ctx.closePath();
        ctx.stroke();
      } else if (selectedTool === "circle") {
        const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
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
        if (drawing.type === "pen") {
          ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
        } else if (drawing.type === "rectangle") {
          ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
        } else if (drawing.type === "triangle") {
          ctx.beginPath();
          ctx.moveTo(drawing.x, drawing.y);
          ctx.lineTo(drawing.x + drawing.width, drawing.y);
          ctx.lineTo(drawing.x + drawing.width, drawing.y + drawing.height);
          ctx.closePath();
          ctx.stroke();
        } else if (drawing.type === "circle") {
          const radius =
            Math.sqrt(drawing.width ** 2 + drawing.height ** 2) / 2;
          const centerX = drawing.x + drawing.width / 2;
          const centerY = drawing.y + drawing.height / 2;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDrawing(false);

    if (selectedTool === "pen") {
      const newShape: Shape = {
        id: drawings.length + 1,
        type: selectedTool,
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        line: line,
      };
      setDrawings((prevDrawings) => [...prevDrawings, newShape]);
      setLine([{mouseX: 0, mouseY: 0}])
    } else if (
      selectedTool === "rectangle" ||
      selectedTool === "triangle" ||
      selectedTool === "circle"
    ) {
      const width = mouseX - startX;
      const height = mouseY - startY;

      const newShape: Shape = {
        id: drawings.length + 1,
        type: selectedTool,
        x: startX,
        y: startY,
        width,
        height,
      };

      setDrawings((prevDrawings) => [...prevDrawings, newShape]);
    } else if (selectedTool === "erase") {
      const unDeletedBox = drawings.filter((shape) => shape.id !== selectedBox);
      setDrawings(unDeletedBox);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      if (image !== undefined) {
        ctx?.drawImage(image, 0, 0);
      }
      unDeletedBox.forEach((shape) => {
        if (shape.type === "pen") {
          ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "rectangle") {
          ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "triangle") {
          ctx?.beginPath();
          ctx?.moveTo(shape.x, shape.y);
          ctx?.lineTo(shape.x + shape.width, shape.y);
          ctx?.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx?.closePath();
          ctx?.stroke();
        } else if (shape.type === "circle") {
          const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2) / 2;
          const centerX = shape.x + shape.width / 2;
          const centerY = shape.y + shape.height / 2;

          ctx?.beginPath();
          ctx?.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx?.stroke();
        }
      });
      setSelectedBox(null);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    if (image !== undefined) {
      ctx?.drawImage(image, 0, 0);
    }
    setDrawings([]);
    setSelectedBox(null);
  };

  const handleToolChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTool(e.target.value);
    setSelectedBox(null);
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
          <option value="rectangle">Rectangle</option>
          <option value="triangle">Triangle</option>
          <option value="circle">Circle</option>
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

export default Test7;
