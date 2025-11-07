# Simple matching logic
def match_resume_to_jd(resume_data, jd_data):
    matched_skills = set(resume_data["skills"]) & set(jd_data["required_skills"])
    score = len(matched_skills) / len(jd_data["required_skills"]) * 100
    return {"matched_skills": list(matched_skills), "score": score}
