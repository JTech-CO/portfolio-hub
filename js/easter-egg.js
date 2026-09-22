(function () {
  'use strict';

  var PHYSICAL_SEQUENCE = ['KeyD', 'KeyL', 'KeyT', 'KeyM', 'KeyX', 'KeyJ', 'KeyD', 'KeyP', 'KeyR', 'KeyM'];
  var physicalBuffer = [];
  var running = false;

  function sleep(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  function waitForPortfolio(timeoutMs) {
    var started = Date.now();
    return new Promise(function (resolve) {
      function check() {
        var items = window.PortfolioRuntime && window.PortfolioRuntime.getItems
          ? window.PortfolioRuntime.getItems()
          : [];
        if (items.length || Date.now() - started >= timeoutMs) {
          resolve(items);
          return;
        }
        window.setTimeout(check, 80);
      }
      check();
    });
  }

  function normalizeRepoUrl(value) {
    return String(value || '')
      .replace(/\/+$/, '')
      .toLowerCase();
  }

  function fallbackLatest(items) {
    return items
      .filter(function (item) { return item.repoUrl; })
      .slice()
      .sort(function (a, b) {
        return (b.updatedAt || '').localeCompare(a.updatedAt || '') || a.name.localeCompare(b.name);
      })[0] || null;
  }

  function resolveLatestProject(items) {
    var fallback = fallbackLatest(items);
    if (!items.length || !window.fetch) return Promise.resolve(fallback);

    var byRepoUrl = new Map();
    items.forEach(function (item) {
      if (item.repoUrl) byRepoUrl.set(normalizeRepoUrl(item.repoUrl), item);
    });

    return fetch('https://api.github.com/users/JTech-CO/repos?sort=pushed&direction=desc&per_page=100&type=owner', {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store'
    }).then(function (response) {
      if (!response.ok) throw new Error('GitHub API ' + response.status);
      return response.json();
    }).then(function (repos) {
      if (!Array.isArray(repos)) return fallback;
      repos.sort(function (a, b) {
        return String(b.pushed_at || b.updated_at || '').localeCompare(String(a.pushed_at || a.updated_at || ''));
      });
      for (var i = 0; i < repos.length; i += 1) {
        var item = byRepoUrl.get(normalizeRepoUrl(repos[i].html_url));
        if (item) return item;
      }
      return fallback;
    }).catch(function () {
      return fallback;
    });
  }

  function getScroller() {
    return document.scrollingElement || document.documentElement;
  }

  function currentScrollY() {
    var scroller = getScroller();
    return scroller ? scroller.scrollTop : (window.scrollY || window.pageYOffset || 0);
  }

  function setScrollY(value) {
    var scroller = getScroller();
    var next = Math.max(0, Math.round(value));
    if (scroller) {
      scroller.scrollTop = next;
      return;
    }
    window.scrollTo(0, next);
  }

  function getDocumentBottom() {
    var scroller = getScroller();
    var root = document.documentElement;
    var body = document.body;
    var stage = document.getElementById('site-stage');
    var footer = document.querySelector('.site-footer');
    var scrollY = currentScrollY();

    var absoluteStageBottom = stage ? stage.getBoundingClientRect().bottom + scrollY : 0;
    var absoluteFooterBottom = footer ? footer.getBoundingClientRect().bottom + scrollY : 0;
    var fullHeight = Math.max(
      scroller ? scroller.scrollHeight : 0,
      root ? root.scrollHeight : 0,
      body ? body.scrollHeight : 0,
      absoluteStageBottom,
      absoluteFooterBottom
    );

    var viewportHeight = scroller && scroller.clientHeight ? scroller.clientHeight : window.innerHeight;
    return Math.max(0, Math.ceil(fullHeight - viewportHeight));
  }

  function nextPaint() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function animateScrollTo(target, duration) {
    var startY = currentScrollY();
    var startTime = performance.now();

    return new Promise(function (resolve) {
      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function frame(now) {
        var progress = Math.min(1, (now - startTime) / duration);
        var targetY = typeof target === 'function' ? target() : target;
        var distance = targetY - startY;
        setScrollY(startY + distance * easeInOutCubic(progress));

        if (progress < 1) {
          window.requestAnimationFrame(frame);
        } else {
          setScrollY(targetY);
          resolve();
        }
      }
      window.requestAnimationFrame(frame);
    });
  }

  function waitForAnimation(element, fallbackMs) {
    return new Promise(function (resolve) {
      var settled = false;
      function done() {
        if (settled) return;
        settled = true;
        element.removeEventListener('animationend', done);
        resolve();
      }
      element.addEventListener('animationend', done, { once: true });
      window.setTimeout(done, fallbackMs);
    });
  }

  function makeOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'easter-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    return overlay;
  }

  function cloneLatestCard(item) {
    var source = document.getElementById('project-' + item.id);
    if (!source) return null;

    var clone = source.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.remove('item-card--flash');
    clone.classList.add('easter-feature-card__card');
    clone.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
    clone.querySelectorAll('a, button').forEach(function (node) {
      node.removeAttribute('href');
      node.setAttribute('tabindex', '-1');
      node.setAttribute('aria-hidden', 'true');
    });
    return clone;
  }

  function showLatestCard(overlay, item) {
    var clone = cloneLatestCard(item);
    if (!clone) return Promise.resolve();

    var holder = document.createElement('div');
    holder.className = 'easter-feature-card';
    holder.appendChild(clone);
    overlay.appendChild(holder);

    var fade = holder.animate([
      { opacity: 0, transform: 'translateY(12px) scale(0.96)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], {
      duration: 500,
      easing: 'ease-out',
      fill: 'forwards'
    });

    return fade.finished.catch(function () {}).then(function () {
      var pulse = clone.animate([
        {
          borderColor: 'rgba(255,255,255,0.28)',
          boxShadow: '0 0 0 0 rgba(255,255,255,0)',
          backgroundColor: 'rgba(6,6,6,0.98)'
        },
        {
          borderColor: '#ffffff',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.95), 0 0 48px rgba(255,255,255,0.62)',
          backgroundColor: 'rgba(255,255,255,0.14)',
          offset: 0.45
        },
        {
          borderColor: 'rgba(255,255,255,0.28)',
          boxShadow: '0 0 0 0 rgba(255,255,255,0)',
          backgroundColor: 'rgba(6,6,6,0.98)'
        }
      ], {
        duration: 700,
        easing: 'ease-in-out',
        fill: 'forwards'
      });
      return pulse.finished.catch(function () {});
    });
  }

  function pulseScreenWhite(overlay) {
    overlay.classList.add('is-active');
    var pulse = overlay.animate([
      { backgroundColor: 'rgba(255,255,255,0)' },
      { backgroundColor: 'rgba(255,255,255,1)', offset: 0.45 },
      { backgroundColor: 'rgba(255,255,255,0)' }
    ], {
      duration: 460,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
    return pulse.finished.catch(function () {});
  }

  function preventInteraction(event) {
    event.preventDefault();
  }

  function lockInteraction() {
    document.addEventListener('wheel', preventInteraction, { passive: false });
    document.addEventListener('touchmove', preventInteraction, { passive: false });
  }

  function unlockInteraction() {
    document.removeEventListener('wheel', preventInteraction, { passive: false });
    document.removeEventListener('touchmove', preventInteraction, { passive: false });
  }

  async function runSequence() {
    if (running) return;
    running = true;

    var stage = document.getElementById('site-stage');
    if (!stage) {
      running = false;
      return;
    }

    var items = await waitForPortfolio(5000);
    var latestPromise = resolveLatestProject(items);
    var overlay = makeOverlay();

    document.body.classList.add('easter-sequence-running');
    document.documentElement.classList.add('easter-scroll-direct');
    lockInteraction();

    try {
      stage.classList.add('easter-stage-bounce');
      await waitForAnimation(stage, 1100);
      stage.classList.remove('easter-stage-bounce');

      // Wait for the stage transform to be fully removed before measuring the document.
      await nextPaint();
      setScrollY(0);
      await nextPaint();

      // Recompute the real document bottom while scrolling so late font/layout shifts
      // cannot shorten the trip. The footer must be reached before returning upward.
      await animateScrollTo(getDocumentBottom, 2000);
      setScrollY(getDocumentBottom());
      await nextPaint();
      await animateScrollTo(0, 2000);
      setScrollY(0);

      await pulseScreenWhite(overlay);
      overlay.getAnimations().forEach(function (animation) { animation.cancel(); });
      overlay.style.backgroundColor = '#000000';
      await sleep(2000);

      var latest = await latestPromise;
      if (!latest || !latest.repoUrl) {
        overlay.remove();
        return;
      }

      await showLatestCard(overlay, latest);
      await sleep(160);
      window.location.assign(latest.repoUrl);
    } finally {
      unlockInteraction();
      document.documentElement.classList.remove('easter-scroll-direct');
      document.body.classList.remove('easter-sequence-running');
      if (document.body.contains(overlay) && !overlay.querySelector('.easter-feature-card')) overlay.remove();
      running = false;
    }
  }

  function handleKeydown(event) {
    if (running || event.ctrlKey || event.metaKey || event.altKey) return;

    physicalBuffer.push(event.code);
    if (physicalBuffer.length > PHYSICAL_SEQUENCE.length) physicalBuffer.shift();

    var matched = physicalBuffer.length === PHYSICAL_SEQUENCE.length && physicalBuffer.every(function (code, index) {
      return code === PHYSICAL_SEQUENCE[index];
    });

    if (matched) {
      physicalBuffer = [];
      runSequence();
    }
  }

  function init() {
    document.addEventListener('keydown', handleKeydown, true);
  }

  window.initEasterEgg = init;
})();
