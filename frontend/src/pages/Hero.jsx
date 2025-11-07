import React from "react";

export default function Hero({ onStart }) {
  return (
    <section id="hero">
      <h1>Welcome to Job Fit Analyzer</h1>
      <p>Check how well your resume matches your dream job before you apply. Save time and improve your chances of getting shortlisted!</p>
      <div className="feature-circles">
        <div className="circle-card"><i className="fa-solid fa-key"></i><p>Keyword Match</p></div>
        <div className="circle-card"><i className="fa-solid fa-briefcase"></i><p>Skill Relevance</p></div>
        <div className="circle-card"><i className="fa-solid fa-chart-line"></i><p>ATS Score</p></div>
      </div>
      <button className="btn btn-success mt-4 px-4 py-2 fw-bold" onClick={onStart}>Get Started for Free</button>
    </section>
  );
}
