import React, { useState } from "react";

export default function UploadResume({ resumeFile, setResumeFile, onAnalyze }) {
  const [ready, setReady] = useState(false);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if(!f || f.type!=='application/pdf'){ alert('PDF only'); return; }
    setResumeFile(f);
    setReady(true);
  }

  const handleAnalyze = () => {
    // simulate result
    const overall = Math.floor(Math.random() * (92-65+1))+65;
    const kw = Math.max(30, Math.min(100, Math.floor(Math.random()*(overall+4-(overall-8)+1)+(overall-8))));
    const skill = Math.max(30, Math.min(100, Math.floor(Math.random()*(overall+6-(overall-10)+1)+(overall-10))));
    const format = Math.max(20, Math.min(100, Math.floor(Math.random()*(95-55+1)+55)));
    const read = Math.max(25, Math.min(100, Math.floor(Math.random()*(95-50+1)+50)));
    onAnalyze({ overall, keyword: kw, skill, format, readability: read });
  }

  return (
    <section id="step3" className="section">
      <div className="card text-center">
        <h2><i className="fa-solid fa-file"></i> Upload Resume</h2>
        <div className="dropzone">
          <input type="file" className="drop-input" accept=".pdf" onChange={handleChange} />
          <div><i className="fa-solid fa-upload fa-2x mb-2 text-primary"></i><br/>Drop PDF here or click to browse</div>
          <small className="text-muted d-block mt-2">PDF only</small>
          <div className="file-preview">{resumeFile && <span>{resumeFile.name}</span>}</div>
        </div>
        <button className="btn btn-primary mt-3 w-100" onClick={handleAnalyze} disabled={!ready}>Analyze</button>
      </div>
    </section>
  );
}
