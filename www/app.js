(function () {
  var D = window.FIQHU_DATA;
  var view = document.getElementById("view");
  var titleEl = document.getElementById("title");
  var backBtn = document.getElementById("back");
  var langBtn = document.getElementById("lang");
  var sizeBtn = document.getElementById("size");

  var LANGS = ["both", "ha", "ar"];
  var LABEL = { both: "HA+AR", ha: "HA", ar: "AR" };
  var SIZES = [15, 17, 19, 22];

  function load(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var lang = load("fiqhu_lang", "both");
  var sizeIdx = parseInt(load("fiqhu_size", "1"), 10);
  if (!(sizeIdx >= 0 && sizeIdx < SIZES.length)) sizeIdx = 1;
  var current = null; // current chapter index, null = home

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // one bilingual text block honoring the language setting
  function bi(obj, haCls, arCls, tag) {
    var box = el(tag || "div");
    if (lang !== "ar" && obj.ha) box.appendChild(el("div", haCls || "ha", obj.ha));
    if (lang !== "ha" && obj.ar) box.appendChild(el("div", "ar " + (arCls || ""), obj.ar));
    return box;
  }

  function applyPrefs() {
    document.documentElement.style.setProperty("--fs", SIZES[sizeIdx] + "px");
    langBtn.textContent = LABEL[lang];
  }

  function setHeader(text, showBack) {
    titleEl.textContent = text;
    backBtn.hidden = !showBack;
  }

  function home() {
    current = null;
    setHeader("Fiqhu", false);
    view.innerHTML = "";
    var n = el("div", "notice");
    n.textContent = D.notice.ha;
    view.appendChild(n);
    D.chapters.forEach(function (c, i) {
      var b = el("button", "card");
      b.appendChild(el("div", "num", String(c.id)));
      var t = el("div", "t");
      if (lang !== "ar") t.appendChild(el("div", "ha", c.title.ha));
      if (lang !== "ha") t.appendChild(el("div", "ar", c.title.ar));
      b.appendChild(t);
      b.onclick = function () { openChapter(i); };
      view.appendChild(b);
    });
    window.scrollTo(0, 0);
  }

  function lessonBody(l) {
    var body = el("div", "body");
    if (l.body) {
      if (lang !== "ar") body.appendChild(el("p", "p", l.body.ha));
      if (lang !== "ha") body.appendChild(el("p", "p ar", l.body.ar));
    }
    if (l.items) {
      l.items.forEach(function (it) {
        var r = el("div", "row");
        r.appendChild(bi(it));
        body.appendChild(r);
      });
    }
    if (l.note) {
      var n = el("div", "note");
      n.appendChild(bi(l.note, "ha", ""));
      body.appendChild(n);
    }
    return body;
  }

  function quiz(c) {
    var wrap = el("div");
    wrap.appendChild(el("h2", "", "Tambayoyi / أسئلة"));
    var score = el("div", "score");
    var correct = 0, answered = 0;
    c.quiz.forEach(function (q) {
      var box = el("div", "q");
      box.appendChild(bi(q.q, "ha-t", "ar-t"));
      var done = false;
      var opts = (lang === "ar") ? q.options.ar : q.options.ha;
      opts.forEach(function (o, idx) {
        var b = el("button", "opt" + (lang === "ar" ? " ar" : ""), o);
        b.onclick = function () {
          if (done) return;
          done = true;
          answered++;
          var all = box.querySelectorAll(".opt");
          if (idx === q.answer) { b.classList.add("ok"); correct++; }
          else { b.classList.add("no"); all[q.answer].classList.add("ok"); }
          if (answered === c.quiz.length) score.textContent = correct + " / " + c.quiz.length;
        };
        box.appendChild(b);
      });
      wrap.appendChild(box);
    });
    wrap.appendChild(score);
    return wrap;
  }

  function openChapter(i) {
    current = i;
    var c = D.chapters[i];
    setHeader(lang === "ar" ? c.title.ar : c.title.ha, true);
    view.innerHTML = "";
    c.lessons.forEach(function (l) {
      var box = el("div", "lesson");
      var head = el("button");
      head.appendChild(bi(l.title, "ha-t", "ar-t"));
      box.appendChild(head);
      box.appendChild(lessonBody(l));
      head.onclick = function () { box.classList.toggle("open"); };
      view.appendChild(box);
    });
    view.appendChild(quiz(c));
    var n = el("div", "notice");
    n.textContent = D.notice.ha;
    view.appendChild(n);
    window.scrollTo(0, 0);
  }

  function rerender() { if (current === null) home(); else openChapter(current); }

  backBtn.onclick = home;
  langBtn.onclick = function () {
    lang = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    save("fiqhu_lang", lang);
    applyPrefs();
    rerender();
  };
  sizeBtn.onclick = function () {
    sizeIdx = (sizeIdx + 1) % SIZES.length;
    save("fiqhu_size", String(sizeIdx));
    applyPrefs();
  };
  document.addEventListener("backbutton", function () { if (current !== null) home(); });

  applyPrefs();
  home();
})();
