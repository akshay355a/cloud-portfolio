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
        outputHtml: `<div class="term-out term-accent">akshay@cloud <span class="term-muted">(Cloud / DevOps Engineer)</span></div>`
      },
      {
        cmd: 'stack --featured',
        typeSpeed: 38,
        postDelay: 260,
        outputHtml: `
          <ul class="term-list">
            <li>AWS (EKS, VPC, RDS, IAM)</li>
            <li>Terraform (IaC Automation)</li>
            <li>Kubernetes &amp; Docker</li>
            <li>CI/CD (Jenkins, Trivy, SonarQube)</li>
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
        const jitter = Math.random() * 20 - 10;
        await sleep(Math.max(15, speed + jitter));
      }
      return true;
    };

    const runTerminal = async () => {
      const sessionId = ++currentSession;
      terminalBody.innerHTML = '';

      await sleep(300);
      if (sessionId !== currentSession) return;

      for (let i = 0; i < commands.length; i++) {
        const item = commands[i];

        const lineEl = document.createElement('div');
        lineEl.className = 'term-line';

        const cmdEl = document.createElement('div');
        cmdEl.className = 'term-cmd';
        cmdEl.innerHTML = `<span class="term-prompt">$</span> <span class="term-cmd-text"></span><span class="term-cursor"></span>`;
        lineEl.appendChild(cmdEl);
        terminalBody.appendChild(lineEl);

        const textSpan = cmdEl.querySelector('.term-cmd-text');
        const cursorSpan = cmdEl.querySelector('.term-cursor');

        const finished = await typeText(textSpan, item.cmd, item.typeSpeed, sessionId);
        if (!finished) return;

        await sleep(item.postDelay);
        if (sessionId !== currentSession) return;

        if (cursorSpan) cursorSpan.remove();

        const outputWrapper = document.createElement('div');
        outputWrapper.innerHTML = item.outputHtml;
        lineEl.appendChild(outputWrapper);

        terminalBody.scrollTop = terminalBody.scrollHeight;

        await sleep(350);
        if (sessionId !== currentSession) return;
      }

      // Final active prompt with blinking cursor
      const finalLine = document.createElement('div');
      finalLine.className = 'term-line';
      finalLine.style.marginTop = '4px';
      finalLine.innerHTML = `<div class="term-cmd"><span class="term-prompt">$</span><span class="term-cursor"></span></div>`;
      terminalBody.appendChild(finalLine);
      terminalBody.scrollTop = terminalBody.scrollHeight;

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
