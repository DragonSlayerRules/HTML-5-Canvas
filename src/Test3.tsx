import React, { useRef, useEffect, ChangeEvent } from "react";

function ImageUploader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) {
      return;
    }

    // Function to handle the image load
    const handleImageLoad = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const image = new Image();
        image.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = URL.createObjectURL(file);
      }
    };

    // Attach event listener to handle file selection
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    fileInput.addEventListener("change", handleImageLoad);

    return () => {
      fileInput.removeEventListener("change", handleImageLoad);
    };
  }, []);

  return (
    <div>
      <input type="file" id="image-upload" accept="image/*" />
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
}

export default ImageUploader;
