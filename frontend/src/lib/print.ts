/**
 * Prints one element (a receipt, a fee statement) instead of the whole page: copies its markup into
 * a hidden iframe along with the app's stylesheets, so the Tailwind classes it uses still apply,
 * then opens the browser's print dialog for just that iframe.
 */
export function printElement(element: HTMLElement | null, title: string): void {
  if (!element) return;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0',
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, '&lt;')}</title>
    ${styles}
    <style>
      @page { margin: 12mm; }
      body { background: #fff !important; color: #0f172a; padding: 0; margin: 0; }
      [data-print-hide] { display: none !important; }
    </style>
  </head>
  <body>${element.outerHTML}</body>
</html>`);
  doc.close();

  const cleanup = () => setTimeout(() => iframe.remove(), 500);
  // Wait for the copied stylesheets to load before printing, or the output comes out unstyled.
  const run = () => {
    win.focus();
    win.print();
    cleanup();
  };
  if (doc.readyState === 'complete') {
    setTimeout(run, 250);
  } else {
    iframe.addEventListener('load', () => setTimeout(run, 100), { once: true });
  }
}
