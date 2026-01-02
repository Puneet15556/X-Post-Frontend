# X Post Generator – Frontend

A production-ready web application that generates, searches, and resumes X (Twitter) posts using AI-powered workflows.

🔗 **Live App**: https://x-post-frontend-iota.vercel.app  


---

## 🚀 Features

- ✨ Generate high-quality X posts using AI
- 🔍 Search tweets by topic or entity
- 🧵 Resume tweet generation with human feedback
- 🔐 User-provided API keys (no secrets stored)
- ⚡ Fast, responsive UI built with Vite + React
- 🌍 Fully deployed on Vercel

---

## 🧠 How It Works

1. User enters a prompt or search intent
2. Frontend sends request to backend API
3. Backend runs an AI + workflow pipeline
4. Result is streamed back and displayed
5. Users can refine results via feedback

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, JavaScript
- **Deployment**: Vercel
- **State Management**: React Hooks
- **API Communication**: Fetch API
- **Styling**: Custom CSS / UI components

---

## 🔑 Environment Variables
VITE_API_BASE_URL=https://x-post-backend.onrender.com


## 🚦 Error Handling

- Twitter/X API rate limits are handled gracefully
- Backend failures do not crash the UI
- Clear user-facing error messages are displayed
- Retry and reset options are provided to the user

---

## 📦 Deployment

- Hosted on **Vercel**
- Auto-deploy enabled on every push to `main`
- Preview deployments enabled for pull requests
- Environment variables securely managed via Vercel Dashboard

---


## 👤 Author

**Puneet Ranjan**  
Electronics + AI/ML 

