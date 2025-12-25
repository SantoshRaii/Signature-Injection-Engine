import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";
import SignaturePad from "./SignaturePad";

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "pdfjs-dist/build/pdf.worker.entry";

const A4_RATIO = 1.414;
const MAX_PDF_WIDTH = 900;

// ENV based backend URL
const API_BASE = import.meta.env.VITE_API_BASE;

// Browser → PDF coordinate conversion
function browserToPdfCoords(box, pdfWidth, pdfHeight) {
  const boxWidth = box.widthPercent * pdfWidth;
  const boxHeight = box.heightPercent * pdfHeight;

  const x = box.xPercent * pdfWidth;
  const y = pdfHeight - box.yPercent * pdfHeight - boxHeight;

  return { x, y, width: boxWidth, height: boxHeight };
}

export default function PdfViewer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pageWidth, setPageWidth] = useState(600);

  // Signature pad
  const [showPad, setShowPad] = useState(false);
  const [signatureImg, setSignatureImg] = useState(null);

  // Disable drag while signing (MOBILE FIX)
  const [dragEnabled, setDragEnabled] = useState(true);

  // Signature box (percentage based)
  const [box, setBox] = useState({
    xPercent: 0.3,
    yPercent: 0.4,
    widthPercent: 0.2,
    heightPercent: 0.08,
  });

  const PDF_WIDTH = 595;
  const PDF_HEIGHT = 842;

  /* ---------------- Responsive PDF width ---------------- */
  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;
      setPageWidth(
        Math.min(containerRef.current.offsetWidth, MAX_PDF_WIDTH)
      );
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  /* ---------------- Render PDF ---------------- */
  useEffect(() => {
    const renderPDF = async () => {
      const pdf = await pdfjsLib.getDocument("/sample.pdf").promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1 });
      const scale = pageWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      if (renderTaskRef.current) renderTaskRef.current.cancel();

      const task = page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      });

      renderTaskRef.current = task;
      await task.promise;
    };

    if (pageWidth) renderPDF();
  }, [pageWidth]);

  /* ---------------- Open Signature Pad (Desktop + Mobile) ---------------- */
  const openSignaturePad = () => {
    setDragEnabled(false);
    setShowPad(true);
  };

  /* ---------------- Sign PDF ---------------- */
  const handleSignPdf = async () => {
    if (!signatureImg) {
      alert("Please add your signature first");
      return;
    }

    const payload = {
      pdfId: "sample.pdf",
      signature: signatureImg,
      coords: browserToPdfCoords(box, PDF_WIDTH, PDF_HEIGHT),
    };

    const res = await fetch(`${API_BASE}/sign-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Mobile-safe download
    window.location.href = `${API_BASE}${data.url}`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: MAX_PDF_WIDTH,
        padding: "0 12px",
        margin: "0 auto",
        position: "relative",
        background: "#fff",
      }}
    >
      {/* PDF Canvas */}
      <canvas ref={canvasRef} />

      {/* Signature Box */}
      <Rnd
        disableDragging={!dragEnabled}
        enableResizing={dragEnabled}
        bounds="parent"
        size={{
          width: box.widthPercent * pageWidth,
          height: box.heightPercent * pageWidth * A4_RATIO,
        }}
        position={{
          x: box.xPercent * pageWidth,
          y: box.yPercent * pageWidth * A4_RATIO,
        }}
        onDragStop={(e, d) =>
          setBox((prev) => ({
            ...prev,
            xPercent: d.x / pageWidth,
            yPercent: d.y / (pageWidth * A4_RATIO),
          }))
        }
        onResizeStop={(e, dir, ref, delta, pos) =>
          setBox({
            xPercent: pos.x / pageWidth,
            yPercent: pos.y / (pageWidth * A4_RATIO),
            widthPercent: ref.offsetWidth / pageWidth,
            heightPercent: ref.offsetHeight / (pageWidth * A4_RATIO),
          })
        }
        style={{
          border: "2px dashed #2563eb",
          background: "rgba(37,99,235,0.1)",
        }}
      >
        <div
          onMouseUp={openSignaturePad}
          onTouchEnd={(e) => {
            e.stopPropagation();
            openSignaturePad();
          }}
          style={{
            width: "100%",
            height: "100%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {signatureImg ? (
            <img
              src={signatureImg}
              alt="signature"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <span style={{ fontSize: 12, color: "#1e40af" }}>
              Sign Here
            </span>
          )}
        </div>
      </Rnd>

      {/* Signature Pad Modal */}
      {showPad && (
        <SignaturePad
          onSave={(img) => {
            setSignatureImg(img);
            setShowPad(false);
            setDragEnabled(true);
          }}
          onClose={() => {
            setShowPad(false);
            setDragEnabled(true);
          }}
        />
      )}

      {/* Download Button */}
      <button
        onClick={handleSignPdf}
        style={{
          marginTop: 20,
          padding: "10px 18px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Download Signed PDF
      </button>
    </div>
  );
}
