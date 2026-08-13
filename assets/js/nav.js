(function () {
  var navbar = document.getElementById('navbar');
  var toggle = document.getElementById('nav-toggle');
  if (!navbar || !toggle) return;

  toggle.addEventListener('click', function () {
    var open = navbar.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
})();

(function () {
  var zulu = document.getElementById('zulu-clock');
  if (!zulu) return;

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function tick() {
    var now = new Date();
    zulu.textContent = pad(now.getUTCDate()) + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + 'Z';
  }

  tick();
  setInterval(tick, 1000);
})();
