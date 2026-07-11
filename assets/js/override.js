/* Lightweight scroll parallax — works on mobile (CSS background-attachment:fixed does not).
   Targets .quote-band and .contact-hero; shifts the image layer's Y as the section scrolls. */
(function () {
  var els = [].slice.call(document.querySelectorAll('.quote-band, .contact-hero'));
  if (!els.length) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var AMP = 48, ticking = false;
  function update() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < els.length; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var center = r.top + r.height / 2;
      var off = ((center - vh / 2) / vh) * -AMP;   // moves opposite to scroll
      el.style.backgroundPositionY = 'calc(50% + ' + off.toFixed(1) + 'px)';
    }
    ticking = false;
  }
  function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
