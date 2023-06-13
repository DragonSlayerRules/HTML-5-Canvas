import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import "tailwindcss/tailwind.css";

const Test4 = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState<
    { x: number; y: number; width: number; height: number }[]
  >([]);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const rect = canvas.getBoundingClientRect();
    // console.log("e.clientX", e.clientX, "rect.left", rect.left);

    // save the starting x/y of the rectangle
    setStartX(e.clientX - rect.left);
    setStartY(e.clientY - rect.top);

    // set a flag findicating the drag has begun
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the drawing flag
    setIsDrawing(false);

    // save the current drawing
    setDrawings((prevDrawings) => [
      ...prevDrawings,
      {
        x: startX,
        y: startY,
        width: mouseX - startX,
        height: mouseY - startY,
      },
    ]);
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

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const image = canvas.previousSibling as HTMLImageElement;

    image.onload = () => {
      const context = canvas?.getContext("2d");

      if (canvas && context) {
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw image on canvas
        context.drawImage(image, 0, 0);
      }
    };

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

  return (
    <div className="h-screen flex justify-center items-center">
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <h4 className="mb-4">Drag the mouse to create a rectangle</h4>
      <canvas
        id="canvas"
        ref={canvasRef}
        width={500}
        height={150}
        className="border-2 border-red-500"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
      ></canvas>
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
