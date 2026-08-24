import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import "./WikiViewer.css";

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/html";

export default function WikiViewer({
  initialTitle,
  onNavigate,
  onStep,
  onLoaded,
  className,
}) {
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => { onLoadedRef.current = onLoaded; }, [onLoaded]);

  // Wikipedia's article HTML writes internal links relative to /wiki/, e.g.
  // href="./Albert_Einstein#cite_note-1" — must resolve against that base,
  // not the bare domain, or every real link mis-resolves.
  function resolveWikiUrl(href) {
    if (!href) return null;
    try {
      return new URL(href, "https://en.wikipedia.org/wiki/");
    } catch {
      return null;
    }
  }

  function isInternalWikiLink(href) {
    const url = resolveWikiUrl(href);
    if (!url) return false;
    return (
      url.hostname === "en.wikipedia.org" &&
      url.pathname.startsWith("/wiki/") &&
      !url.pathname.includes(":")
    );
  }

  function titleFromHref(href) {
    const url = resolveWikiUrl(href);
    if (!url) return null;
    const path = url.pathname.replace(/^\/wiki\//, "");
    return path ? decodeURIComponent(path) : null;
  }

  function handleClick(e) {
    const anchor = e.target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!isInternalWikiLink(href)) return;
    const nextTitle = titleFromHref(href);
    if (!nextTitle) return;

    e.preventDefault();

    // Citation/footnote references link back to the current article plus a
    // fragment (e.g. "./Albert_Einstein#cite_note-1") — titleFromHref drops
    // the fragment, so without this check they'd reload the whole article
    // from scratch instead of just scrolling to the reference.
    const url = resolveWikiUrl(href);
    if (url.hash && nextTitle.toLowerCase() === currentTitle.toLowerCase()) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    console.log("[WikiViewer] Navigating to:", nextTitle);
    onStep?.({ from: currentTitle, to: nextTitle });
    onNavigate?.(nextTitle);
    setCurrentTitle(nextTitle);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      console.log("[WikiViewer] Loading page:", currentTitle);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${WIKI_API}/${encodeURIComponent(currentTitle)}`
        );
        if (!res.ok) throw new Error("Failed.");

        const rawHtml = await res.text();

        // Extract the canonical resolved title from the page's own metadata,
        // e.g. <link rel="dc:isVersionOf" href="//en.wikipedia.org/wiki/William_Shakespeare"/>.
        // Wikipedia's REST API doesn't send a Content-Location header on redirects, so a
        // page reached via an alias/redirect (e.g. "Shakespeare" -> "William_Shakespeare")
        // must be resolved from the HTML itself, or completion checks against a canonical
        // goal title would never match.
        let resolvedTitle = currentTitle;
        const versionMatch = rawHtml.match(/<link rel="dc:isVersionOf" href="[^"]*\/wiki\/([^"]+)"/);
        if (versionMatch) {
          resolvedTitle = decodeURIComponent(versionMatch[1]);
        }

        const cleanHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });

        if (!cancelled) {
          setHtml(cleanHtml);
          console.log("[WikiViewer] Resolved title:", resolvedTitle);
          onLoadedRef.current?.(resolvedTitle);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();
    return () => { cancelled = true; };
  }, [currentTitle]);

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
      <h3 style={{ marginBottom: 8, textAlign: "center", fontFamily: "'EB Garamond', serif", fontSize: "1.75rem", fontWeight: "bold" }}>
        {currentTitle.replace(/_/g, " ")}
      </h3>
      <div
        className="wiki-content"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
