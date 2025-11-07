import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./theme.css"; // your custom CSS
import "bootstrap/dist/css/bootstrap.min.css"; // bootstrap if needed
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
