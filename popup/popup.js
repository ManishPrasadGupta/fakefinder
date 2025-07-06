


function getCurrentTabUrl(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    callback(tabs[0].url);
  });
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}

//function to tab reload
function reloadActiveTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]?.id) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
}

window.onload = function() {
  const safeCard = document.getElementById('safe-card');
  const unsafeCard = document.getElementById('unsafe-card');
  const markUnsafeBtn = document.getElementById('mark-unsafe-btn');
  const markSafeBtn = document.getElementById('mark-safe-btn');
  const blockBtn = document.getElementById('block-btn');
  const unBlockBtn = document.getElementById('unblock-btn');

  getCurrentTabUrl(function(url) {
    const domain = extractDomain(url);

    chrome.storage.local.get(['userDefinedWhitelist', 'userDefinedBlacklist'], function(userLists) {
      const userWhitelist = userLists.userDefinedWhitelist || [];
      const userBlacklist = userLists.userDefinedBlacklist || [];

      // requesting the background for Blacklist status for this domain
      chrome.runtime.sendMessage({type: "isBlacklisted", text: domain}, function(blacklistResp) {
        const inMainBlacklist = blacklistResp && blacklistResp.flag;

        let status = "safe";

        if (inMainBlacklist) {
          if (userWhitelist.includes(domain)) {
            status = "safe";
          } else if (userBlacklist.includes(domain)) {
            status = "unsafe";
          }
          else {
            status = "unsafe";
          }
        } else {
          if (userWhitelist.includes(domain)) {
            status = "safe";
          } else if (userBlacklist.includes(domain)) {
            status = "unsafe";
          }
          else {
             status = "safe";
           }
        }
        // card visibility logic
        if (status === "safe") {
          safeCard && safeCard.classList.remove('hidden');
          unsafeCard && unsafeCard.classList.add('hidden');
        } else {
          unsafeCard && unsafeCard.classList.remove('hidden');
          safeCard && safeCard.classList.add('hidden');
        }
      });
    });

  // unsafe button
  markUnsafeBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "voteOnSite", domain, voteType: "unsafe"}, (resp) => {
      alert('Marked as unsafe!');
      reloadActiveTab();
    });
  });

  // safe button
  markSafeBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: "voteOnSite", domain, voteType: "safe"}, (resp) => {
      alert('Marked as safe!');
      reloadActiveTab();
    });
  });

    // Block button
  blockBtn?.addEventListener('click', () => {
    chrome.storage.local.get(['userDefinedBlacklist', 'userDefinedWhitelist'], function(result) {
      let userBlacklist = result.userDefinedBlacklist || [];
      let userWhitelist = result.userDefinedWhitelist || [];
      // Remove from whitelist if present
      userWhitelist = userWhitelist.filter(item => item !== domain);
      // Add to blacklist if not already present
      if (!userBlacklist.includes(domain)) {
        userBlacklist.push(domain);
      }
      chrome.storage.local.set({
        userDefinedBlacklist: userBlacklist,
        userDefinedWhitelist: userWhitelist
      }, () => {
        alert('Site blocked for you.');
        reloadActiveTab();
      });
    });
  });

  // Unblock button
  unBlockBtn?.addEventListener('click', () => {
    chrome.storage.local.get(['userDefinedBlacklist', 'userDefinedWhitelist'], function(result) {
      let userBlacklist = result.userDefinedBlacklist || [];
      let userWhitelist = result.userDefinedWhitelist || [];
      // Remove from blacklist if present
      userBlacklist = userBlacklist.filter(item => item !== domain);
      // Add to whitelist if not already present
      if (!userWhitelist.includes(domain)) {
        userWhitelist.push(domain);
      }
      chrome.storage.local.set({
        userDefinedBlacklist: userBlacklist,
        userDefinedWhitelist: userWhitelist
      }, () => {
        alert('Site unblocked for you.');
        reloadActiveTab();
      });
    });
  });

});
};