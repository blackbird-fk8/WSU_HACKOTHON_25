const adBlockRules = [ // The Big Bouncer standing outside the CLub
  // ... (keep your existing block rules)
];

// Add error handling for message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // The cenrtal command center (think of like the death star)
  try {
    if (request.action === "setTheme") {// The memeory Keepr (Think like C-3PO) checks if the user inout a theme, and saves the theme to chromes storage)
      if (!request.theme) {
        throw new Error("Theme parameter missing");
      }
      chrome.storage.sync.set({ 
        adTheme: request.theme,
        lastUpdated: Date.now()
      }, () => {
        sendResponse({ status: "success", theme: request.theme });
      });
      return true; // This tells chrome to wait until the storage operation is succseful and finishes before responding
    }
    else if (request.action === "getTheme") { // Basically retives the saved theme from storage
      chrome.storage.sync.get(['adTheme'], (result) => {
        sendResponse({ 
          theme: result.adTheme || '',
          status: result.adTheme ? "success" : "no_theme_set"
        });
      });
      return true; // Required for response
    }
    else if (request.action === "getAds") { // Esentially the Ad-Fetcher checks if a theme was provided
      if (!request.theme) {
        sendResponse({ error: "Theme parameter missing" });
        return;
      }
      fetchThemedAds(request.theme).then(ads => {
        sendResponse({ ads: ads || [], status: "success" });
      }).catch(error => {
        sendResponse({ error: error.message, status: "error" });
      });
      return true; // Required for response
    }
  } catch (error) {// catches any unexpecteed crashes and prevents the whole extension from braking down
    sendResponse({ error: error.message, status: "error" });
  }
});


chrome.runtime.onInstalled.addListener(() => { // Runs when the extension is first installed our updated and essentialy applies the ad-blocking rules to chromes filtering system.
  try {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: adBlockRules.map(rule => rule.id),
      addRules: adBlockRules
    });
  } catch (error) { // Jut incase the rule updates fails and logs the error but does not crash.
    console.error("Rule update failed:", error);
  }
});

// ... (keep your existing fetchThemedAds function and other code)
