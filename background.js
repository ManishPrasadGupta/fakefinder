import { db } from './firebase-config.js'; 
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  increment,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';

let compiledPatterns = null;
let blacklistedPatterns = null;

// Load patterns from Firestore and cache in memory
async function loadPatterns() {
  if (!compiledPatterns) {
    // Load blacklisted patterns
    if (!blacklistedPatterns) {
      const snapshot = await getDocs(collection(db, "blacklistedUrls"));
      blacklistedPatterns = [];
      snapshot.forEach(doc => {
        const url = doc.data().url;
        if (url) {
          try {
            blacklistedPatterns.push(new RegExp(url));
          } catch (e) {
            blacklistedPatterns.push(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          }
        }
      });
    }
    compiledPatterns = { blacklistedPatterns };
  }
  return compiledPatterns;
}



//updating blacklistedUrls or siteVotes collection
async function processVote(domain, voteType) {


  const q = query(collection(db, "blacklistedUrls"), where("url", "==", domain));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // The URL is in blacklistedUrls → increment there
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, { [voteType]: increment(1) });
    return { success: true, location: "blacklistedUrls" };
  } else {
    // Not in blacklist → store/increment in siteVotes
    const siteVoteRef = doc(db, "siteVotes", domain);
    try {
      await updateDoc(siteVoteRef, { [voteType]: increment(1) });
    } catch (err) {
      // If it doesn't exist, create it
      const base = { safe: 0, unsafe: 0, url: domain };
      base[voteType] = 1;
      await setDoc(siteVoteRef, base);
    }
    return { success: true, location: "siteVotes" };
  }
}

// Preloading on startup
chrome.runtime.onInstalled.addListener(() => { loadPatterns(); });
chrome.runtime.onStartup.addListener(() => { loadPatterns(); });

// Unified listener for pattern check and refresh
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "refreshPatterns") {
    compiledPatterns = null;
    blacklistedPatterns = null;
    loadPatterns().then(() => sendResponse({ success: true }));
    return true;
  }

  if (msg.type === "voteOnSite") {
    const domain = msg.domain;
    const voteType = msg.voteType; // "safe" or "unsafe"
    if (!domain || !["safe", "unsafe"].includes(voteType)) {
      sendResponse({ success: false, error: "Invalid vote" });
      return true;
    }

    processVote(domain, voteType)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true; // for async sendResponse
  }

  if (msg.type === "isBlacklisted") {
    loadPatterns().then((patterns) => {
      const flag = patterns.blacklistedPatterns.some((regex) =>
        regex.test(msg.text)
      );
      sendResponse({ flag });
    });
    return true;
  }

  // Fallback
  sendResponse({ flag: false });
  return true;
});