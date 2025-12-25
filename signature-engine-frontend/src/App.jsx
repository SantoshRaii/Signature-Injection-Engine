// import PdfViewer from "./components/PdfViewer";

// function App() {
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#111827", // dark background (PDF viewer style)
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         paddingTop: 30,
//       }}
//     >
//       {/* Header */}
//       <h2
//         style={{
//           color: "#ffffff",
//           marginBottom: 20,
//         }}
//       >
//         Signature Injection Engine
//       </h2>

//       {/* PDF Viewer */}
//       <PdfViewer />
//     </div>
//   );
// }

// export default App;
import PdfViewer from "./components/PdfViewer";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#0f172a", // dark blue-gray
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 0",
          color: "#fff",
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        Signature Injection Engine
      </div>

      {/* Viewer wrapper (important) */}
      <div
        style={{
          flex: 1,                 // 🔥 key line
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingBottom: 40,
        }}
      >
        <PdfViewer />
      </div>
    </div>
  );
}

export default App;
