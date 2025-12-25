import { useEffect, useRef, useState } from "react";

export default function SignaturePad({ onSave, onClose }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 200;

    const context = canvas.getContext("2d");
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#000";

    setCtx(context);
  }, []);

  const getPos = (e) => {
    if (e.touches) {
      return {
        x: e.touches[0].clientX - e.target.getBoundingClientRect().left,
        y: e.touches[0].clientY - e.target.getBoundingClientRect().top,
      };
    }
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  };

  const startDraw = (e) => {
    isDrawing.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    isDrawing.current = false;
    ctx.closePath();
  };

  const clear = () => {
    ctx.clearRect(0, 0, 400, 200);
  };

  const save = () => {
    const base64 = canvasRef.current.toDataURL("image/png");
    onSave(base64);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginBottom: 10 }}>Draw your signature</h3>

        <canvas
          ref={canvasRef}
          style={{ border: "1px solid #ccc", touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button onClick={clear}>Clear</button>
          <button onClick={save}>Done</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
