
export default function Home() {
  return (
    <main>
      <h2>Test App</h2>
      <p><a href="/analytics">/analytics</a></p>
      <p><a href="/api/passthru">/api/passthru</a></p>
      <p><a href="/api/simple/content">/api/simple/content</a></p>
      <p><a href="/api/complex/12345/endpoint/?utm=campaign">/api/complex/12345/endpoint/?utm=campaign</a></p>
      <p><a href="/blog/passthru">/blog/passthru</a></p>
      <p><a href="/blog/simple/content">/blog/simple/content</a></p>
      <p><a href="/blog/complex/12345/article/?utm=campaign">/blog/complex/12345/article/?utm=campaign</a></p>
    </main>
  );
}
