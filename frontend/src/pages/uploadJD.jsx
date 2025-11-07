import React from "react";

export default function UploadJD({ jdFile, setJdFile, onNext }) {
  const handleChange = (e) => {
    const f = e.target.files[0];
    if(!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if(!['pdf','doc','docx','txt'].includes(ext)){ alert('Invalid file'); return; }
    setJdFile(f);
  }

  return (
    <section id="step2" className="section">
      <div className="card text-center">
        <h2><i className="fa-solid fa-file-alt"></i> Upload Job Description</h2>
        <div className="dropzone">
          <input type="file" className="drop-input" accept=".pdf,.doc,.docx,.txt" onChange={handleChange} />
          <div><i className="fa-solid fa-cloud-arrow-up fa-2x mb-2 text-primary"></i><br/>Drop file here or click to browse</div>
          <small className="text-muted d-block mt-2">PDF, DOC, DOCX, TXT only</small>
          <div className="file-preview">{jdFile && <span>{jdFile.name}</span>}</div>
        </div>
        <button className="btn btn-primary mt-3 w-100" onClick={onNext} disabled={!jdFile}>Next: Upload Resume</button>
      </div>
    </section>
  );
}
