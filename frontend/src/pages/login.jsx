import React, { useState } from "react";

export default function Login({ onSuccess }) {
  const [error, setError] = useState(false);
  const correctUser = 'user123';
  const correctPass = 'pass123';

  const handleLogin = () => {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(u===correctUser && p===correctPass){
      setError(false);
      onSuccess();
    } else setError(true);
  }

  return (
    <section id="step1" className="section bg-dark">
      <div className="card text-center">
        <h2><i className="fa-solid fa-user"></i> Login</h2>
        <input type="text" id="username" className="form-control mb-3" placeholder="Username" />
        <input type="password" id="password" className="form-control mb-3" placeholder="Password" />
        <button className="btn btn-primary w-100" onClick={handleLogin}>Login</button>
        {error && <div className="text-danger mt-2">Invalid credentials</div>}
      </div>
    </section>
  );
}
