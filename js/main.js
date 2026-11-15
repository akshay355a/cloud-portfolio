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
