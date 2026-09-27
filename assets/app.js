/* Extrêmes — amélioration progressive. Le contenu reste entièrement lisible sans JavaScript. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " "); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* Thème */
  var tbtn = d.getElementById("theme-toggle");
  if (tbtn) tbtn.addEventListener("click", function () {
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store("theme", root.dataset.theme);
  });

  /* Menu mobile */
  var nbtn = d.getElementById("nav-toggle"), nav = d.getElementById("nav");
  if (nbtn && nav) nbtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    nbtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  /* Recherche : index statique data/search.json (API JSON du site) */
  var INDEX = null, loading = null;
  function loadIndex() {
    if (INDEX) return Promise.resolve(INDEX);
    if (loading) return loading;
    loading = fetch("data/search.json").then(function (r) { return r.json(); }).then(function (j) {
      INDEX = j.map(function (p) { p._t = norm(p.t); p._h = norm(p.h.join(" ")); p._k = norm(p.k.join(" ")); p._d = norm(p.d); p._x = norm(p.x); return p; });
      return INDEX;
    });
    return loading;
  }
  function search(q) {
    var terms = norm(q).split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) return [];
    var res = [];
    INDEX.forEach(function (p) {
      var sc = 0, all = true;
      terms.forEach(function (t) {
        var s = 0;
        if (p._t.indexOf(t) > -1) s += 12;
        if (p._k.indexOf(t) > -1) s += 8;
        if (p._h.indexOf(t) > -1) s += 6;
        if (p._d.indexOf(t) > -1) s += 4;
        var c = p._x.split(t).length - 1; s += Math.min(c, 8);
        if (!s) all = false; sc += s;
      });
      if (sc && all) res.push({ p: p, s: sc });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, 20).map(function (r) { return r.p; });
  }
  function snippet(p, q) {
    var t = norm(q).split(/\s+/)[0], i = p._x.indexOf(t);
    if (i < 0) return esc(p.d);
    var a = Math.max(0, i - 70), txt = p.x.substr(a, 190);
    var re = new RegExp("(" + q.split(/\s+/).filter(Boolean).map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "gi");
    return (a ? "… " : "") + esc(txt).replace(re, "<mark>$1</mark>") + " …";
  }
  function render(list, q, el) {
    if (!q.trim()) { el.innerHTML = ""; return; }
    if (!list.length) { el.innerHTML = '<li><p class="muted" style="padding:10px 12px;margin:0">Aucun résultat pour « ' + esc(q) + " ».</p></li>"; return; }
    el.innerHTML = list.map(function (p, i) {
      return '<li><a href="' + p.u + '"' + (i === 0 ? ' class="sel"' : "") + "><b>" + esc(p.t) + "</b><small>" + esc(p.s || "") + "</small><small>" + snippet(p, q) + "</small></a></li>";
    }).join("");
  }
  var modal = d.getElementById("search-modal"), qm = d.getElementById("q-modal"), rm = d.getElementById("search-results");
  function openSearch() {
    if (!modal) return;
    modal.hidden = false; qm.value = ""; rm.innerHTML = ""; qm.focus();
    loadIndex().catch(function () { rm.innerHTML = '<li><p class="muted" style="padding:10px">Index indisponible (ouvrez le site via un serveur web).</p></li>'; });
  }
  function closeSearch() { if (modal) modal.hidden = true; }
  var sbtn = d.getElementById("search-open");
  if (sbtn) sbtn.addEventListener("click", openSearch);
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal) closeSearch(); });
    qm.addEventListener("input", function () { loadIndex().then(function () { render(search(qm.value), qm.value, rm); }); });
    qm.addEventListener("keydown", function (e) {
      var links = rm.querySelectorAll("a"), cur = rm.querySelector("a.sel"), i = Array.prototype.indexOf.call(links, cur);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (!links.length) return;
        if (cur) cur.classList.remove("sel");
        i = e.key === "ArrowDown" ? Math.min(links.length - 1, i + 1) : Math.max(0, i - 1);
        links[i].classList.add("sel"); links[i].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && cur) { e.preventDefault(); location.href = cur.getAttribute("href"); }
    });
  }
  d.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "Escape") closeSearch();
    if ((e.key === "/" && tag !== "input" && tag !== "textarea") || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); openSearch(); }
  });
  var sp = d.getElementById("q-page"), spr = d.getElementById("results-page");
  if (sp && spr) {
    var q0 = new URLSearchParams(location.search).get("q") || "";
    sp.value = q0;
    loadIndex().then(function () { render(search(q0), q0, spr); });
    sp.addEventListener("input", function () { render(search(sp.value), sp.value, spr); history.replaceState(null, "", "?q=" + encodeURIComponent(sp.value)); });
  }

  /* Façade YouTube : aucune requête vers YouTube avant le clic (vie privée, performance) */
  Array.prototype.forEach.call(d.querySelectorAll(".yt[data-id]"), function (el) {
    var id = el.getAttribute("data-id");
    el.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    var b = el.querySelector("button");
    b.addEventListener("click", function () {
      var f = d.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.title = el.getAttribute("data-title") || "Vidéo YouTube";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true; f.loading = "lazy"; f.referrerPolicy = "strict-origin-when-cross-origin";
      el.innerHTML = ""; el.appendChild(f);
    });
  });

  /* Filtres (chronologie, acteurs, glossaire) */
  Array.prototype.forEach.call(d.querySelectorAll("[data-filter-for]"), function (bar) {
    var target = d.getElementById(bar.getAttribute("data-filter-for"));
    if (!target) return;
    var items = target.querySelectorAll("[data-camp]"), camp = "tous", input = bar.querySelector("input");
    function apply() {
      var q = norm(input ? input.value : "");
      Array.prototype.forEach.call(items, function (it) {
        var okc = camp === "tous" || (" " + it.getAttribute("data-camp") + " ").indexOf(" " + camp + " ") > -1;
        var okq = !q || norm(it.textContent).indexOf(q) > -1;
        it.hidden = !(okc && okq);
      });
      var c = bar.querySelector(".count");
      if (c) c.textContent = target.querySelectorAll("[data-camp]:not([hidden])").length + " élément(s)";
    }
    Array.prototype.forEach.call(bar.querySelectorAll("button[data-camp-btn]"), function (b) {
      b.addEventListener("click", function () {
        camp = b.getAttribute("data-camp-btn");
        Array.prototype.forEach.call(bar.querySelectorAll("button[data-camp-btn]"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
      });
    });
    if (input) input.addEventListener("input", apply);
    apply();
  });

  /* Tri des tableaux */
  Array.prototype.forEach.call(d.querySelectorAll("table.sortable"), function (t) {
    var ths = t.querySelectorAll("thead th");
    Array.prototype.forEach.call(ths, function (th, idx) {
      th.setAttribute("aria-sort", "none"); th.tabIndex = 0;
      function sort() {
        var asc = th.getAttribute("aria-sort") !== "ascending";
        Array.prototype.forEach.call(ths, function (x) { x.setAttribute("aria-sort", "none"); });
        th.setAttribute("aria-sort", asc ? "ascending" : "descending");
        var tb = t.tBodies[0], rows = Array.prototype.slice.call(tb.rows);
        rows.sort(function (a, b) {
          var x = a.cells[idx].getAttribute("data-v") || a.cells[idx].textContent.trim(), y = b.cells[idx].getAttribute("data-v") || b.cells[idx].textContent.trim();
          var nx = parseFloat(x.replace(/\s/g, "").replace(",", ".")), ny = parseFloat(y.replace(/\s/g, "").replace(",", "."));
          var r = (!isNaN(nx) && !isNaN(ny)) ? nx - ny : x.localeCompare(y, "fr");
          return asc ? r : -r;
        });
        rows.forEach(function (r) { tb.appendChild(r); });
      }
      th.addEventListener("click", sort);
      th.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sort(); } });
    });
  });

  /* Sommaire actif */
  var tocLinks = d.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    Array.prototype.forEach.call(tocLinks, function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          Array.prototype.forEach.call(tocLinks, function (a) { a.classList.remove("active"); });
          map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = d.getElementById(id); if (h) io.observe(h); });
  }
})();
