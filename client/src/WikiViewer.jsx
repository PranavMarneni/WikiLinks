import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import "./WikiViewer.css";

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/html";

export default function WikiViewer({
  initialTitle,
  // targetTitle,
  // onNavigate,
  // onStep,
  onLoaded,
  className,
}) {
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${WIKI_API}/${encodeURIComponent(currentTitle)}`
        );
        if (!res.ok) throw new Error("Failed.");

        const rawHtml = await res.text();
        const cleanHtml = DOMPurify.sanitize(rawHtml);

        if (!cancelled) {
          setHtml(cleanHtml);
          onLoaded?.(currentTitle);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();
    return () => {
      cancelled = true;
    };
}, [currentTitle, onLoaded]);

  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <div className="wiki-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => setCurrentTitle(currentTitle)}>Retry</button>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 style={{ marginBottom: 8 }}>
        {currentTitle.replace(/_/g, " ")}
      </h3>

      <div
        className="wiki-content"
        //onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}