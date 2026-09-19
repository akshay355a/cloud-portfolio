(() => {
  // Mobile Navigation Toggle
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Dynamic Year
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Live Terminal Shell Typewriter Engine
  const terminalBody = document.getElementById('terminal-body');

  if (terminalBody) {
    const commands = [
      {
        cmd: 'whoami',
        typeSpeed: 42,
        postDelay: 220,
        outputHtml: `<div class="term-out term-accent">akshay@cloud <span style="color:#8f8f8f;font-weight:400;">(Cloud / DevOps Engineer)</span></div>`
      },
      {
        cmd: 'stack --featured',
        typeSpeed: 38,
        postDelay: 260,
        outputHtml: `
          <ul class="term-list">
            <li><span>AWS (EKS, VPC, RDS, IAM)</span><span class="term-check">✓</span></li>
            <li><span>Terraform (IaC Automation)</span><span class="term-check">✓</span></li>
            <li><span>Kubernetes &amp; Docker</span><span class="term-check">✓</span></li>
            <li><span>CI/CD (Jenkins, Trivy, SonarQube)</span><span class="term-check">✓</span></li>
          </ul>
        `
      },
      {
        cmd: 'deploy --status',
        typeSpeed: 38,
        postDelay: 240,
        outputHtml: `
          <div class="term-out term-log">[ok] cluster: healthy (us-east-1)</div>
          <div class="term-out term-good">status: deployment_ready=true</div>
        `
      }
    ];

    let currentSession = 0;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const typeText = async (element, text, speed, sessionId) => {
      for (let i = 0; i < text.length; i++) {
        if (sessionId !== currentSession) return false;
        element.textContent += text[i];
        // subtle human-like typing jitter
        const jitter = Math.random() * 20 - 10;
        await sleep(Math.max(15, speed + jitter));
      }
      return true;
    };

    const runTerminal = async () => {
      const sessionId = ++currentSession;
      terminalBody.innerHTML = '';

      // Initial short pause before starting first command
      await sleep(300);
      if (sessionId !== currentSession) return;

      for (let i = 0; i < commands.length; i++) {
        const item = commands[i];

        // Create command line container
        const lineEl = document.createElement('div');
        lineEl.className = 'term-line';

        const cmdEl = document.createElement('div');
        cmdEl.className = 'term-cmd';
        cmdEl.innerHTML = `<span class="term-prompt">$</span> <span class="term-cmd-text"></span><span class="term-cursor"></span>`;
        lineEl.appendChild(cmdEl);
        terminalBody.appendChild(lineEl);

        const textSpan = cmdEl.querySelector('.term-cmd-text');
        const cursorSpan = cmdEl.querySelector('.term-cursor');

        // Type command character by character
        const finished = await typeText(textSpan, item.cmd, item.typeSpeed, sessionId);
        if (!finished) return;

        // Pause before hitting enter & executing command
        await sleep(item.postDelay);
        if (sessionId !== currentSession) return;

        // Remove cursor from this completed command
        if (cursorSpan) cursorSpan.remove();

        // Render command execution output
        const outputWrapper = document.createElement('div');
        outputWrapper.innerHTML = item.outputHtml;
        lineEl.appendChild(outputWrapper);

        // Scroll into view if needed
        terminalBody.scrollTop = terminalBody.scrollHeight;

        // Pause between commands
        await sleep(350);
        if (sessionId !== currentSession) return;
      }

      // Final active prompt with blinking cursor and replay button
      const finalLine = document.createElement('div');
      finalLine.className = 'term-line';
      finalLine.style.marginTop = '4px';
      finalLine.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
          <div class="term-cmd"><span class="term-prompt">$</span><span class="term-cursor"></span></div>
          <button class="term-replay-btn" type="button" aria-label="Replay terminal animation">↺ rerun</button>
        </div>
      `;
      terminalBody.appendChild(finalLine);
      terminalBody.scrollTop = terminalBody.scrollHeight;

      const replayBtn = finalLine.querySelector('.term-replay-btn');
      if (replayBtn) {
        replayBtn.addEventListener('click', () => {
          runTerminal();
        });
      }

      // Auto-restart after 8 seconds of idle
      await sleep(8000);
      if (sessionId === currentSession) {
        runTerminal();
      }
    };

    // Start terminal animation
    runTerminal();
  }
})();
