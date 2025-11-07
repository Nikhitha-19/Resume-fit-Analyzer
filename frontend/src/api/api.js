const API_BASE_URL = "http://127.0.0.1:5000"; // backend URL

export async function analyzeResume(formData) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });
  return await response.json();
}
