// Write-up image viewer: clicking a figure opens it in a pixel "OS window"
// (same chrome as the code blocks). Red closes, yellow zooms out, green zooms
// in. Wheel / pinch / double-click zoom, drag to pan, Esc or a click outside
// closes. Without JS the figure link still opens the image in a new tab.
(function () {
  var links = document.querySelectorAll('a.figure-link');
  if (!links.length) return;

  var MIN = 1, MAX = 8, STEP = 1.5;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var overlay = document.createElement('div');
  overlay.className = 'viewer';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="viewer-window">' +
      '<div class="viewer-bar">' +
        '<button type="button" class="viewer-btn viewer-close" aria-label="Close"></button>' +
        '<button type="button" class="viewer-btn viewer-out" aria-label="Zoom out"></button>' +
        '<button type="button" class="viewer-btn viewer-in" aria-label="Zoom in"></button>' +
        '<span class="viewer-title"></span>' +
        '<span class="viewer-zoom">100%</span>' +
      '</div>' +
      '<div class="viewer-stage"><img alt="" draggable="false"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var win = overlay.querySelector('.viewer-window');
  var bar = overlay.querySelector('.viewer-bar');
  var stage = overlay.querySelector('.viewer-stage');
  var img = stage.querySelector('img');
  var title = overlay.querySelector('.viewer-title');
  var zoomLabel = overlay.querySelector('.viewer-zoom');

  var scale = 1, tx = 0, ty = 0, fitW = 0, fitH = 0, lastFocus = null;

  // size the window to the image's aspect ratio, as large as the viewport allows
  function fit() {
    var nw = img.naturalWidth || 1, nh = img.naturalHeight || 1;
    var maxW = window.innerWidth * 0.94, maxH = window.innerHeight * 0.9 - bar.offsetHeight;
    var k = Math.min(maxW / nw, maxH / nh, 1);
    fitW = Math.round(nw * k); fitH = Math.round(nh * k);
    stage.style.width = fitW + 'px'; stage.style.height = fitH + 'px';
    img.style.width = fitW + 'px'; img.style.height = fitH + 'px';
    clamp(); apply();
  }

  // keep the zoomed image covering the stage (no panning into empty space)
  function clamp() {
    var mx = (fitW * scale - fitW) / 2, my = (fitH * scale - fitH) / 2;
    tx = Math.max(-mx, Math.min(mx, tx));
    ty = Math.max(-my, Math.min(my, ty));
  }

  function apply() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    zoomLabel.textContent = Math.round(scale * 100) + '%';
    stage.classList.toggle('is-zoomed', scale > 1);
  }

  // zoom to `next`, keeping the point (px, py) - relative to the stage centre - still
  function zoomTo(next, px, py) {
    next = Math.max(MIN, Math.min(MAX, next));
    px = px || 0; py = py || 0;
    tx = px - (px - tx) * (next / scale);
    ty = py - (py - ty) * (next / scale);
    scale = next;
    clamp(); apply();
  }

  function centreOffset(clientX, clientY) {
    var r = stage.getBoundingClientRect();
    return [clientX - r.left - r.width / 2, clientY - r.top - r.height / 2];
  }

  function open(link) {
    var thumb = link.querySelector('img');
    lastFocus = document.activeElement;
    scale = 1; tx = 0; ty = 0;
    title.textContent = (thumb && thumb.alt) || '';
    overlay.setAttribute('aria-label', title.textContent || 'Image');
    img.alt = title.textContent;
    img.onload = fit;
    img.src = link.getAttribute('href');
    overlay.hidden = false;
    document.documentElement.classList.add('viewer-open');
    if (img.complete && img.naturalWidth) fit();
    if (!reduce) { win.classList.remove('is-opening'); void win.offsetWidth; win.classList.add('is-opening'); }
    overlay.querySelector('.viewer-close').focus();
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.classList.remove('viewer-open');
    img.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      // let modified clicks (new tab / window) through
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(this);
    });
  }

  overlay.querySelector('.viewer-close').addEventListener('click', close);
  overlay.querySelector('.viewer-in').addEventListener('click', function () { zoomTo(scale * STEP); });
  overlay.querySelector('.viewer-out').addEventListener('click', function () { zoomTo(scale / STEP); });

  // a click on the dimmed backdrop (not the window) closes
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === '+' || e.key === '=') zoomTo(scale * STEP);
    else if (e.key === '-' || e.key === '_') zoomTo(scale / STEP);
    else if (e.key === '0') zoomTo(1);
    else if (e.key === 'Tab') {
      // keep focus inside the window
      var btns = overlay.querySelectorAll('.viewer-btn');
      var first = btns[0], last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = centreOffset(e.clientX, e.clientY);
    zoomTo(scale * Math.exp(-e.deltaY * 0.0015), p[0], p[1]);
  }, { passive: false });

  stage.addEventListener('dblclick', function (e) {
    var p = centreOffset(e.clientX, e.clientY);
    zoomTo(scale > 1 ? 1 : 2.5, p[0], p[1]);
  });

  // drag to pan, two fingers to pinch-zoom
  var pointers = {}, pinchDist = 0, pinchScale = 1;
  function count() { return Object.keys(pointers).length; }
  function pair() { var k = Object.keys(pointers); return [pointers[k[0]], pointers[k[1]]]; }

  stage.addEventListener('pointerdown', function (e) {
    stage.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (count() === 2) {
      var p = pair();
      pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      pinchScale = scale;
    }
    stage.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', function (e) {
    var prev = pointers[e.pointerId];
    if (!prev) return;
    var cur = { x: e.clientX, y: e.clientY };
    if (count() === 2) {
      pointers[e.pointerId] = cur;
      var p = pair();
      var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      var mid = centreOffset((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
      if (pinchDist) zoomTo(pinchScale * d / pinchDist, mid[0], mid[1]);
      return;
    }
    tx += cur.x - prev.x; ty += cur.y - prev.y;
    pointers[e.pointerId] = cur;
    clamp(); apply();
  });

  function release(e) {
    delete pointers[e.pointerId];
    pinchDist = 0;
    if (!count()) stage.classList.remove('is-dragging');
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  window.addEventListener('resize', function () { if (!overlay.hidden) fit(); });
})();
