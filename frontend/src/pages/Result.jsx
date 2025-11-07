import React, { useEffect, useState } from "react";

export default function Result({ result }) {
  const [score, setScore] = useState({ overall: "--", keyword: "--", skill: "--", format: "--", readability: "--" });

  useEffect(() => {
    if(result) setScore(result);
  }, [result]);

  const barColor = (val) => val<30?'#f87171':val<50?'#facc15':val<90?'#22c55e':'#4ade80';

  return (
    <section id="step4" className="section">
      <div className="card">
        <h2 className="text-center"><i className="fa-solid fa-chart-line"></i> ATS Result</h2>
        <div className="results-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="ats-score-card">
              <h5>ATS Score</h5>
              <h5>Overall match with job description</h5>
              
            </div>
            <div className="score-circle">{score.overall}%</div>
          </div>

          {[['Keyword Match','keyword'],['Skill Relevance','skill'],['Formatting','format'],['Readability','readability']].map(([label,key],i)=>(
            <div className="mb-3" key={i}>
              <div className="d-flex justify-content-between mb-1">
                <small>{label}</small>
                <small>{score[key]}%</small>
              </div>
              <div className="progress" style={{height:'10px'}}>
                <div className="progress-bar" style={{width:`${score[key]}%`,background:barColor(score[key])}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
