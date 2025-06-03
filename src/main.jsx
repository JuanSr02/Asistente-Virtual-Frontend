import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"

// Este es el punto de entrada de tu aplicación React
// ReactDOM.createRoot crea la raíz donde se montará tu app
// El elemento con id 'root' debe existir en tu HTML
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
