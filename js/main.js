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
            if (a) a.textContent = t;
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
