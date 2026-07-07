(() => {
  const header = document.querySelector('.site-header');
  const scrollTop = document.getElementById('scrollTop');

  const syncChrome = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header?.classList.toggle('is-scrolled', y > 20);
    scrollTop?.classList.toggle('is-visible', y > 520);
  };

  window.addEventListener('scroll', syncChrome, { passive: true });
  syncChrome();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (link.hasAttribute('data-media-filter')) return;

      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      const navCollapse = document.getElementById('mainNav');
      if (navCollapse?.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });
})();

/* Dynamic media grid hash filtering */
document.addEventListener('DOMContentLoaded', function () {
  const grid = document.querySelector('[data-media-grid]');
  if (!grid) return;

  const items = Array.from(document.querySelectorAll('.media-grid-item'));
  const title = document.querySelector('[data-media-title]');
  const filterLinks = Array.from(document.querySelectorAll('[data-media-filter]'));

  const titleCase = function (slug) {
    const active = filterLinks.find((link) => link.getAttribute('data-media-filter') === slug);
    if (active) return active.textContent.trim();
    return slug.split('-').map(function (part) {
      return part ? part.charAt(0).toUpperCase() + part.slice(1) : '';
    }).join(' ');
  };

  const cleanHash = function () {
    return (window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
  };

  const applyFilter = function (slug, updateHash) {
    const activeSlug = slug || 'articles';

    items.forEach(function (item) {
      const tags = (item.getAttribute('data-tags') || '').split(/\s+/);
      item.classList.toggle('is-hidden', !tags.includes(activeSlug));
    });

    filterLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-media-filter') === activeSlug);
    });

    if (title) title.textContent = titleCase(activeSlug);

    if (updateHash && window.location.hash !== '#' + activeSlug) {
      history.pushState(null, '', '#' + activeSlug);
    }
  };

  filterLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      applyFilter(link.getAttribute('data-media-filter'), true);

      const navCollapse = document.getElementById('mainNav');
      if (navCollapse?.classList.contains('show') && typeof bootstrap !== 'undefined') {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    });
  });

  window.addEventListener('hashchange', function () {
    applyFilter(cleanHash(), false);
  });

  applyFilter(cleanHash(), false);
});

/* Combined media modal for video and embedded podcast players */
document.addEventListener('DOMContentLoaded', function () {
  const videoModalEl = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoFrame');
  const videoTitle = document.getElementById('videoModalTitle');

  if (!videoModalEl || !videoFrame || typeof bootstrap === 'undefined') return;

  const videoModal = new bootstrap.Modal(videoModalEl);

  const openEmbed = function (url, title) {
    if (!url) return;
    videoFrame.setAttribute('src', url);
    if (videoTitle) videoTitle.textContent = title || 'Media';
    videoModal.show();
  };

  document.querySelectorAll('.video-play-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openEmbed(trigger.getAttribute('data-video'), trigger.getAttribute('data-media-title'));
    });
  });

  document.querySelectorAll('.podcast-embed-player').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openEmbed(trigger.getAttribute('data-embed'), trigger.getAttribute('data-media-title'));
    });
  });

  videoModalEl.addEventListener('hidden.bs.modal', function () {
    videoFrame.setAttribute('src', '');
    if (videoTitle) videoTitle.textContent = 'Media';
  });
});

/* podcasts.html inline audio players */
document.addEventListener('DOMContentLoaded', function () {
  const players = Array.from(document.querySelectorAll('.podcast-player')).filter(function (player) {
    return !!player.querySelector('audio');
  });
  if (!players.length) return;

  const formatTime = function (seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return mins + ':' + secs;
  };

  players.forEach(function (player) {
    const audio = player.querySelector('audio');
    const button = player.querySelector('.podcast-play-button');
    const icon = button ? button.querySelector('i') : null;
    const progress = player.querySelector('.podcast-progress');
    const current = player.querySelector('.podcast-current');
    const duration = player.querySelector('.podcast-duration');

    if (!audio || !button || !progress) return;

    button.addEventListener('click', function () {
      players.forEach(function (other) {
        const otherAudio = other.querySelector('audio');
        if (other !== player && otherAudio && !otherAudio.paused) {
          otherAudio.pause();
        }
      });

      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () {
      player.classList.add('is-playing');
      if (icon) {
        icon.classList.remove('bi-play-fill');
        icon.classList.add('bi-pause-fill');
      }
    });

    audio.addEventListener('pause', function () {
      player.classList.remove('is-playing');
      if (icon) {
        icon.classList.remove('bi-pause-fill');
        icon.classList.add('bi-play-fill');
      }
    });

    audio.addEventListener('loadedmetadata', function () {
      if (duration) duration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
      if (current) current.textContent = formatTime(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        progress.value = (audio.currentTime / audio.duration) * 100;
      }
    });

    audio.addEventListener('ended', function () {
      progress.value = 0;
      player.classList.remove('is-playing');
      if (icon) {
        icon.classList.remove('bi-pause-fill');
        icon.classList.add('bi-play-fill');
      }
    });

    progress.addEventListener('input', function () {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = (progress.value / 100) * audio.duration;
      }
    });
  });
});
