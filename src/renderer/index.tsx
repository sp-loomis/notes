import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Create root element for React
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);

// Render our app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
