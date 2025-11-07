import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Analyzing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/result");
    }, 2000); // simulate analysis delay
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="analyzing-container">
      <h2>Analyzing...</h2>
      <div className="loader"></div>
    </div>
  );
}
