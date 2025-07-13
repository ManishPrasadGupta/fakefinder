
var currentUrl = window.location.href;

// ==== UI Elements ====
const alertElm = document.createElement("div");
alertElm.title = "⚠️ This is a malicious site.";
alertElm.textContent = "⚠️"; 
const safeElm = document.createElement("div");
safeElm.textContent = "\u2705";

// ==== Styles ====
const style = document.createElement("style");

style.textContent = `
@keyframes pulse {
  0% { transform: scale(1) rotate(0deg);}
  50% { transform: scale(1.15) rotate(-5deg);}
  100% { transform: scale(1) rotate(0deg);}
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px);}
  to   { opacity: 1; transform: translateY(0);}
}
@keyframes blurIn {
  from { backdrop-filter: blur(0px); }
  to { backdrop-filter: blur(8px);}
}
.pulsing {
  animation: pulse 1.2s cubic-bezier(.4,2,.6,1) infinite;
  animation-play-state: paused;
}
.glass-card {
  background: rgba(187, 50, 50, 0.35);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.18);
  transition: all 0.35s cubic-bezier(.4,2,.6,1);
}
.warning-popup, .safe-popup {
  position: fixed;
  bottom: 90px;
  right: 32px;
  min-width: 320px;
  max-width: 90vw;
  color: #292524;
  padding: 24px 30px 18px 30px;
  z-index: 10000;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  font-size: 1.1rem;
  animation: fadeInUp 0.7s cubic-bezier(.4,2,.6,1);
  opacity: 0.96;
  pointer-events: auto;
}
.warning-popup {
  background: linear-gradient(120deg, rgba(255, 183, 94, 0.85), rgba(255, 68, 68, 0.78));
  color: #410606;
  border: 2px solid #ff8c42;
  box-shadow: 0 8px 40px 0 rgba(255, 68, 68, 0.18);
}
.safe-popup {
  background: linear-gradient(120deg, rgba(185,255,204,0.85), rgba(97,222,164,0.78));
  color: #084c20;
  border: 2px solid #60e09a;
  box-shadow: 0 8px 40px 0 rgba(97,222,164,0.18);
}
.popup-btn {
  margin-top: 18px;
  margin-right: 10px;
  background: linear-gradient(90deg, #ff5959 60%, #ffd6a0 100%);
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255,68,68,0.12);
  transition: background 0.3s, transform 0.2s;
}
.popup-btn:last-child {
  background: linear-gradient(90deg, #60e09a 60%, #b9ffcc 100%);
  color: #11482b;
  margin-right: 0;
}
.popup-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-2px) scale(1.06);
}
.badge {
  position: fixed;
  bottom: 24px;
  right: 32px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  line-height: 1;
  z-index: 9999;
  box-shadow: 0 6px 28px rgba(0,0,0,.19);
  cursor: pointer;
  user-select: none;
  transition: background 0.3s, box-shadow 0.3s, transform 0.25s;
  animation: blurIn 0.6s cubic-bezier(.4,2,.6,1);
}
.badge-danger {
  background: radial-gradient(circle at 60% 30%, #ff5959 0%, #b71c1c 90%);
  color: #fff;
  border: 2.5px solid #fff3cd;
}
.badge-danger:hover {
  background: radial-gradient(circle at 60% 30%, #e70000 0%, #880a14 90%);
  box-shadow: 0 8px 32px #ff5959a8;
  transform: scale(1.13) rotate(-4deg);
}
.badge-safe {
  background: radial-gradient(circle at 60% 30%, #b9ffcc 0%, #60e09a 90%);
  color: #084c20;
  border: 2.5px solid #eafff4;
}
.badge-safe:hover {
  background: radial-gradient(circle at 60% 30%, #97eabb 0%, #26cb7b 90%);
  box-shadow: 0 8px 32px #97eabb80;
  transform: scale(1.13) rotate(4deg);
}
`;

document.head.appendChild(style);

// Style and class for badges
alertElm.className = "badge badge-danger pulsing";
safeElm.className = "badge badge-safe";

// ==== Badge Interactions ====
alertElm.addEventListener("mouseover", () => {
  alertElm.style.animationPlayState = "running";
});
alertElm.addEventListener("mouseout", () => {
  alertElm.style.animationPlayState = "paused";
});
setInterval(() => {
  alertElm.style.animationPlayState = "running";
  setTimeout(() => {
    alertElm.style.animationPlayState = "paused";
  }, 900);
}, 3000);

alertElm.addEventListener("click", () => {
  if (document.getElementById("warning-popup")) return;
  showWarningPopup();
});

safeElm.addEventListener("mouseenter", () => {
  if (document.getElementById("safe-popup")) return;
  showSafePopup();
});




chrome.storage.local.get(['userDefinedWhitelist', 'userDefinedBlacklist'], function(lists) {
  const whitelist = lists.userDefinedWhitelist || [];
  const blacklist = lists.userDefinedBlacklist || [];
  const domain = extractDomain(currentUrl);

  if (whitelist.includes(domain)) {
    document.body.appendChild(safeElm);
    showSafePopup();
  } else if (blacklist.includes(domain)) {
    document.body.appendChild(alertElm);
    showCustomAlert(
      "Would you like to continue?",
      () => {},
      () => { window.location.href = "https://www.google.com"; }
    );
    showWarningPopup();
  } else {
    chrome.runtime.sendMessage({ type: "isBlacklisted", text: domain }, function(blacklistResp) {
      if (blacklistResp?.flag) {
        document.body.appendChild(alertElm);
        showCustomAlert(
          "Would you like to continue?",
          () => {},
          () => { window.location.href = "https://www.google.com"; }
        );
        showWarningPopup();
      } else {
        document.body.appendChild(safeElm);
        showSafePopup();
      }
    });
  }
});


//extracting the domain from URL
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}

// unssafe popup
function showWarningPopup() {
  if (document.getElementById("warning-popup")) return;
  const popup = document.createElement("div");
  popup.className = "warning-popup glass-card";
  popup.id = "warning-popup";
  popup.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;">
      <span style="font-size:2.2rem;filter:drop-shadow(0 2px 8px #ff5959a6);">⚠️</span>
      <div>
        <div style="font-weight:700;font-size:1.22rem;">Dangerous or Malicious Site</div>
        <div style="margin-top:2px;">This site may attempt to trick you or steal your data. <br><b>Stay Safe!</b></div>
      </div>
    </div>
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <button class="popup-btn" id="leave-btn">Leave Site</button>
      <button class="popup-btn" id="ignore-btn">Ignore</button>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("leave-btn").onclick = () => {
    popup.style.opacity = 0;
    setTimeout(() => {
      popup.remove();
      window.location.href = "https://www.google.com";
    }, 350);
  };
  document.getElementById("ignore-btn").onclick = () => {
    popup.style.opacity = 0;
    setTimeout(() => popup.remove(), 350);
  };
}

//safe popup
function showSafePopup() {
  if (document.getElementById("safe-popup")) return;
  const popup = document.createElement("div");
  popup.className = "safe-popup glass-card";
  popup.id = "safe-popup";
  popup.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;">
      <span style="font-size:2.1rem;filter:drop-shadow(0 2px 8px #60e09a80);">\u2705</span>
      <div>
        <div style="font-weight:700;font-size:1.18rem;">Site Verified Safe</div>
        <div style="margin-top:2px;">Verified by <b>Meg Cyber Police</b>. <br>Continue using with confidence.</div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  popup.onmouseleave = () => {
    popup.style.opacity = 0;
    setTimeout(() => popup.remove(), 350);
  };
}

//  Custom Animated Modal for Blacklisted Site
function showCustomAlert(message, onConfirm, onExit) {
  if (document.getElementById("custom-modal-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "custom-modal-overlay";
  overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(30, 34, 40, 0.30);
      display: flex; align-items: center; justify-content: center;
      z-index: 10010; animation: fadeInUp 0.7s;
  `;
  const modal = document.createElement("div");
  modal.className = "glass-card";
  modal.style.cssText = `
    background: rgba(255,255,255,0.82);
    color: #212121;
    padding: 34px 44px 24px 44px;
    border-radius: 18px;
    box-shadow: 0 8px 40px 0 rgba(255, 68, 68, 0.22);
    text-align: center;
    max-width: 520px;
    width: 95vw;
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    font-size: 1.18rem;
    animation: fadeInUp 0.7s cubic-bezier(.4,2,.6,1);
    position: relative;
  `;
  modal.innerHTML = `
    <div style="font-size:2.6rem;margin-bottom:10px;filter:drop-shadow(0 2px 8px #ff5959a8);">⚠️</div>
    <div style="font-weight:700;font-size:1.32rem;margin-bottom:12px;">
      Warning: This site has been flagged as <span style="color:#e70000">malicious</span>.
    </div>
    <p style="margin: 8px 0 18px 0; font-size: 1.08rem; color: #3a2d2d;">
      It may contain harmful content.<br>Proceed with caution.
    </p>
    <p style="margin-bottom: 18px; font-size:1.02rem;">${message}</p>
    <div style="display:flex;gap:18px;justify-content:center;margin-top:16px;">
      <button class="popup-btn" id="modal-confirm">Continue Anyway</button>
      <button class="popup-btn" id="modal-exit">Exit</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById("modal-confirm").onclick = () => {
    onConfirm();
    overlay.style.opacity = 0;
    setTimeout(() => overlay.remove(), 350);
  };
  document.getElementById("modal-exit").onclick = () => {
    onExit();
    overlay.style.opacity = 0;
    setTimeout(() => overlay.remove(), 350);
  };
  overlay.onclick = (e) => {
    if(e.target === overlay) {
      overlay.style.opacity = 0;
      setTimeout(() => overlay.remove(), 350);
    }
  };
}