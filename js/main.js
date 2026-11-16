(function () {
        function tick() {
          try {
            var t = new Date().toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            });
            var a = document.getElementById("clock");
            var b = document.getElementById("clock2");
            if (a) a.textContent = t;
            if (b) b.textContent = t;
          } catch (e) { /* clock is decoration; fail silent */ }
        }
        tick();
        setInterval(tick, 30000);
      })();

// Back to top link (replaces the inline onclick, which the site's
// Content-Security-Policy blocks).
document.querySelectorAll('a[href="#top"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Hidden projects: the footer link reveals them.
var hpToggle = document.getElementById("hidden-toggle");
var hpSection = document.getElementById("hidden-projects");
if (hpToggle && hpSection) {
  hpToggle.addEventListener("click", function () {
    var isHidden = hpSection.hasAttribute("hidden");
    if (isHidden) {
      hpSection.removeAttribute("hidden");
      hpSection.scrollIntoView({ behavior: "smooth" });
      hpToggle.textContent = "Hide hidden projects";
    } else {
      hpSection.setAttribute("hidden", "");
      hpToggle.textContent = "Hidden projects";
    }
  });
}

// Butter-smooth scrolling for desktop mouse wheels. The wheel is eased
// toward its target with requestAnimationFrame, so scrolling glides
// instead of jumping notch by notch. Touch devices keep the phone's
// own native momentum scrolling, which is already smooth, and anchor
// links glide via the CSS scroll-behavior.
//
// The glide is a critically damped spring, not a plain lerp: a lerp
// jumps to full speed the instant you touch the wheel, which is what
// makes it feel steppy. The spring starts at zero speed, speeds up
// gently, then slows down gently into place — no sudden kicks, no
// overshoot. It is time-based, so it feels the same on 60 Hz and
// 144 Hz screens.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion || !finePointer) return;

  var root = document.documentElement;
  var target = window.scrollY;
  var current = window.scrollY;
  var velocity = 0;
  var raf = null;
  var last = 0;

  var STIFFNESS = 70; // lower = longer, silkier glide
  var DAMPING = 2 * Math.sqrt(STIFFNESS); // critical damping: no overshoot

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    root.style.scrollBehavior = "";
    target = window.scrollY;
    current = window.scrollY;
    velocity = 0;
  }

  function step(now) {
    var dt = Math.min((now - last) / 1000, 0.05); // seconds, clamped
    last = now;
    var accel = STIFFNESS * (target - current) - DAMPING * velocity;
    velocity += accel * dt;
    current += velocity * dt;
    if (Math.abs(target - current) < 0.5 && Math.abs(velocity) < 10) {
      window.scrollTo(0, target);
      stop();
      return;
    }
    window.scrollTo(0, current);
    raf = requestAnimationFrame(step);
  }

  window.addEventListener("wheel", function (e) {
    if (e.target instanceof Element && e.target.closest("[data-native-scroll]")) return;
    e.preventDefault();
    root.style.scrollBehavior = "auto";
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16; // lines -> pixels
    else if (e.deltaMode === 2) dy *= window.innerHeight; // pages -> pixels
    target += dy;
    var max = root.scrollHeight - window.innerHeight;
    if (target < 0) target = 0;
    if (target > max) target = max;
    if (!raf) {
      current = window.scrollY;
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  }, { passive: false });

  // Let the user take over instantly with keys, touch, or the scrollbar.
  ["touchstart", "keydown", "mousedown"].forEach(function (evt) {
    window.addEventListener(evt, stop, { passive: true });
  });
})();

// Scroll plane: a paper plane that flies along a curving path across
// the screen as you scroll (GSAP ScrollTrigger + MotionPath, scrubbed
// to the page scroll, with a faint trail drawing behind it). The GSAP
// files are vendored in js/vendor/ because the site's CSP only allows
// same-origin scripts. Skipped for reduced-motion users.
(function () {
  try {
    if (!window.gsap || !window.ScrollTrigger || !window.MotionPathPlugin) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    var plane = document.querySelector(".scroll-smooth-breeze__plane");
    var trailSvg = document.querySelector(".scroll-smooth-breeze__trail");
    var path = document.getElementById("plane-path");
    if (!plane || !trailSvg || !path) return;

    var tween = null;
    var trigger = null;

    function waypoints() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      return [
        { x: -0.08 * w, y: 0.14 * h },
        { x: 0.28 * w, y: 0.20 * h },
        { x: 0.62 * w, y: 0.34 * h },
        { x: 0.30 * w, y: 0.52 * h },
        { x: 0.66 * w, y: 0.68 * h },
        { x: 0.90 * w, y: 0.82 * h },
        { x: 1.08 * w, y: 0.94 * h }
      ];
    }

    function smoothPath(points) {
      var d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
      for (var i = 0; i < points.length - 1; i++) {
        var p0 = points[Math.max(0, i - 1)];
        var p1 = points[i];
        var p2 = points[i + 1];
        var p3 = points[Math.min(points.length - 1, i + 2)];
        var c1x = p1.x + (p2.x - p0.x) / 6;
        var c1y = p1.y + (p2.y - p0.y) / 6;
        var c2x = p2.x - (p3.x - p1.x) / 6;
        var c2y = p2.y - (p3.y - p1.y) / 6;
        d += " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) +
             ", " + c2x.toFixed(1) + " " + c2y.toFixed(1) +
             ", " + p2.x.toFixed(1) + " " + p2.y.toFixed(1);
      }
      return d;
    }

    function build() {
      if (trigger) { trigger.kill(); trigger = null; }
      if (tween) { tween.kill(); tween = null; }
      var w = window.innerWidth;
      var h = window.innerHeight;
      trailSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
      path.setAttribute("d", smoothPath(waypoints()));
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;

      gsap.set(plane, { autoAlpha: 1 });

      tween = gsap.to(plane, {
        ease: "none",
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: true
        }
      });

      trigger = ScrollTrigger.create({
        animation: tween,
        trigger: document.body,
        start: "top top",
        end: "max",
        scrub: 0.5,
        onUpdate: function (self) {
          path.style.strokeDashoffset = len * (1 - self.progress);
        }
      });
    }

    build();

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        build();
        ScrollTrigger.refresh();
      }, 250);
    });
  } catch (e) { /* plane is decoration; fail silent */ }
})();
