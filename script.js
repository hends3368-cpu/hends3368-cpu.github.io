(function () {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Theme toggle
  $('#themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  // Mobile menu
  const menuBtn = $('#menuBtn'), links = $('#navLinks');
  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false);
  }));

  // Nav border + active link
  const nav = $('#nav');
  const sections = $$('main section[id]');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 10);
    let cur = '';
    sections.forEach(s => { if (scrollY + 120 >= s.offsetTop) cur = s.id; });
    $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Reveal on scroll + counters
  const countUp = el => {
    const end = +el.dataset.count, sep = el.dataset.sep, t0 = performance.now(), d = 1200;
    const step = now => {
      const p = Math.min((now - t0) / d, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = sep ? v.toLocaleString('en-US') : v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: .12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
    $$('[data-count]').forEach(el => el.textContent = (+el.dataset.count).toLocaleString('en-US'));
  }

  // Project filter
  $$('.chip').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    $$('#projects [data-cat]').forEach(card => {
      card.classList.toggle('hidden', f !== 'all' && !card.dataset.cat.split(' ').includes(f));
    });
  }));

  // Lightbox
  const lb = $('#lightbox'), lbImg = $('img', lb);
  $$('.zoom').forEach(b => b.addEventListener('click', () => {
    lbImg.src = b.dataset.full; lbImg.alt = b.getAttribute('aria-label') || '';
    lb.hidden = false; $('.lb-close', lb).focus();
  }));
  const closeLb = () => { lb.hidden = true; lbImg.src = ''; };
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // Copy email
  const toast = $('#toast');
  const show = msg => { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); };
  $('#copyEmail').addEventListener('click', e => {
    const email = e.currentTarget.dataset.email;
    (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject())
      .then(() => show('Email copied ✓'))
      .catch(() => show(email));
  });

  $('#year').textContent = new Date().getFullYear();
})();
