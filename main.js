(function () {
  var S = window.SITE;
  if (!S) return;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.textContent = html;
    return e;
  }
  function link(label, url, cls) {
    var a = el("a", "btn btn-sm " + (cls || "btn-blue"), label);
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    return a;
  }
  function $(id) { return document.getElementById(id); }
  function arabicDate(iso) {
    try { return new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return iso; }
  }

  // ---- header / hero / footer text ----
  document.querySelectorAll("[data-name]").forEach(function (n) { n.textContent = S.name; });
  document.querySelectorAll("[data-role]").forEach(function (n) { n.textContent = S.role; });
  if ($("tagline")) $("tagline").textContent = "« " + S.tagline + " »";
  if ($("tagline-author")) $("tagline-author").textContent = "— " + S.taglineAuthor;
  if ($("year")) $("year").textContent = new Date().getFullYear();

  // ---- about ----
  if ($("about-text")) {
    S.about.forEach(function (t, i) { $("about-text").appendChild(el("p", i === 0 ? "lead" : "", t)); });
  }

  // ---- journey ----
  if ($("timeline")) {
    S.journey.forEach(function (j, i) {
      var li = el("li", "tl-item reveal" + (i === S.journey.length - 1 ? " latest" : ""));
      li.appendChild(el("div", "tl-period", j.period));
      li.appendChild(el("h3", "", j.title));
      li.appendChild(el("div", "tl-place", j.place));
      if (j.note) li.appendChild(el("div", "tl-note", j.note));
      $("timeline").appendChild(li);
    });
  }

  // ---- projects ----
  if ($("projects-list")) {
    S.projectGroups.forEach(function (g) {
      var box = el("div", "pgroup reveal");
      box.id = g.id;
      box.appendChild(el("h3", "", g.title));
      box.appendChild(el("p", "gi", g.intro));
      var grid = el("div", "grid");
      g.items.forEach(function (it) {
        var c = el("article", "card");
        var im = el("div", "card-img" + (it.tall ? " tall" : ""));
        var img = document.createElement("img");
        img.src = it.image; img.alt = it.imageAlt || it.title; img.loading = "lazy";
        im.appendChild(img);
        var b = el("div", "card-body");
        b.appendChild(el("h4", "", it.title));
        b.appendChild(el("p", "", it.desc));
        if (it.links && it.links.length) {
          var l = el("div", "links");
          it.links.forEach(function (x) { if (x.url) l.appendChild(link(x.label, x.url)); });
          b.appendChild(l);
        }
        c.appendChild(im); c.appendChild(b); grid.appendChild(c);
      });
      box.appendChild(grid);
      $("projects-list").appendChild(box);
    });
  }

  // ---- skills ----
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

  // ---- blog (home) ----
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
      card.appendChild(el("p", "", "نصوصي المنشورة تجدينها في مدوّنتي على مسودة."));
      card.appendChild(link(S.blogLink.label, S.blogLink.url, "btn-light"));
      $("blog-area").appendChild(card);
    }
  }

  // ---- contact ----
  if ($("contact-list")) {
    var c = S.contact, cl = $("contact-list");
    function row(ic, text, href, ltr) {
      var a = el("a"); a.href = href;
      if (href.indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      a.appendChild(el("span", "ic", ic));
      var t = ltr ? document.createElement("bdi") : document.createElement("span");
      t.textContent = text; a.appendChild(t); cl.appendChild(a);
    }
    if (c.email) row("@", c.email, "mailto:" + c.email, true);
    if (c.phone) row("☎", c.phone, "tel:" + c.phone, true);
    if (c.linkedin) row("in", "LinkedIn — عائشة جابرة", c.linkedin);
    if (c.cv) row("CV", "السيرة الذاتية", c.cv);
  }

  // ---- single post page ----
  if ($("post-root")) {
    var id = new URLSearchParams(location.search).get("id");
    var p = (S.posts || []).filter(function (x) { return x.id === id; })[0];
    var root = $("post-root");
    if (!p) {
      root.appendChild(el("h1", "", "المقال غير موجود"));
    } else {
      document.title = p.title + " — " + S.name;
      root.appendChild(el("time", "", arabicDate(p.date)));
      root.appendChild(el("h1", "", p.title));
      var body = el("div", "body");
      p.body.forEach(function (t) { body.appendChild(el("p", "", t)); });
      root.appendChild(body);
    }
  }

  // ---- nav toggle ----
  var burger = $("burger"), menu = $("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
    menu.addEventListener("click", function (e) { if (e.target.tagName === "A") menu.classList.remove("open"); });
  }

  // ---- reveal on scroll ----
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  } else { items.forEach(function (i) { i.classList.add("in"); }); }
})();
