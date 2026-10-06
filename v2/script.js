(() => {
  document.documentElement.classList.add('js');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Mobile menu
  const menu = document.querySelector('.menu-btn');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
  };
  menu.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Dashboard tabs (arrow keys, Home, End)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const visible = tabs.filter((t) => !t.hidden);
      const at = visible.indexOf(tab);
      const next = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: visible.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(visible[(next + visible.length) % visible.length], true);
    });
  });

  // Screenshots that are not available show a placeholder; an empty dashboard tab is hidden
  document.querySelectorAll('.shot img').forEach((img) => {
    const mark = () => {
      const shot = img.closest('.shot');
      shot.classList.add('is-missing');
      const panel = shot.closest('.panel');
      const tab = panel && tabs.find((t) => t.getAttribute('aria-controls') === panel.id);
      if (!tab) return;
      tab.hidden = true;
      if (tab.getAttribute('aria-selected') === 'true') {
        const first = tabs.find((t) => !t.hidden);
        if (first) select(first);
      }
    };
    img.addEventListener('error', mark);
    if (img.complete && img.naturalWidth === 0) mark();
  });

  // Scroll reveal: shows content in reading order as it enters the viewport
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !calm) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Stat counters: numbers count up once, to draw the eye to the proof points
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !calm) {
    const run = (el) => {
      const end = Number(el.dataset.count);
      const t0 = performance.now();
      const dur = 1100;
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          co.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => { el.textContent = '0'; co.observe(el); });
  }

  if (hoverable && !calm) {
    // Cursor spotlight on cards: writes two CSS variables, no re-render
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.spot');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    // Hero portrait tilts slightly toward the cursor
    const photo = document.querySelector('.hero-photo');
    const plate = document.querySelector('.plate');
    if (photo && plate) {
      photo.addEventListener('pointermove', (e) => {
        const r = photo.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        plate.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
        plate.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      }, { passive: true });
      photo.addEventListener('pointerleave', () => {
        plate.style.setProperty('--rx', '0deg');
        plate.style.setProperty('--ry', '0deg');
      });
    }

    // Primary buttons lean toward the cursor
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + 'px');
        btn.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px');
      }, { passive: true });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--tx', '0px');
        btn.style.setProperty('--ty', '0px');
      });
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
