/* Scroll parallax that works on mobile (CSS background-attachment:fixed does not).
   Moves a taller-than-container .px-layer with transform as its section scrolls. */
(function () {
  var layers = [].slice.call(document.querySelectorAll('.px-layer'));
  if (!layers.length) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SPEED = 0.28, ticking = false;
  function update() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < layers.length; i++) {
      var l = layers[i], sec = l.parentElement, r = sec.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) continue;
      var shift = (vh / 2 - (r.top + r.height / 2)) * SPEED;
      l.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
