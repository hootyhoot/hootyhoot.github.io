(function () {
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      applyRepoStatTheme();
    });
  }
})();

// Repo stat images (repositories page) come from an external API with a
// separate light/dark render for each theme. Only fetch the one the
// current theme actually needs, instead of loading both up front.
function applyRepoStatTheme() {
  var imgs = document.querySelectorAll('.repo-stat-img');
  if (!imgs.length) return;
  var theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  imgs.forEach(function (img) {
    var next = theme === 'light' ? img.dataset.srcLight : img.dataset.srcDark;
    if (img.src !== next) img.src = next;
  });
}
applyRepoStatTheme();

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
