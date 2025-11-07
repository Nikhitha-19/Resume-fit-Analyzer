import React from "react";

export default function SideProgress({ step }) {
  return (
    <div className="side-progress">
      {[0,1,2,3,4].map((s,i)=>(
        <div key={i} className={`step-indicator ${step>=i?'active':''}`} data-step={i+1}></div>
      ))}
    </div>
  );
}
