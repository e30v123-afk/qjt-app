/* قشرة تطبيق قافلة الجزيرة — تُحقَن داخل صفحات qjt.sa عند فتحها من التطبيق فقط.
   تضيف: شريط تنقّل سفلي، ورقة أقسام، شارة السلة، بديل الصور المكسورة،
   شاشة انقطاع الاتصال، السحب للتحديث، المشاركة الأصلية، والروابط الخارجية. */
(function () {
  'use strict';
  if (window.__qjtShell) return;
  try { if (window.top !== window.self) return; } catch (e) { return; }   // الإطار الرئيسي فقط
  window.__qjtShell = true;

  var BRAND = '#e8912a';
  var CATS = [
    { t: 'بطاريات', u: '/product/category/2', i: 'battery' },
    { t: 'زيوت', u: '/product/category/14', i: 'oil' },
    { t: 'إطارات', u: '/product/category/22', i: 'tire' },
    { t: 'محسنات ومعالجات', u: '/product/category/18', i: 'flask' },
    { t: 'الخدمات', u: '/service', i: 'wrench' },
    { t: 'الباقات', u: '/pacakge', i: 'box' }
  ];
  var TABS = [
    { id: 'home', t: 'الرئيسية', u: '/', m: /^\/$/ },
    { id: 'cats', t: 'الأقسام', sheet: true, m: /^\/(product|service|pacakge)/ },
    { id: 'cart', t: 'السلة', u: '/cart/content', m: /^\/cart/, badge: true },
    { id: 'fav', t: 'المفضلة', u: '/user/wishlist', m: /^\/user\/wishlist/ },
    { id: 'me', t: 'حسابي', account: true, m: /^\/user(?!\/wishlist)/ }
  ];
  var ICONS = {
    home: '<path d="M3 10.6 12 3l9 7.6"/><path d="M5.5 9.4V20h13V9.4"/><path d="M9.8 20v-5.4h4.4V20"/>',
    cats: '<rect x="3" y="3" width="7.4" height="7.4" rx="2"/><rect x="13.6" y="3" width="7.4" height="7.4" rx="2"/><rect x="3" y="13.6" width="7.4" height="7.4" rx="2"/><rect x="13.6" y="13.6" width="7.4" height="7.4" rx="2"/>',
    cart: '<path d="M2.5 3h2.7l2.3 11.2h9.8l2.2-8.3H6"/><circle cx="9.5" cy="19.5" r="1.6"/><circle cx="17" cy="19.5" r="1.6"/>',
    fav: '<path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13z"/>',
    me: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M21 10.5v3"/><path d="M6.5 12h4M8.5 10v4M13 12h3.5"/>',
    oil: '<path d="M12 3s5.5 6 5.5 9.6A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.4C6.5 9 12 3 12 3z"/>',
    tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"/>',
    flask: '<path d="M9.5 3v5.2L4.6 17a2.2 2.2 0 0 0 1.9 3.3h11a2.2 2.2 0 0 0 1.9-3.3l-4.9-8.8V3"/><path d="M8 3h8"/>',
    wrench: '<path d="M20 5.5a5 5 0 0 1-6.6 6.2L6 19.1a2.3 2.3 0 0 1-3.2-3.2l7.4-7.4A5 5 0 0 1 16.5 2z"/>',
    box: '<path d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2z"/><path d="M3 8.2 12 13l9-4.8M12 13v8"/>',
    share: '<circle cx="18" cy="5.5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="18.5" r="2.6"/><path d="M8.3 10.8 15.7 6.8M8.3 13.2l7.4 4"/>',
    wifi: '<path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5.5 12.6a10 10 0 0 1 13 0"/><path d="M9 16.3a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r="1.1"/>',
    back: '<path d="M15 5l-7 7 7 7"/>'
  };
  var svg = function (k, w) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.7) +
      '" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[k] || '') + '</svg>';
  };

  /* ---------- الجسر الأصلي ---------- */
  var C = function () { return window.Capacitor; };
  var native = function () { var c = C(); return !!(c && c.isNativePlatform && c.isNativePlatform()); };
  var plug = function (n) { var c = C(); return (c && c.Plugins && c.Plugins[n]) || null; };
  var tap = function (style) {
    var H = plug('Haptics');
    if (H) { try { H.impact({ style: style || 'LIGHT' }); } catch (e) { /* تجاهل */ } }
  };

  /* ---------- التنسيق ---------- */
  function styles() {
    var css = [
      ':root{--qjt:' + BRAND + '}',
      'html.qjt-app{-webkit-tap-highlight-color:transparent}',
      /* الشريط السفلي عائم، فنترك له مساحة أكبر */
      'html.qjt-app body{padding-bottom:calc(76px + var(--qjt-sab, env(safe-area-inset-bottom, 0px)))!important}',
      /* المنطقة الآمنة + ارتفاع الرأس الثابت (يُقاس ويُوضع في --qjt-hdr) */
      'html.qjt-app body{padding-top:calc(var(--qjt-sat, env(safe-area-inset-top, 0px)) + var(--qjt-hdr, 80px))!important;background:#fff}',
      /* رأس الموقع يبقى ثابتاً أعلى الشاشة ولا يذهب مع التمرير */
      'html.qjt-app header{position:fixed!important;top:var(--qjt-sat, env(safe-area-inset-top, 0px))!important;',
      'inset-inline:0!important;z-index:99992!important;background:#fff!important;',
      'box-shadow:0 2px 14px rgba(16,20,24,.10)!important}',
      /* وشريط أبيض ثابت يغطي ما ينزلق تحت شريط الحالة عند التمرير */
      '#qjttop{position:fixed;top:0;inset-inline:0;z-index:99998;height:var(--qjt-sat, env(safe-area-inset-top, 0px));',
      'background:#fff;pointer-events:none}',
      /* الشريط السفلي: عائم بحواف مقوّسة */
      '#qjtbar{position:fixed;inset-inline:14px;bottom:calc(9px + var(--qjt-sab, env(safe-area-inset-bottom, 0px)));z-index:99990;',
      'display:flex;border-radius:22px;padding:5px 5px 6px;',
      'background:rgba(20,25,31,.62);backdrop-filter:blur(26px) saturate(180%);',
      '-webkit-backdrop-filter:blur(26px) saturate(180%);',
      'border:1px solid rgba(255,255,255,.14);',
      'box-shadow:0 8px 26px rgba(0,0,0,.24),0 1px 3px rgba(0,0,0,.14);',
      'direction:rtl;font-family:inherit}',
      '#qjtbar button{flex:1;background:none;border:0;padding:6px 2px 5px;display:flex;flex-direction:column;',
      'align-items:center;gap:2px;color:#c9d2d9;font-family:inherit;font-weight:600;font-size:9.5px;line-height:1.15;cursor:pointer;',
      'letter-spacing:-.1px;position:relative;border-radius:16px;transition:color .18s,background .18s}',
      '#qjtbar button svg{width:19px;height:19px;stroke-width:1.6;transition:transform .18s}',
      '#qjtbar button:active svg{transform:scale(.86)}',
      '#qjtbar button.on{color:var(--qjt);background:rgba(232,145,42,.20)}',
      '#qjtbar .bdg{position:absolute;top:2px;inset-inline-end:calc(50% - 17px);min-width:15px;height:15px;',
      'border-radius:8px;background:var(--qjt);color:#10140f;font:700 9px/15px system-ui;text-align:center;padding:0 3px}',
      /* ورقة الأقسام */
      '#qjtsheet{position:fixed;inset:0;z-index:99995;display:none;direction:rtl}',
      '#qjtsheet.open{display:block}',
      '#qjtsheet .sc{position:absolute;inset:0;background:rgba(0,0,0,.45);opacity:0;transition:opacity .25s}',
      '#qjtsheet.in .sc{opacity:1}',
      '#qjtsheet .sp{position:absolute;inset-inline:0;bottom:0;background:#fff;border-radius:22px 22px 0 0;',
      'padding:10px 16px calc(24px + var(--qjt-sab, env(safe-area-inset-bottom, 0px)));transform:translateY(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1)}',
      '#qjtsheet.in .sp{transform:translateY(0)}',
      '#qjtsheet .gr{width:40px;height:4px;border-radius:2px;background:#d8dde3;margin:0 auto 12px}',
      '#qjtsheet h3{margin:0 0 12px;font-family:inherit;font-weight:700;font-size:17px;line-height:1.3;color:#101418}',
      '#qjtsheet a{display:flex;align-items:center;gap:12px;padding:13px 10px;border-radius:14px;',
      'text-decoration:none;color:#101418;font-family:inherit;font-weight:600;font-size:15px;line-height:1.3}',
      '#qjtsheet a:active{background:#f3f5f7}',
      '#qjtsheet a svg{width:22px;height:22px;color:var(--qjt);flex:none}',
      '#qjtsheet a i{margin-inline-start:auto;color:#b7bfc7;font-style:normal}',
      /* شاشة انقطاع الاتصال */
      '#qjtoff{position:fixed;inset:0;z-index:99999;display:none;flex-direction:column;align-items:center;',
      'justify-content:center;gap:14px;background:#101418;color:#eef2f6;text-align:center;padding:30px;direction:rtl}',
      '#qjtoff.on{display:flex}',
      '#qjtoff svg{width:62px;height:62px;color:var(--qjt)}',
      '#qjtoff h2{margin:0;font-family:inherit;font-weight:700;font-size:20px;line-height:1.4}',
      '#qjtoff p{margin:0;color:#98a2ad;font-family:inherit;font-weight:400;font-size:14.5px;line-height:1.7;max-width:300px}',
      '#qjtoff button{margin-top:6px;background:var(--qjt);color:#10140f;border:0;border-radius:12px;',
      'padding:12px 30px;font-family:inherit;font-weight:700;font-size:15px}',
      /* السحب للتحديث */
      '#qjtpull{position:fixed;top:0;inset-inline:0;z-index:99991;display:flex;justify-content:center;',
      'pointer-events:none;transition:opacity .2s}',
      '#qjtpull i{display:block;width:30px;height:30px;margin-top:8px;border-radius:50%;',
      'border:2.5px solid rgba(232,145,42,.25);border-top-color:var(--qjt)}',
      '#qjtpull.spin i{animation:qjtsp .7s linear infinite}',
      '@keyframes qjtsp{to{transform:rotate(360deg)}}',
      /* زر المشاركة */
      '#qjtshare{position:fixed;inset-inline-start:14px;bottom:calc(76px + var(--qjt-sab, env(safe-area-inset-bottom, 0px)));',
      'z-index:99989;width:46px;height:46px;border-radius:50%;border:0;display:none;align-items:center;',
      'justify-content:center;background:#fff;color:#101418;box-shadow:0 4px 16px rgba(0,0,0,.2)}',
      '#qjtshare.on{display:flex}',
      '#qjtshare svg{width:21px;height:21px}',
      /* بديل الصور المكسورة */
      'img.qjt-ph{object-fit:contain!important;background:#f4f6f8!important;padding:8%!important;opacity:.55}',
      /* أداة واتساب الخارجية تجلس بأعلى z-index ممكن وتغطي الشريط — نرفعها فوقه */
      'html.qjt-app #gb-waw-iframe,html.qjt-app iframe[id*="waw"],html.qjt-app .whatsapp-btn,',
      'html.qjt-app .whatsapp_float,html.qjt-app [class*="whats"][class*="float"]',
      '{bottom:calc(82px + var(--qjt-sab, env(safe-area-inset-bottom, 0px)))!important}',
      /* زر «العودة للأعلى» في الموقع يجلس فوق الشريط ويغطي تبويب الرئيسية */
      'html.qjt-app #scrollUp,html.qjt-app [id*="scrollUp"],html.qjt-app [class*="scroll-top"],',
      'html.qjt-app [class*="scrollToTop"],html.qjt-app [class*="back-to-top"]',
      '{bottom:calc(156px + var(--qjt-sab, env(safe-area-inset-bottom, 0px)))!important}',
      /* عند فتح أي نافذة للموقع (الدخول، كود التحقق، السلة، القائمة) يختفي
         الشريط والأزرار العائمة — كانت تغطي حقل الجوال وكود التحقق */
      'html.qjt-modal #qjtbar,html.qjt-modal #qjtshare,html.qjt-modal #gb-waw-iframe,',
      'html.qjt-modal iframe[id*="waw"],html.qjt-modal #scrollUp',
      '{opacity:0!important;pointer-events:none!important;transform:translateY(12px);',
      'transition:opacity .2s,transform .2s}',
      /* تختفي الأداة عند فتح ورقة الأقسام لأن z-index عندها أعلى من أي قيمة */
      'html.qjt-sheet #gb-waw-iframe,html.qjt-sheet iframe[id*="waw"],html.qjt-sheet .whatsapp-btn,',
      'html.qjt-sheet #scrollUp,html.qjt-sheet [id*="scrollUp"],',
      'html.qjt-sheet .whatsapp_float,html.qjt-sheet [class*="whats"][class*="float"]',
      '{opacity:0!important;pointer-events:none!important;transition:opacity .2s}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'qjt-style';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- أدوات ---------- */
  function go(u) { location.href = u.charAt(0) === '/' ? 'https://qjt.sa' + u : u; }
  function path() { return location.pathname || '/'; }

  function cartCount() {
    var a = document.querySelector('a[href*="/cart/content"]');
    if (!a) return 0;
    var m = (a.textContent || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  /* ---------- الشريط السفلي ---------- */
  function bar() {
    var el = document.createElement('nav');
    el.id = 'qjtbar';
    el.setAttribute('role', 'navigation');
    el.innerHTML = TABS.map(function (t) {
      return '<button data-id="' + t.id + '" aria-label="' + t.t + '">' + svg(t.id) +
        (t.badge ? '<span class="bdg" hidden></span>' : '') + '<span>' + t.t + '</span></button>';
    }).join('');
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var t = TABS.filter(function (x) { return x.id === b.dataset.id; })[0];
      tap('LIGHT');
      if (t.sheet) sheet(true);
      else if (t.account) openAccount();
      else go(t.u);
    });
    active(); badge();
  }
  function active() {
    var p = path();
    document.querySelectorAll('#qjtbar button').forEach(function (b) {
      var t = TABS.filter(function (x) { return x.id === b.dataset.id; })[0];
      b.classList.toggle('on', !!(t.m && t.m.test(p)));
    });
  }
  function badge() {
    var b = document.querySelector('#qjtbar .bdg'); if (!b) return;
    var n = cartCount();
    b.hidden = !n;
    b.textContent = n > 99 ? '99+' : n;
  }

  /* «حسابي»: نضغط زر الحساب في الموقع نفسه — فهو يعرف إن كان العميل داخلاً
     (يفتح حسابه) أو لا (يفتح نافذة الدخول). الرابط /user/sign-in صفحة 404. */
  function openAccount() {
    var btn = document.querySelector('.otploginMobileBtn, .account-header-btn, .otploginEmailBtn');
    if (btn) { btn.click(); return; }
    var modal = document.getElementById('loginModal');
    if (modal && window.bootstrap && window.bootstrap.Modal) {
      try { window.bootstrap.Modal.getOrCreateInstance(modal).show(); return; } catch (e) { /* تابع */ }
    }
    go('/user/profile');          // آخر احتياط: صفحة موجودة فعلاً
  }

  /* ---------- ورقة الأقسام ---------- */
  function sheet(open) {
    var s = document.getElementById('qjtsheet');
    if (!s) {
      s = document.createElement('div');
      s.id = 'qjtsheet';
      s.innerHTML = '<div class="sc"></div><div class="sp"><div class="gr"></div><h3>تصفّح الأقسام</h3>' +
        CATS.map(function (c) {
          return '<a href="https://qjt.sa' + c.u + '">' + svg(c.i) + '<span>' + c.t + '</span><i>' + svg('back') + '</i></a>';
        }).join('') + '</div>';
      document.body.appendChild(s);
      s.querySelector('.sc').addEventListener('click', function () { sheet(false); });
      s.addEventListener('click', function (e) { if (e.target.closest('a')) tap('LIGHT'); });
    }
    document.documentElement.classList.toggle('qjt-sheet', !!open);
    if (open) { s.classList.add('open'); requestAnimationFrame(function () { s.classList.add('in'); }); }
    else { s.classList.remove('in'); setTimeout(function () { s.classList.remove('open'); }, 300); }
  }

  /* ---------- بديل الصور المكسورة ---------- */
  var PH = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="none" stroke="#9aa3ad" ' +
    'stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M60 22s26 29 26 46a26 26 0 0 1-52 0c0-17 26-46 26-46z"/>' +
    '<path d="M52 70a9 9 0 0 0 9 9"/></g></svg>');
  function fixImages() {
    var swap = function (img) {
      if (img.dataset.qjtPh) return;
      img.dataset.qjtPh = '1';
      img.src = PH;
      img.classList.add('qjt-ph');
      img.removeAttribute('srcset');
    };
    document.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG') swap(t);
    }, true);
    var scan = function () {
      var n = 0;
      [].forEach.call(document.images, function (i) {
        if (i.complete && i.naturalWidth === 0 && i.src && !i.dataset.qjtPh) { swap(i); n++; }
      });
      return n;
    };
    scan();
    setTimeout(scan, 2500);
    setTimeout(scan, 6000);
  }

  /* ---------- انقطاع الاتصال ---------- */
  function offline() {
    var o = document.createElement('div');
    o.id = 'qjtoff';
    o.innerHTML = svg('wifi') + '<h2>لا يوجد اتصال بالإنترنت</h2>' +
      '<p>تأكد من اتصالك بالشبكة ثم أعد المحاولة. متجر قافلة الجزيرة يحتاج اتصالاً لعرض المنتجات وأسعارها المحدّثة.</p>' +
      '<button type="button">إعادة المحاولة</button>';
    document.body.appendChild(o);
    o.querySelector('button').addEventListener('click', function () { tap('MEDIUM'); location.reload(); });
    var show = function (on) { o.classList.toggle('on', !on); };
    var N = plug('Network');
    if (N) {
      N.getStatus().then(function (s) { show(s.connected); }).catch(function () { /* تجاهل */ });
      N.addListener('networkStatusChange', function (s) { show(s.connected); });
    }
    window.addEventListener('online', function () { show(true); });
    window.addEventListener('offline', function () { show(false); });
  }

  /* ---------- السحب للتحديث ---------- */
  function pull() {
    var p = document.createElement('div');
    p.id = 'qjtpull'; p.innerHTML = '<i></i>';
    p.style.opacity = '0';
    document.body.appendChild(p);
    var y0 = null, d = 0, busy = false;
    var top = function () { return (window.scrollY || document.documentElement.scrollTop || 0) <= 1; };
    addEventListener('touchstart', function (e) {
      if (!busy && top() && e.touches.length === 1) { y0 = e.touches[0].clientY; d = 0; }
    }, { passive: true });
    addEventListener('touchmove', function (e) {
      if (y0 === null || busy) return;
      d = e.touches[0].clientY - y0;
      if (d > 0 && top()) {
        var k = Math.min(d / 110, 1);
        p.style.opacity = k;
        p.style.transform = 'translateY(' + Math.min(d * .45, 52) + 'px)';
      }
    }, { passive: true });
    addEventListener('touchend', function () {
      if (y0 === null || busy) { y0 = null; return; }
      if (d > 105) {
        busy = true; tap('MEDIUM');
        p.classList.add('spin'); p.style.opacity = '1';
        setTimeout(function () { location.reload(); }, 180);
      } else {
        p.style.opacity = '0'; p.style.transform = '';
      }
      y0 = null; d = 0;
    }, { passive: true });
  }

  /* ---------- المشاركة الأصلية ---------- */
  function share() {
    var b = document.createElement('button');
    b.id = 'qjtshare'; b.type = 'button';
    b.setAttribute('aria-label', 'مشاركة المنتج');
    b.innerHTML = svg('share');
    document.body.appendChild(b);
    var isProduct = /^\/product\/single\//.test(path());
    b.classList.toggle('on', isProduct);
    b.addEventListener('click', function () {
      tap('LIGHT');
      var S = plug('Share');
      var title = (document.querySelector('h1') || {}).textContent || document.title;
      var data = { title: title.trim(), text: title.trim() + ' — قافلة الجزيرة', url: location.href, dialogTitle: 'مشاركة المنتج' };
      if (S) S.share(data).catch(function () { /* أُلغيت */ });
      else if (navigator.share) navigator.share(data).catch(function () { /* أُلغيت */ });
    });
  }

  /* ---------- الروابط الخارجية ---------- */
  function links() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href') || '';
      if (/^(tel:|mailto:|sms:)/i.test(h)) return;                   // يتولاها النظام
      if (/^https?:\/\//i.test(h) && h.indexOf('qjt.sa') === -1) {
        e.preventDefault();
        var B = plug('Browser');
        if (B) B.open({ url: h, presentationStyle: 'popover' });
        else window.open(h, '_blank');
      }
    }, true);
  }

  /* ---------- تذكير السلة ---------- */
  function cartReminder() {
    var LN = plug('LocalNotifications'), App = plug('App');
    if (!LN || !App) return;
    var ask = function () {
      LN.checkPermissions().then(function (r) {
        if (r.display === 'prompt') return LN.requestPermissions();
      }).catch(function () { /* تجاهل */ });
    };
    setTimeout(ask, 9000);
    App.addListener('appStateChange', function (s) {
      if (s.isActive) return;
      var n = cartCount();
      LN.cancel({ notifications: [{ id: 7301 }] }).catch(function () { /* تجاهل */ });
      if (!n) return;
      LN.schedule({
        notifications: [{
          id: 7301,
          title: 'سلتك تنتظرك 🛒',
          body: 'لديك ' + n + (n === 1 ? ' منتج' : ' منتجات') + ' في سلة قافلة الجزيرة — أكمل طلبك قبل نفاد الكمية.',
          schedule: { at: new Date(Date.now() + 6 * 3600 * 1000), allowWhileIdle: true },
          smallIcon: 'ic_stat_qjt'
        }]
      }).catch(function () { /* تجاهل */ });
    });
  }

  /* ---------- زر الرجوع في أندرويد ---------- */
  function backButton() {
    var App = plug('App'); if (!App) return;
    App.addListener('backButton', function () {
      var s = document.getElementById('qjtsheet');
      if (s && s.classList.contains('open')) return sheet(false);
      if (history.length > 1 && path() !== '/') history.back();
      else App.exitApp();
    });
  }

  /* ---------- شريط الحالة ---------- */
  function statusBar() {
    var SB = plug('StatusBar'); if (!SB) return;
    try { SB.setStyle({ style: 'LIGHT' }); SB.setBackgroundColor({ color: '#ffffff' }); } catch (e) { /* تجاهل */ }
  }

  /* المنطقة الآمنة: قيم env(safe-area-inset-*) تساوي صفراً ما لم يحتوِ
     وسم viewport على viewport-fit=cover — وموقع qjt.sa لا يحتويه،
     فنضيفه هنا وإلا اختفى شريط الحالة فوق رأس الموقع. */
  function viewportFit() {
    var m = document.querySelector('meta[name="viewport"]');
    if (!m) {
      m = document.createElement('meta');
      m.name = 'viewport';
      m.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(m);
    }
    if (!/viewport-fit/.test(m.content)) m.content = m.content + ', viewport-fit=cover';
  }

  function safeTop() {
    if (document.getElementById('qjttop')) return;
    var s = document.createElement('div');
    s.id = 'qjttop';
    document.body.appendChild(s);
  }

  /* الرأس صار ثابتاً فخرج من سياق الصفحة — نقيس ارتفاعه ونحفظه في --qjt-hdr
     ليعرف حشو body كم يُبعد المحتوى، وإلا اختفى أول المحتوى تحت الرأس. */
  function headerHeight() {
    var h = document.querySelector('header');
    if (!h) return;
    var measure = function () {
      // نقيسه وهو في مكانه الطبيعي قبل أن تُطبَّق قاعدة التثبيت
      var px = Math.round(h.getBoundingClientRect().height);
      if (px > 20 && px < 220) {
        document.documentElement.style.setProperty('--qjt-hdr', px + 'px');
      }
    };
    measure();
    // الارتفاع قد يتغيّر بعد تحميل الصور أو بتدوير الجهاز
    setTimeout(measure, 1200);
    setTimeout(measure, 4000);
    addEventListener('orientationchange', function () { setTimeout(measure, 350); });
    addEventListener('resize', function () { clearTimeout(headerHeight._t); headerHeight._t = setTimeout(measure, 250); });
  }

  /* ---------- الإقلاع ---------- */
  function boot() {
    document.documentElement.classList.add('qjt-app');
    viewportFit();
    headerHeight();          // يُقاس قبل التثبيت ليكون الارتفاع الطبيعي
    styles();
    safeTop();
    bar(); fixImages(); offline(); pull(); share(); links();
    statusBar(); backButton(); cartReminder(); watchModals();
    var SS = plug('SplashScreen');
    if (SS) setTimeout(function () { SS.hide().catch(function () { /* تجاهل */ }); }, 350);
    watchCart();
  }

  /* تحديث الشارة عند تغيّر السلة دون إعادة تحميل.
     نراقب رابط السلة وحده — مراقبة body كلّه تُغرق المعالج في صفحات فيها مئات الصور. */
  function watchCart() {
    var last = -1;
    var sync = function () { var n = cartCount(); if (n !== last) { last = n; badge(); } };
    sync();
    var a = document.querySelector('a[href*="/cart/content"]');
    if (a && window.MutationObserver) {
      var t = 0;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(sync, 250);
      }).observe(a, { childList: true, subtree: true, characterData: true });
    }
    setInterval(sync, 4000);
  }

  /* نراقب نوافذ الموقع (Bootstrap) لنُخفي الشريط أثناء فتحها */
  function watchModals() {
    var apply = function () {
      var open = !!document.querySelector('.modal.show, .offcanvas.show')
        || /modal-open|offcanvas-backdrop/.test(document.body.className);
      document.documentElement.classList.toggle('qjt-modal', open);
    };
    apply();
    if (window.MutationObserver) {
      var t = 0;
      new MutationObserver(function () {
        clearTimeout(t); t = setTimeout(apply, 60);
      }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
    setInterval(apply, 1200);
  }

  /* هل نحن داخل التطبيق؟ نعتمد على وسم المتصفح أولاً لأنه يوجد دائماً،
     ولا ننتظر جسر Capacitor — فالإضافات وحدها هي التي تحتاجه. */
  function inApp() {
    return /QJTApp/.test(navigator.userAgent) || native();
  }

  function start() {
    if (!inApp()) return;                        // في المتصفح العادي لا نغيّر شيئاً
    if (document.body) boot();
    else document.addEventListener('DOMContentLoaded', boot, { once: true });
  }

  start();
})();
