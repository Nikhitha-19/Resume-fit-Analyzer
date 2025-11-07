import React from "react";

export default function Navbar({ step, setStep }) {
  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        <a className="navbar-brand" href="#" onClick={() => setStep(0)}>
          <i className="fa-solid fa-briefcase"></i> Job Fit Analyzer
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navMenu">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className={`nav-link ${step === 0 ? "active" : ""}`} href="#" onClick={() => setStep(0)}>Home</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${step === 1 ? "active" : ""}`} href="#" onClick={() => setStep(1)}>Login</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${step === 2 ? "active" : ""}`} href="#" onClick={() => setStep(2)}>Job Description</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${step === 3 ? "active" : ""}`} href="#" onClick={() => setStep(3)}>Resume</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${step === 4 ? "active" : ""}`} href="#" onClick={() => setStep(4)}>Results</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
