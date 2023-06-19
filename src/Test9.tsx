import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import "tailwindcss/tailwind.css";

interface Shape {
  id: number;
  type: "pen" | "rectangle" | "triangle" | "circle" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  line: { mouseX: number; mouseY: number }[];
  color: string;
  text: string;
}

interface coordinate {
  startX: number;
  startY: number;
  mouseX: number;
  mouseY: number;
}

const Test9 = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState<Shape[]>([]);
  const [{ startX, startY, mouseX, mouseY }, setCoordinates] =
    useState<coordinate>({
      startX: 0,
      startY: 0,
      mouseX: 0,
      mouseY: 0,
    });
  const [line, setLine] = useState<[{ mouseX: number; mouseY: number }]>([
    {
      mouseX: 0,
      mouseY: 0,
    },
  ]);
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

  const [color, setColor] = useState<string>("black");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const Redraw = (drawing: Shape, ctx: CanvasRenderingContext2D | null) => {
    if (ctx === null) return;
    if (drawing.type === "pen") {
      ctx.strokeStyle = drawing.color;
      ctx.beginPath();
      ctx.moveTo(drawing.line[0].mouseX, drawing.line[0].mouseY);
      drawing.line.map((dots) => {
        return ctx.lineTo(dots.mouseX, dots.mouseY);
      });
      ctx.stroke();
    } else if (drawing.type === "rectangle") {
      ctx.fillStyle = drawing.color;
      ctx.fillRect(drawing.x, drawing.y, drawing.width, drawing.height);
    } else if (drawing.type === "triangle") {
      ctx.fillStyle = drawing.color;
      ctx.beginPath();
      ctx.moveTo(drawing.x, drawing.y);
      ctx.lineTo(drawing.x + drawing.width, drawing.y);
      ctx.lineTo(drawing.x + drawing.width, drawing.y + drawing.height);
      ctx.closePath();
      ctx.fill();
    } else if (drawing.type === "circle") {
      ctx.fillRect(drawing.x, drawing.y, drawing.width, drawing.height);
      ctx.fillStyle = drawing.color;
      const radius = Math.sqrt(drawing.width ** 2 + drawing.height ** 2) / 2;
      const centerX = drawing.x + drawing.width / 2;
      const centerY = drawing.y + drawing.height / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
    } else if (drawing.type === "text") {
      ctx.fillStyle = drawing.color;
      ctx.font = "24px Arial";
      ctx.fillText(
        drawing.text,
        drawing.x,
        drawing.y - 20 + drawing.height + 20
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    const container = document.getElementById("container");
    const existingInput = container?.querySelector("form");

    // Check if an existing input element exists
    if (existingInput) {
      container?.removeChild(existingInput);
    }

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
    } else if (selectedTool === "move" || selectedTool === "resize" || selectedTool === "eraser") {
      const foundDrawing = drawings.find(
        (drawing) =>
          clickX >= drawing.x &&
          clickX <= drawing.x + drawing.width &&
          clickY >= drawing.y &&
          clickY <= drawing.y + drawing.height
      );
      if (foundDrawing) {
        setSelectedBoxPosition({
          startX: clickX - foundDrawing.x,
          startY: clickY - foundDrawing.y,
        });
        setSelectedBox(foundDrawing.id);
      }
    } else if (selectedTool === "text") {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const container = document.getElementById("container");
      const existingInput = container?.querySelector("form");
      if (existingInput) {
        container?.removeChild(existingInput);
      }

      const inputContainer = document.createElement("form");
      const input = document.createElement("input");
      const button = document.createElement("button");
      input.type = "text";
      input.style.paddingLeft = "8px";
      input.style.marginRight = "8px";
      input.style.fontSize = "24px";
      inputContainer.style.position = "absolute";
      inputContainer.style.left = clickX + rect.left + "px";
      inputContainer.style.top = clickY + rect.top + "px";
      button.textContent = "Submit";
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const inputValue = input.value;
        ctx.font = "24px Arial"; // Set the font size here (adjust the value as needed)
        ctx.fillStyle = color;
        ctx?.fillText(inputValue, clickX - 4, clickY + 24);
        const textMetrics = ctx.measureText(inputValue);
        const textWidth = textMetrics.width;
        const textHeight =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent;

        const newShape: Shape = {
          id: drawings.length + 1,
          type: selectedTool,
          x: clickX - 2,
          y: clickY + 24,
          width: textWidth,
          height: textHeight,
          line: [{ mouseX: 0, mouseY: 0 }],
          color: color,
          text: inputValue,
        };
        setDrawings((prevDrawings) => [...prevDrawings, newShape]);
      });
      inputContainer.style.display = "flex";
      inputContainer.appendChild(input);
      inputContainer.appendChild(button);
      container?.appendChild(inputContainer);
      input.focus();
      button.addEventListener("click", function () {
        container?.removeChild(inputContainer);
      });
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (image !== undefined) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }

      drawings.forEach((drawing) => {
        Redraw(drawing, ctx);
      });

      const width = mouseX - startX;
      const height = mouseY - startY;

      if (selectedTool === "pen" && line !== undefined) {
        ctx.strokeStyle = color;
        let newLine = line;
        // let newLine = drawings[drawings.length-1].line;
        ctx.beginPath();
        ctx.moveTo(
          drawings[drawings.length]?.line[line.length]?.mouseX,
          drawings[drawings.length]?.line[line.length]?.mouseY
        );
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        newLine.push({ mouseX: mouseX, mouseY: mouseY });
        setLine(newLine);

        if (color === undefined) return;
        const newDrawings = drawings;
        const newShape: Shape = {
          id: drawings.length + 1,
          type: selectedTool,
          x: startX,
          y: startY,
          width: 0,
          height: 0,
          line: newLine,
          color: color,
          text: "",
        };
        newDrawings.push(newShape);
        setDrawings(newDrawings);
      } else if (selectedTool === "rectangle") {
        ctx.fillStyle = color;
        ctx.fillRect(startX, startY, width, height);
      } else if (selectedTool === "triangle") {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mouseX, mouseY);
        ctx.lineTo(startX + width, startY);
        ctx.closePath();
        ctx.fill();
      } else if (selectedTool === "circle") {
        ctx.fillStyle = color;
        const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else if (
      (selectedTool === "move" || selectedTool === "resize") &&
      selectedBox !== null
    ) {
      const newDrawings = drawings.map((drawing) =>
        drawing.id === selectedBox
          ? selectedTool === "resize"
            ? {
                ...drawing,
                width: mouseX - drawing.x,
                height: mouseY - drawing.y,
              }
            : {
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
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }

      newDrawings.forEach((drawing) => {
        Redraw(drawing, ctx);
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(false);
    if (selectedTool === "pen") {
      if (color === undefined) return;
      const newShape: Shape = {
        id: drawings.length + 1,
        type: selectedTool,
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        line: line,
        color: color,
        text: "",
      };
      setDrawings((prevDrawings) => [...prevDrawings, newShape]);
      setLine([{ mouseX: 0, mouseY: 0 }]);
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
        line: [{ mouseX: 0, mouseY: 0 }],
        color: color,
        text: "",
      };
      setDrawings((prevDrawings) => [...prevDrawings, newShape]);
    } else if (selectedTool === "eraser") {
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
        Redraw(shape, ctx);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawings([])

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        setImage(img);
        img.onload = () => {
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");
          if (canvas && context) {
            const aspectRatio = img.width / img.height;
            const canvasWidth = Math.min(img.width, canvas.width);
            const canvasHeight = canvasWidth / aspectRatio;
            canvas.height = canvasHeight;
            context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
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
    setImage(undefined);
    setDrawings([]);
    setSelectedBox(null);
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = color ?? "black";
      ctx.lineWidth = 2;
    }
  }, [color]);

  console.log(selectedBox);

  return (
    <div className="w-full justify-start items-center">
        <div className="py-2 mt-2 mx-2 px-2 font-bold text-black/80 border-2 border-primary rounded-md text-2xl">Richard Angkasa - Canvas</div>
      <div className="flex gap-2 px-2 pt-2">
        <div className="space-y-2">
          <div className="flex flex-col gap-4 border-2 border-primary rounded-md h-fit py-4">
            {[
              "pen",
              "rectangle",
              "triangle",
              "circle",
              "eraser",
              "move",
              "resize",
              "text",
            ].map((unit) => (
              <button
                key={unit}
                onClick={() => {
                  setSelectedTool(unit);
                  const container = document.getElementById("container");
                  const existingInput = container?.querySelector("form");
                  if (existingInput) {
                    container?.removeChild(existingInput);
                  }
                }}
                className={`${
                  selectedTool === unit
                    ? "border-b border-t border-black"
                    : "border-b border-t border-transparent"
                } px-2 py-1`}
              >
                <img
                  className="w-10 aspect-square"
                  src={`./assets/${unit}.svg`}
                  alt={unit}
                ></img>
              </button>
            ))}
          </div>
          <div>
            <input
              type="color"
              onChange={handleColorChange}
              className="w-full h-14 p-1 border-2 border-primary rounded-md"
            />
          </div>
        </div>
        <div>
          <div id="container">
            <canvas
              id="canvas"
              ref={canvasRef}
              width={500}
              height={500}
              className="border-2 border-primary overflow-hidden rounded-md"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseOut={handleMouseOut}
            ></canvas>
          </div>
          <div className="flex mt-2 w-full justify-between">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-md"
              onClick={clearCanvas}
            >
              Clear Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test9;
