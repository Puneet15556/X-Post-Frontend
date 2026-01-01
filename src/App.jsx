import { useState, useEffect } from "react";
import { startPost, resumePost } from "./api";

export default function App() {
  const [topic, setTopic] = useState("");
  const [feedback, setFeedback] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [status, setStatus] = useState("");
  const [post, setPost] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Sidebar & Key State
  const [showSidebar, setShowSidebar] = useState(false);
  const [userKeys, setUserKeys] = useState({
    "X-Twitter-Bearer": "",
    "X-Twitter-API-Key": "",
    "X-Twitter-API-Secret": "",
    "X-Twitter-Access-Token": "",
    "X-Twitter-Access-Secret": "",
    "X-Groq-API-Key": ""
  }); 

  // 💾 Load keys from local storage on startup
  useEffect(() => {
    const savedKeys = localStorage.getItem("twitter_mcp_keys");
    if (savedKeys) {
      const parsed = JSON.parse(savedKeys);
      setUserKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleKeyChange = (e) => {
    const updatedKeys = { ...userKeys, [e.target.name]: e.target.value };
    setUserKeys(updatedKeys);
  };

  // 💾 Save keys to local storage
  const saveKeys = () => {
    localStorage.setItem("twitter_mcp_keys", JSON.stringify(userKeys));
    setShowSidebar(false);
  };

  const normalizeStatus = (s) => s?.toLowerCase().replaceAll(" ", "_");
  const normalizedStatus = normalizeStatus(status);

  const isSuccess =
    normalizedStatus === "done" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "success" ||
    normalizedStatus === "post_sent";

  const isFeedback =
    !!threadId &&
    !isSuccess &&
    normalizedStatus !== "skipped" &&
    normalizedStatus !== "error" &&
    !reason.includes("429") && 
    !reason.toLowerCase().includes("error");

  /* -------------------- ACTIONS -------------------- */

  async function handleGenerate() {
    if (!topic.trim()) return;
    setTopic(""); 
    setStatus("");
    setPost("");
    setReason("");
    setError(null);
    setLoading(true);

    try {
      const res = await startPost(topic , userKeys);
      


      // 1. Extract the main message from your backend structure
      const data = res?.detail || res; 
      const backendMessage = data?.message || data?.reason || "An unexpected error occurred.";

      // 2. Handle Errors (Red Box)
      if (data?.status === "error" || data?.error_type === "RATE_LIMIT" || res?.status === 429) {
        setStatus("ERROR");
        setReason(backendMessage); 
        setError({ message: backendMessage });
        setLoading(false);
        return;
      }

      // 3. Handle Skips (Yellow Box)
      if (data?.status === "SKIPPED") {
        setStatus("SKIPPED");
        setReason(backendMessage); 
        setPost(data.post || ""); 
        setLoading(false);
        return;
      }

      setThreadId(res.thread_id || null);
      setStatus(res.status || data.status || "done");
      setPost(res.post_result || res.post || data.post || "");
      setReason(res.reason || data.message || "");
    } catch (err) {
      setError({ message: err?.message || "Network error", debug: "" });
    }
    setLoading(false);
  }

  async function handleResume() {
    if (!feedback.trim()) return;
    setFeedback("");
    setLoading(true);
    setError(null);

    try {
      const res = await resumePost(threadId, feedback , userKeys);


      // 1. Extract the main message from your backend structure
      const data = res?.detail || res; 
      const backendMessage = data?.message || data?.reason || "An unexpected error occurred.";

      // 2. Handle Errors (Red Box)
      if (data?.status === "error" || data?.error_type === "RATE_LIMIT" || res?.status === 429) {
        setStatus("ERROR");
        setReason(backendMessage); // This is the ONLY message that will show
        setError({ message: backendMessage });
        setLoading(false);
        return;
      }

      // 3. Handle Skips (Yellow Box)
      if (data?.status === "SKIPPED") {
        setStatus("SKIPPED");
        setReason(backendMessage); 
        setPost(data.post || ""); 
        setLoading(false);
        return;
      }

      setStatus(res.status || data.status);
      setPost(res.post_result || res.post || data.post || "");
      setReason(res.reason || data.message || "");
      setThreadId(res.thread_id || threadId);
    } catch (err) {
      setError({ message: err?.message || "Network error", debug: "" });
    }
    setLoading(false);
  }

  function handleNewPost() {
    setTopic("");
    setFeedback("");
    setThreadId(null);
    setStatus("");
    setPost("");
    setReason("");
    setError(null);
  }


  /* -------------------- UI -------------------- */

  return (
    <div style={styles.page}>
      
      {/* 🛠 API KEYS SIDEBAR */}
      <div style={{ ...styles.sidebar, right: showSidebar ? "0" : "-350px" }}>
        <h3 style={{ marginBottom: "10px", color: "#3b82f6" }}>Configuration</h3>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>Your keys are stored locally in your browser.</p>
        
        {Object.keys(userKeys).map((key) => (
          <div key={key} style={{ marginBottom: "15px" }}>
            <label style={styles.label}>{key.replaceAll("-", " ").replace("X ", "")}</label>
            <input
              type="password"
              name={key}
              style={styles.sidebarInput}
              value={userKeys[key]}
              onChange={handleKeyChange}
              placeholder="Paste key here..."
            />
          </div>
        ))}
        <button style={styles.closeBtn} onClick={saveKeys}>Save & Close</button>
      </div>

      {/* ⚙️ SIDEBAR TOGGLE */}
      <button style={styles.settingsBtn} onClick={() => setShowSidebar(true)}>⚙️ API Settings</button>

      <h1 style={styles.title}>X Post Generator</h1>

      <div style={styles.centerContainer}>
        <div style={styles.barWrapper}>
          <input
            style={styles.input}
            placeholder={isFeedback ? "Provide feedback to Modify this tweet OR TYPE: [OK OR GOOD] If Tweet is Ready to Post" : "What do you want to do? (Post Tweet about {TOPIC} / Search / Get_User_Tweet )"}
            value={isFeedback ? feedback : topic}
            onChange={(e) => isFeedback ? setFeedback(e.target.value) : setTopic(e.target.value)}
          />
          <button
            style={styles.generateButton}
            onClick={() => isFeedback ? handleResume() : handleGenerate()}
            disabled={loading}
          >
            {loading ? "⏳ Working..." : isFeedback ? "Generate" : "Generate"}
          </button>
        </div>
      </div>

      {/* 🟡 YELLOW WARNING BOX */}
      {status === "SKIPPED" && (
        <div style={styles.warningBox}>
          <div style={{ fontWeight: "700", marginBottom: "6px" }}>⚠️ Error 429 : ({reason})</div>
          <div style={{ marginBottom: "12px" }}>{post}</div>
          <button style={styles.newPostBtn} onClick={handleNewPost}>➕ New Post</button>
        </div>
      )}

      {/* 🔴 RED ERROR BOX */}
      {status === "ERROR" && !post && (
        <div style={styles.errorBox}>
          <div style={styles.errorTitle}>⚠️ Error Encountered</div>
          <div style={{ color: "#fff", fontWeight: "600" }}>{error?.message || reason}</div>
          <button style={styles.newPostBtn} onClick={handleNewPost}>🔄 Reset / New Post</button>
        </div>
      )}

      {/* 🟣 FEEDBACK CARD */}
      {post && isFeedback && (
        <div style={styles.outputCard}>
          <div style={styles.statusRow}>
            <span>Status:</span>
            <strong style={{ color: "#fbbf24" }}>Needs Feedback</strong>
          </div>
          <textarea readOnly value={post} style={styles.outputBox} />
          {reason && <div style={styles.reason}><strong>Reason:</strong> {reason}</div>}
          <button style={{...styles.newPostBtn, background: "#475569", marginTop: "20px"}} onClick={handleNewPost}>
             🏠 Start New Topic
          </button>
        </div>
      )}

      {/* ✅ SUCCESS OUTPUT */}
      {post && isSuccess && (
        <div style={styles.outputCard}>
          <div style={styles.statusRow}>
            <span>Status:</span>
            <strong style={{ color: "#22c55e" }}>{status.replaceAll("_", " ")}</strong>
          </div>
          <textarea readOnly value={post} style={styles.outputBox} />
          <button style={styles.newPostBtn} onClick={handleNewPost}>➕ New Post</button>
        </div>
      )}

      {/* ✅ Add the ToS Footer here, just before the end of the page div */}
      <div style={{ marginTop: "40px", paddingBottom: "20px", fontSize: "12px", opacity: 0.6 }}>
        <a 
          href="https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/TERMS_OF_SERVICE.md" 
          target="_blank" 
          rel="noreferrer"
          style={{ color: "#3b82f6", textDecoration: "none" }}
        >
          Terms of Service
        </a>
        <span style={{ margin: "0 10px", color: "#94a3b8" }}>|</span>
        <span style={{ color: "#94a3b8" }}>© 2026 X Post Generator</span>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", position: "relative", overflowX: "hidden", display: "flex", flexDirection: "column", alignItems: "center", color: "#fff", padding: "40px 20px", background: "radial-gradient(circle at top, #0f172a, #020617 70%)" },
  sidebar: { position: "fixed", top: 0, width: "320px", height: "100vh", background: "#0f172a", borderLeft: "1px solid #334155", padding: "30px", transition: "0.3s ease", zIndex: 1000, boxShadow: "-5px 0 25px rgba(0,0,0,0.6)" },
  sidebarInput: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#fff", marginTop: "5px", fontSize: "13px" },
  label: { fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" },
  settingsBtn: { position: "absolute", top: "20px", right: "20px", padding: "10px 15px", borderRadius: "8px", background: "#1e293b", border: "1px solid #334155", color: "#fff", cursor: "pointer", fontSize: "14px" },
  closeBtn: { width: "100%", marginTop: "30px", padding: "12px", borderRadius: "8px", background: "#3b82f6", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold" },
  title: { fontSize: "42px", fontWeight: "700", marginBottom: "20px" },
  centerContainer: { display: "flex", justifyContent: "center", width: "100%", marginTop: "50px", marginBottom: "50px" },
  barWrapper: { width: "100%", maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px" },
  input: { width: "100%", padding: "18px 22px", fontSize: "18px", borderRadius: "14px", background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", outline: "none" },
  generateButton: { width: "33%", minWidth: "180px", padding: "14px", fontSize: "18px", fontWeight: "600", borderRadius: "14px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", alignSelf: "center" },
  warningBox: { maxWidth: "900px", width: "100%", padding: "18px", borderRadius: "14px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", marginBottom: "40px", color: "#fde68a" },
  errorBox: { maxWidth: "900px", width: "100%", marginBottom: "40px", padding: "16px 18px", borderRadius: "14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" },
  errorTitle: { fontWeight: "700", color: "#fecaca", marginBottom: "6px" },
  outputCard: { width: "100%", maxWidth: "900px", background: "rgba(255,255,255,0.06)", borderRadius: "18px", padding: "22px", marginBottom: "40px", border: "1px solid rgba(255,255,255,0.12)" },
  statusRow: { display: "flex", gap: "10px", marginBottom: "10px" },
  outputBox: { width: "100%", minHeight: "140px", background: "#020617", color: "#fff", borderRadius: "12px", padding: "14px", fontSize: "15px", border: "1px solid rgba(255,255,255,0.12)", resize: "vertical" },
  reason: { marginTop: "10px", color: "#fbbf24", fontSize: "14px" },
  newPostBtn: { marginTop: "16px", padding: "10px 16px", borderRadius: "12px", border: "none", cursor: "pointer", background: "#334155", color: "#fff", fontSize: "14px" },
};