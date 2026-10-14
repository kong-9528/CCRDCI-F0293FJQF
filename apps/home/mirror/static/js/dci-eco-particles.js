/**
 * /dci/eco 「DCI可信生态」板块背景：粒子连线星座动效
 * 改编自设计参考 Particle Constellation Background
 */
(function () {
  var COLOR = { r: 19, g: 69, b: 165 }; // #1345A5
  var COUNT = 45; // 线条数量约减半
  var LINK_DIST = 140;
  var MOUSE_DIST = 180;
  var LINE_ALPHA = 0.22; // 线条更浅
  var DOT_ALPHA = 0.28;
  var state = null;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function rgba(a) {
    return "rgba(" + COLOR.r + "," + COLOR.g + "," + COLOR.b + "," + a + ")";
  }

  function makeParticle(w, h) {
    var isBright = Math.random() < 0.12;
    return {
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.25, 0.25),
      r: isBright ? rand(2.2, 3.2) : rand(1.0, 1.8),
    };
  }

  function destroy() {
    if (!state) return;
    cancelAnimationFrame(state.raf);
    if (state.ro) state.ro.disconnect();
    if (state.onWinResize) window.removeEventListener("resize", state.onWinResize);
    state.host.removeEventListener("mousemove", state.onMove);
    state.host.removeEventListener("mouseleave", state.onLeave);
    state.host.classList.remove("eco-body--particles");
    if (state.canvas && state.canvas.parentNode) {
      state.canvas.parentNode.removeChild(state.canvas);
    }
    state = null;
  }

  function mount(host) {
    if (!host) return;
    host.classList.add("eco-body--particles");

    var canvas = document.createElement("canvas");
    canvas.className = "eco-particles-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.insertBefore(canvas, host.firstChild);

    var ctx = canvas.getContext("2d");
    var particles = [];
    var mouse = { x: -9999, y: -9999, active: false };
    var w = 0;
    var h = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var raf = 0;

    function resize() {
      var rect = host.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var need = Math.max(20, Math.round((COUNT * (w * h)) / (1200 * 520)));
      need = Math.min(60, need);
      while (particles.length < need) particles.push(makeParticle(w, h));
      while (particles.length > need) particles.pop();
      for (var i = 0; i < particles.length; i++) {
        particles[i].x = Math.min(w, Math.max(0, particles[i].x));
        particles[i].y = Math.min(h, Math.max(0, particles[i].y));
      }
    }

    function onMove(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function step() {
      var p, dx, dy, d, i, a, b;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        }
        if (p.x > w) {
          p.x = w;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        }
        if (p.y > h) {
          p.y = h;
          p.vy *= -1;
        }
        if (Math.random() < 0.005) {
          p.vx = rand(-0.3, 0.3);
          p.vy = rand(-0.3, 0.3);
        }
      }

      ctx.clearRect(0, 0, w, h);

      for (a = 0; a < particles.length; a++) {
        for (b = a + 1; b < particles.length; b++) {
          dx = particles[a].x - particles[b].x;
          dy = particles[a].y - particles[b].y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            ctx.strokeStyle = rgba((1 - d / LINK_DIST) * LINE_ALPHA);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      if (mouse.active) {
        for (i = 0; i < particles.length; i++) {
          p = particles[i];
          dx = p.x - mouse.x;
          dy = p.y - mouse.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < MOUSE_DIST) {
            ctx.strokeStyle = rgba((1 - d / MOUSE_DIST) * LINE_ALPHA);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(DOT_ALPHA);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
      if (state) state.raf = raf;
    }

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    resize();

    var ro = null;
    var onWinResize = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(host);
    } else {
      onWinResize = resize;
      window.addEventListener("resize", onWinResize);
    }

    raf = requestAnimationFrame(step);
    state = {
      host: host,
      canvas: canvas,
      raf: raf,
      ro: ro,
      onWinResize: onWinResize,
      onMove: onMove,
      onLeave: onLeave,
    };
  }

  function sync() {
    var path = location.pathname || "";
    var onEco = path.indexOf("/dci/eco") >= 0;
    var host = document.querySelector(".eco-body");
    if (onEco && host) {
      if (!state || state.host !== host) {
        destroy();
        mount(host);
      }
    } else if (state) {
      destroy();
    }
  }

  function boot() {
    sync();
    var _push = history.pushState;
    var _replace = history.replaceState;
    history.pushState = function () {
      var r = _push.apply(this, arguments);
      setTimeout(sync, 60);
      return r;
    };
    history.replaceState = function () {
      var r = _replace.apply(this, arguments);
      setTimeout(sync, 60);
      return r;
    };
    window.addEventListener("popstate", function () {
      setTimeout(sync, 60);
    });
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      sync();
      if ((state && state.host) || tries > 40) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
