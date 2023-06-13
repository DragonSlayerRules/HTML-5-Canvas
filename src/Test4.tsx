import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import "tailwindcss/tailwind.css";

const Test4 = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState<
    { id: number; x: number; y: number; width: number; height: number }[]
  >([]);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [image, setImage] = useState();
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  const [selectedTool, setSelectedTool] = useState<string>("pen");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log(selectedBox);
  // console.log(drawings);
  // console.log(selectedTool);

  console.log(drawings);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      // style the context
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    // console.log("e.clientX", e.clientX, "rect.left", rect.left);

    // set a flag findicating the drag has begun

    const rect = canvas.getBoundingClientRect();
    if (selectedTool === "pen") {
      // save the starting x/y of the rectangle
      setStartX(e.clientX - rect.left);
      setStartY(e.clientY - rect.top);
    } else if (selectedTool === "erase") {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const foundDrawing = drawings.find(
        (drawing) =>
          clickX >= drawing.x &&
          clickX <= drawing.x + drawing.width &&
          clickY >= drawing.y &&
          clickY <= drawing.y + drawing.height
      );

      if (foundDrawing) {
        const selectedId = foundDrawing.id;

        // Do something with the selected id
        setSelectedBox(selectedId);
      }

      // setSelectedBox(foundIndex !== -1 ? foundIndex + 1 : null);
    }

    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the drawing flag
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
      // redraw previous drawings]

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      if (image !== undefined) {
        ctx?.drawImage(image, 0, 0);
      }
      unDeletedBox.forEach((drawing) => {
        ctx?.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
      });
      setDrawings(unDeletedBox);
    }
    // save the current drawing
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the drawing flag
    setIsDrawing(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedTool === "pen") {
      // if we're not drawing, just return
      if (!isDrawing) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      // get the current mouse position
      setMouseX(e.clientX - rect.left);
      setMouseY(e.clientY - rect.top);

      // Put your mousemove stuff here

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // clear the canvas

      if (image !== undefined) {
        ctx.drawImage(image, 0, 0);
      }

      drawings.forEach((drawing) => {
        ctx?.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
      });

      // calculate the rectangle width/height based
      // on starting vs current mouse position
      const width = mouseX - startX;
      const height = mouseY - startY;

      // draw a new rect from the start position
      // to the current mouse position
      ctx.strokeRect(startX, startY, width, height);
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

            // Draw image on canvas
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

export default Test4;
