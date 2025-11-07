import React, { useState } from "react";
import Result from "./pages/Result.jsx";
import axios from "axios";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [step, setStep] = useState(0); // 0 hero,1 auth,2 upload JD,3 upload resume,4 result
  const [isRegister, setIsRegister] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [atsResult, setAtsResult] = useState(null);

  const API = axios.create({ baseURL: "http://localhost:5000" });

  // Register or Login
  const handleAuth = async () => {
    setLoginError("");
    if (!username || !password) return setLoginError("Enter both fields");
    try {
      if (isRegister) {
        await API.post("/register", { username, password });
        alert("Registered. Please login.");
        setIsRegister(false);
      } else {
        const res = await API.post("/login", { username, password });
        const userId = res.data.userId;
        setToken(userId);
        setStep(2);
      }
    } catch (e) {
      setLoginError(e?.response?.data?.error || "Auth error");
    }
  };

  // JD select
  const handleJdChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx", "txt"].includes(ext)) {
      alert("Invalid JD file type");
      return;
    }
    setJdFile(f);
  };

  // Resume select
  const handleResumeChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("Resume must be PDF");
      return;
    }
    setResumeFile(f);
  };

  // Upload JD
  const uploadJobToServer = async () => {
    if (!jdFile) return;
    const form = new FormData();
    form.append("job", jdFile);
    await axios.post("http://localhost:5000/api/job", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Upload resume and analyze
  const uploadResumeAndAnalyze = async () => {
    if (!resumeFile) return alert("Select resume");
    if (!jdFile) return alert("Select job description");

    try {
      const form = new FormData();
      form.append("userId", token);
      form.append("jobFile", jdFile);
      form.append("resumeFile", resumeFile);

      const res = await API.post("/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAtsResult(res.data);
      setStep(4);
    } catch (e) {
      alert("Analyze failed: " + (e?.response?.data?.error || e.message));
    }
  };

  return (
    <>
      {/* ✅ Navbar */}
      <Navbar step={step} setStep={setStep} />

      {/* HERO */}
      {step === 0 && (
        <section id="hero">
          <h1>Welcome to Job Fit Analyzer</h1>
          <p>Check how well your resume matches your dream job before you apply.</p>
          <div className="feature-circles">
            <div className="circle-card">
              <i className="fa-solid fa-key"></i>
              <p>Keyword Match</p>
            </div>
            <div className="circle-card">
              <i className="fa-solid fa-briefcase"></i>
              <p>Skill Relevance</p>
            </div>
            <div className="circle-card">
              <i className="fa-solid fa-chart-line"></i>
              <p>ATS Score</p>
            </div>
          </div>
          <button className="btn btn-success mt-4" onClick={() => setStep(1)}>
            Get Started for Free
          </button>
        </section>
      )}

      {/* AUTH (Login/Register toggle) */}
      {step === 1 && (
        <section id="step1" className="section">
          <div className="card text-center">
            <h2>
              <i className="fa-solid fa-user"></i> {isRegister ? "Sign Up" : "Login"}
            </h2>

            <input
              className="form-control mb-2"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="btn btn-primary w-100 mb-2" onClick={handleAuth}>
              {isRegister ? "Sign Up" : "Login"}
            </button>
            {loginError && <div className="text-danger">{loginError}</div>}

            <p className="mt-2">
              {isRegister ? "Already have an account?" : "New user?"}
              <span
                style={{ color: "var(--primary)", cursor: "pointer", marginLeft: 6 }}
                onClick={() => {
                  setIsRegister(!isRegister);
                  setLoginError("");
                }}
              >
                {isRegister ? " Login" : " Sign Up"}
              </span>
            </p>
          </div>
        </section>
      )}

      {/* UPLOAD JD */}
      {step === 2 && (
        <section id="step2" className="section">
          <div className="card text-center">
            <h2>
              <i className="fa-solid fa-file-alt"></i> Upload Job Description
            </h2>
            <div className="dropzone">
              <input
                className="drop-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleJdChange}
              />
              <div>
                <i className="fa-solid fa-cloud-arrow-up fa-2x mb-2 text-primary"></i>
                <br />
                Drop file here or click to browse
              </div>
              <small className="text-muted d-block mt-2">
                PDF, DOC, DOCX, TXT only
              </small>
              <div className="file-preview">
                {jdFile && <span>{jdFile.name}</span>}
              </div>
            </div>
            <button
              className="btn btn-primary mt-3 w-100"
              onClick={() => setStep(3)}
              disabled={!jdFile}
            >
              Next: Upload Resume
            </button>
          </div>
        </section>
      )}

      {/* UPLOAD RESUME */}
      {step === 3 && (
        <section id="step3" className="section">
          <div className="card text-center">
            <h2>
              <i className="fa-solid fa-file"></i> Upload Resume
            </h2>
            <div className="dropzone">
              <input
                className="drop-input"
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
              />
              <div>
                <i className="fa-solid fa-upload fa-2x mb-2 text-primary"></i>
                <br />
                Drop PDF here or click to browse
              </div>
              <small className="text-muted d-block mt-2">PDF only</small>
              <div className="file-preview">
                {resumeFile && <span>{resumeFile.name}</span>}
              </div>
            </div>
            <button
              className="btn btn-primary mt-3 w-100"
              onClick={uploadResumeAndAnalyze}
              disabled={!resumeFile}
            >
              Analyze
            </button>
          </div>
        </section>
      )}

      {/* RESULTS */}
      {step === 4 && atsResult && <Result result={atsResult} />}

      {/* ✅ Footer */}
      <Footer />
    </>
  );
}
