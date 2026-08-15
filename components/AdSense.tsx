// Plain server-rendered <script> so the tag is present in the raw HTML
// response — required for Google's AdSense site-ownership verification,
// which reads the served markup rather than executing client JS.
export function AdSense({ clientId }: { clientId: string }) {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
