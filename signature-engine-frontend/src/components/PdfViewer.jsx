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

function browserToPdfCoords(box, pdfWidth, pdfHeight) {
  const boxWidth = box.widthPercent * pdfWidth;
  const boxHeight = box.heightPercent * pdfHeight;

  const x = box.xPercent * pdfWidth;
  const y =
    pdfHeight -
    box.yPercent * pdfHeight -
    boxHeight;

  return {
    x,
    y,
    width: boxWidth,
    height: boxHeight,
  };
}

export default function PdfViewer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pageWidth, setPageWidth] = useState(600);

  // 🔥 Signature pad state
  const [showPad, setShowPad] = useState(false);
  const [signatureImg, setSignatureImg] = useState(null);

  // 🔥 Signature box (percentage-based)
  const [box, setBox] = useState({
    xPercent: 0.3,
    yPercent: 0.4,
    widthPercent: 0.2,
    heightPercent: 0.08,
  });

  const PDF_WIDTH = 595;
  const PDF_HEIGHT = 842;

  const handleLogCoords = () => {
  const pdfCoords = browserToPdfCoords(
        box,
        PDF_WIDTH,
        PDF_HEIGHT
    );

    console.log("PDF COORDINATES:", pdfCoords);
 };



  // 🔥 Responsive PDF width
  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      setPageWidth(Math.min(containerWidth, MAX_PDF_WIDTH));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 🔥 Render PDF safely
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

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const task = page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      });

      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(err);
        }
      }
    };

    if (pageWidth) renderPDF();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pageWidth]);

    const handleSignPdf = async () => {
    const payload = {
        pdfId: "sample.pdf",
        signature: signatureImg, // base64 image
        coords: browserToPdfCoords(box, PDF_WIDTH, PDF_HEIGHT),
    };

    const res = await fetch("http://localhost:4000/sign-pdf", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("SIGNED PDF URL:", data.url);

    // optional: open signed pdf
    window.open(`http://localhost:4000${data.url}`, "_blank");
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

      {/* Signature Placeholder */}
      <Rnd
        size={{
          width: box.widthPercent * pageWidth,
          height: box.heightPercent * pageWidth * A4_RATIO,
        }}
        position={{
          x: box.xPercent * pageWidth,
          y: box.yPercent * pageWidth * A4_RATIO,
        }}
        bounds="parent"
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
          onClick={() => setShowPad(true)}
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
          onSave={(img) => setSignatureImg(img)}
          onClose={() => setShowPad(false)}
        />
      )}

      <button
        onClick={handleSignPdf}
        style={{
            marginTop: 20,
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
        }}
        >
         Download Signed PDF
      </button>


    </div>
    
  );
}
