document.addEventListener('DOMContentLoaded', () => {
  // Suche alle Header-Permalinks (#-Symbol)
  document.querySelectorAll('a.headerlink').forEach((a) => {
    const h = a.parentElement; // h1/h2/...
    // Viele Themes setzen das explizite Label als <span id="..."> direkt vor die Überschrift
    const span = h && h.previousElementSibling;
    if (span && span.tagName === 'SPAN' && span.id) {
      a.setAttribute('href', '#' + span.id); // z.B. #base-data-course
    }
  });
});
