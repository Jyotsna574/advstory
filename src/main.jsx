import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const App = lazy(() => import("./App.jsx"));

function LoadingShell() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        margin: 0,
        background:
          "linear-gradient(160deg, #1a0533 0%, #3b0f6e 22%, #6d2fa0 44%, #c2549a 64%, #f4845f 82%, #fcd38a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "system-ui, Segoe UI, sans-serif",
        fontSize: "1.1rem",
        fontWeight: 700,
        textAlign: "center",
        padding: 24,
      }}
    >
      Loading your adventure…
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingShell />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
