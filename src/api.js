const API_BASE = "https://x-post-backend.onrender.com";

/**
 * Helper to get keys from local storage (Optional if passing via arguments)
 */
const getStoredKeys = () => {
  const saved = localStorage.getItem("twitter_mcp_keys");
  return saved ? JSON.parse(saved) : {};
};

/**
 * Starts the generation process.
 */
export async function startPost(topic, userKeys) {
  // 🛑 REMOVED: const userKeys = getStoredKeys(); 
  // We use the 'userKeys' passed from App.jsx instead.
  
  try {
    const res = await fetch(`${API_BASE}/generate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-twitter-bearer": userKeys["X-Twitter-Bearer"] || "",
        "x-twitter-api-key": userKeys["X-Twitter-API-Key"] || "",
        "x-twitter-api-secret": userKeys["X-Twitter-API-Secret"] || "",
        "x-twitter-access-token": userKeys["X-Twitter-Access-Token"] || "",
        "x-twitter-access-secret": userKeys["X-Twitter-Access-Secret"] || "",
        "x-groq-api-key": userKeys["X-Groq-API-Key"] || ""
      },
      body: JSON.stringify({ input: topic }),
    });

    return await res.json();
  } catch (error) {
    console.error("API startPost Error:", error);
    return { status: "ERROR", reason: "Could not connect to backend." };
  }
}

/**
 * Resumes the process with feedback.
 */
export async function resumePost(threadId, feedback, userKeys) {
  // Use the userKeys passed from App.jsx for consistency
  try {
    const res = await fetch(`${API_BASE}/resume/${threadId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-twitter-bearer": userKeys["X-Twitter-Bearer"] || "",
        "x-twitter-api-key": userKeys["X-Twitter-API-Key"] || "",
        "x-twitter-api-secret": userKeys["X-Twitter-API-Secret"] || "",
        "x-twitter-access-token": userKeys["X-Twitter-Access-Token"] || "",
        "x-twitter-access-secret": userKeys["X-Twitter-Access-Secret"] || "",
        "x-groq-api-key": userKeys["X-Groq-API-Key"] || ""
      },
      body: JSON.stringify({ feedback }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        return { status: "ERROR", reason: errorData.detail || "Server error occurred." };
    }

    return await res.json();
  } catch (error) {
    console.error("API resumePost Error:", error);
    return { status: "ERROR", reason: "Could not connect to backend." };
  }
}
