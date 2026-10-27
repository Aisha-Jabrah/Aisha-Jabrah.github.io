(function () {
  var S = window.SITE;
  if (!S) return;

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(label, url, cls) {
    var a = el("a", "btn btn-sm " + (cls || "btn-blue"), label);
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    return a;
  }
  function svg(path) {
    var s = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
    return s;
  }
  var ICONS = {
    pen: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    users: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>'),
    palette: svg('<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4a4.6 4.6 0 0 0 4.6-4.6C22 6 17.5 2 12 2Z"/>'),
    cart: svg('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>'),
    chart: svg('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
    video: svg('<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m22 8-6 4 6 4Z"/>'),
    lock: svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    doc: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>')
  };
  function arabicDate(iso) {
    try { return new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return iso; }
  }

  /* ---------- text bits ---------- */
  document.querySelectorAll("[data-name]").forEach(function (n) { n.textContent = S.name; });
  document.querySelectorAll("[data-role]").forEach(function (n) { n.textContent = S.role; });
  document.querySelectorAll("[data-subrole]").forEach(function (n) { n.textContent = S.subRole || ""; });
  if ($("tagline")) $("tagline").textContent = "« " + S.tagline + " »";
  if ($("tagline-author")) $("tagline-author").textContent = "— " + S.taglineAuthor;
  if ($("year")) $("year").textContent = new Date().getFullYear();

  if ($("about-text")) {
    S.about.forEach(function (t, i) { $("about-text").appendChild(el("p", i === 0 ? "lead" : "", t)); });
  }

  /* ---------- vertical timeline ---------- */
  if ($("vline")) {
    var colors = ["#e0916e", "#6f93cf", "#b0609f", "#d3234a"];
    var tints = ["", "tint-b", "tint-m", "tint-c"];
    S.journey.forEach(function (j, i) {
      var seg = el("div", "seg reveal " + tints[i % 4]);
      var bub = el("div", "bubble reveal", j.year);
      bub.style.setProperty("--c", colors[i % 4]);
      var en = el("div", "entry reveal" + (i === S.journey.length - 1 ? " now" : ""));
      en.appendChild(el("div", "period", j.period));
      en.appendChild(el("h3", "", j.org));
      en.appendChild(el("div", "erole", j.role));
      en.appendChild(el("h4", "", j.headline));
      en.appendChild(el("p", "", j.text));
      $("vline").appendChild(seg);
      $("vline").appendChild(bub);
      $("vline").appendChild(en);
    });
    $("vline").appendChild(el("div", "seg reveal"));
    $("vline").appendChild(el("div", "endpill reveal", S.journeyEnd));
    $("vline").appendChild(el("div", "endbub reveal"));
  }

  /* ---------- modal ---------- */
  var modal = $("modal"), mbody = $("modal-body"), mtitle = $("modal-title"), lastFocus = null;
  function openModal(title, nodes) {
    lastFocus = document.activeElement;
    mtitle.textContent = title;
    mbody.innerHTML = "";
    nodes.forEach(function (n) { mbody.appendChild(n); });
    modal.hidden = false;
    document.body.classList.add("lock");
    mbody.scrollTop = 0;
    var x = modal.querySelector(".x"); if (x) x.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("lock");
    mbody.innerHTML = ""; // يوقف أي فيديو يعمل
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  }

  /* ---------- item cards ---------- */
  function buildCard(it) {
    var c = el("article", "card");
    if (it.type === "account") {
      c.className += " account";
      var av = el("div", "avatar");
      if (it.avatar) { var im = document.createElement("img"); im.src = it.avatar; im.alt = it.name; av.appendChild(im); }
      else av.appendChild(el("div", "letter", (it.name || "؟").replace(/^[^؀-ۿA-Za-z]+/, "").replace(/^بودكاست\s*/, "").charAt(0)));
      c.appendChild(av);
      c.appendChild(el("h4", "", it.name));
      c.appendChild(el("div", "atag", "حساب"));
      c.appendChild(el("p", "", it.desc));
      if (it.url) { var l = el("div", "links"); l.appendChild(link("زيارة الحساب", it.url)); c.appendChild(l); }
      return c;
    }
    if (it.video) {
      var v = document.createElement("video");
      v.controls = true; v.preload = "metadata"; v.setAttribute("playsinline", "");
      if (it.poster) v.poster = it.poster;
      v.src = it.video; c.appendChild(v);
    } else if (it.youtube) {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(it.youtube);
      f.title = it.title; f.loading = "lazy"; f.allowFullscreen = true;
      f.setAttribute("allow", "accelerometer; encrypted-media; picture-in-picture");
      c.appendChild(f);
    } else {
      var box = el("div", "card-img" + (it.tall ? " tall" : "") + (it.image ? "" : " ph"));
      if (it.image) { var g = document.createElement("img"); g.src = it.image; g.alt = it.imageAlt || it.title; g.loading = "lazy"; box.appendChild(g); }
      else box.innerHTML = ICONS[it.icon || "doc"];
      c.appendChild(box);
    }
    var b = el("div", "card-body");
    b.appendChild(el("h4", "", it.title));
    if (it.desc) b.appendChild(el("p", "", it.desc));
    if (it.links && it.links.length) {
      var ls = el("div", "links");
      it.links.forEach(function (x) { if (x.url) ls.appendChild(link(x.label, x.url)); });
      if (ls.children.length) b.appendChild(ls);
    }
    c.appendChild(b);
    return c;
  }

  /* ---------- folders ---------- */
  if ($("folders")) {
    var FC = [
      { bg: "#3b6aab", fg: "#0c1a35", bar: "rgba(12,26,53,.22)" },
      { bg: "#a85a9f", fg: "#0c1a35", bar: "rgba(12,26,53,.22)" },
      { bg: "#e0916e", fg: "#0c1a35", bar: "rgba(12,26,53,.18)" },
      { bg: "#d3234a", fg: "#0c1a35", bar: "rgba(12,26,53,.25)" },
      { bg: "#8fa6d6", fg: "#0c1a35", bar: "rgba(12,26,53,.18)" },
      { bg: "#274c86", fg: "#e6dcec", bar: "rgba(230,220,236,.2)" }
    ];
    var shown = 0;
    S.folders.forEach(function (f) {
      if (!f.items || !f.items.length) return;
      var col = FC[shown % FC.length]; shown++;
      var b = el("button", "folder reveal");
      b.type = "button";
      b.style.setProperty("--fb", col.bg); b.style.setProperty("--fc", col.fg); b.style.setProperty("--fbar", col.bar);
      b.appendChild(el("span", "tab"));
      var body = el("span", "body");
      body.appendChild(el("span", "bar"));
      var ic = el("span", "ico"); ic.innerHTML = ICONS[f.icon] || ICONS.doc; body.appendChild(ic);
      body.appendChild(el("span", "fname", f.title));
      var n = f.items.length;
      body.appendChild(el("span", "fcount", n === 1 ? "عمل واحد" : n === 2 ? "عملان" : n + (n <= 10 ? " أعمال" : " عملًا")));
      b.appendChild(body);
      b.addEventListener("click", function () { openModal(f.title, f.items.map(buildCard)); });
      $("folders").appendChild(b);
    });
  }

  /* ---------- locked works ---------- */
  if ($("locked-wrap") && S.locked && S.locked.items && S.locked.items.length) {
    var L = S.locked, box2 = el("div", "locked reveal");
    var lb = el("button", "lockbtn"); lb.type = "button"; lb.setAttribute("aria-label", "عرض الأعمال المحظورة");
    lb.innerHTML = ICONS.lock;
    box2.appendChild(lb);
    box2.appendChild(el("h3", "", L.title));
    box2.appendChild(el("p", "", L.hint));
    function openLocked() {
      var nodes = L.items.map(function (it) {
        var c = el("article", "card wide");
        var bd = el("div", "card-body");
        bd.appendChild(el("h4", "", it.title));
        if (it.illustration) {
          var t = el("div", "term");
          t.innerHTML = "<b>AMADEUS</b><span class='rd l'></span><span class='rd m'></span><span class='rd s'></span><span class='rd l'></span><em>رسم توضيحي بدون أي بيانات حقيقية، لسرّية بيانات الركاب والنظام.</em>";
          bd.appendChild(t);
        }
        bd.appendChild(el("p", "", it.desc));
        c.appendChild(bd);
        return c;
      });
      openModal(L.title, nodes);
    }
    lb.addEventListener("click", openLocked);
    $("locked-wrap").appendChild(box2);
  }

  /* ---------- skills ---------- */
  if ($("skills-grid")) {
    S.skills.forEach(function (s) {
      var b = el("div", "skill-box reveal");
      b.appendChild(el("h3", "", s.group));
      var ul = el("ul", "chips");
      s.items.forEach(function (t) { ul.appendChild(el("li", "", t)); });
      b.appendChild(ul);
      $("skills-grid").appendChild(b);
    });
  }
  if ($("skills-extra")) {
    if (S.courses && S.courses.length) {
      var cb = el("div", "skill-box reveal"); cb.appendChild(el("h3", "", "الدورات التدريبية"));
      var cl = el("ul", "courses"); S.courses.forEach(function (t) { cl.appendChild(el("li", "", t)); });
      cb.appendChild(cl); $("skills-extra").appendChild(cb);
    }
    if (S.languages && S.languages.length) {
      var lg = el("div", "skill-box reveal"); lg.appendChild(el("h3", "", "اللغات"));
      var ll = el("ul", "chips"); S.languages.forEach(function (t) { ll.appendChild(el("li", "", t)); });
      lg.appendChild(ll); $("skills-extra").appendChild(lg);
    }
  }

  /* ---------- blog ---------- */
  if ($("blog-area")) {
    if (S.posts && S.posts.length) {
      var list = el("div", "post-list");
      S.posts.slice().reverse().forEach(function (p) {
        var a = el("a", "post");
        a.href = "blog.html?id=" + encodeURIComponent(p.id);
        a.appendChild(el("time", "", arabicDate(p.date)));
        a.appendChild(el("h3", "", p.title));
        if (p.summary) a.appendChild(el("p", "", p.summary));
        list.appendChild(a);
      });
      $("blog-area").appendChild(list);
    }
    if (S.blogLink && S.blogLink.url) {
      var card = el("div", "blog-card reveal");
      card.appendChild(el("p", "", "نصوصي المنشورة تجدها في مدوّنتي على مسودة."));
      card.appendChild(link(S.blogLink.label, S.blogLink.url, "btn-main"));
      $("blog-area").appendChild(card);
    }
  }

  /* ---------- contact ---------- */
  if ($("contact-list")) {
    var c = S.contact, cl2 = $("contact-list");
    function row(ic, text, href, ltr) {
      var a = el(href ? "a" : "div", href ? "" : "plain");
      if (href) { a.href = href; if (href.indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; } }
      a.appendChild(el("span", "ic", ic));
      var t = ltr ? document.createElement("bdi") : document.createElement("span");
      t.textContent = text; a.appendChild(t); cl2.appendChild(a);
    }
    if (c.email) row("@", c.email, "mailto:" + c.email, true);
    if (c.phone) row("☎", c.phone, "tel:" + c.phone, true);
    if (c.linkedin) row("in", "LinkedIn — عائشة جابرة", c.linkedin);
    if (c.cv) row("CV", "السيرة الذاتية", c.cv);
    if (c.location) row("⌖", c.location, "");
  }

  /* ---------- single post ---------- */
  if ($("post-root")) {
    var id = new URLSearchParams(location.search).get("id");
    var p = (S.posts || []).filter(function (x) { return x.id === id; })[0];
    var root = $("post-root");
    if (!p) root.appendChild(el("h1", "", "المقال غير موجود"));
    else {
      document.title = p.title + " — " + S.name;
      root.appendChild(el("time", "", arabicDate(p.date)));
      root.appendChild(el("h1", "", p.title));
      var body2 = el("div", "body");
      p.body.forEach(function (t) { body2.appendChild(el("p", "", t)); });
      root.appendChild(body2);
    }
  }

  /* ---------- nav ---------- */
  var burger = $("burger"), menu = $("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
    menu.addEventListener("click", function (e) { if (e.target.tagName === "A") menu.classList.remove("open"); });
    var links = menu.querySelectorAll("a");
    if ("IntersectionObserver" in window) {
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["home", "journey", "projects", "skills", "blog", "contact"].forEach(function (id2) { var s = $(id2); if (s) so.observe(s); });
    }
  }

  /* ---------- reveal on scroll ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(function (i) { io.observe(i); });
  } else { items.forEach(function (i) { i.classList.add("in"); }); }
})();
