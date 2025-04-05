// Add safe DOM element check utility
function getElementSafe(selector) {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.error("Element query failed:", error);
    return null;
  }
}

// Add message response validation
function validateResponse(response) {
  if (!response) {
    throw new Error("No response received");
  }
  if (response.error) {
    throw new Error(response.error);
  }
  return response;
}

// Modify message sending with error handling
async function sendMessageSafe(message) {
  try {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Message error:", chrome.runtime.lastError.message);
          resolve(null);
        } else {
          try {
            resolve(validateResponse(response));
          } catch (error) {
            console.warn("Response validation failed:", error.message);
            resolve(null);
          }
        }
      });
    });
  } catch (error) {
    console.error("Message sending failed:", error);
    return null;
  }
}

// Update replaceAds function with better error handling
async function replaceAds(theme) {
  if (!theme) {
    console.warn("No theme provided for ad replacement");
    return;
  }

  try {
    const response = await sendMessageSafe({ 
      action: "getAds", 
      theme: theme 
    });
    
    const ads = response?.ads || [];
    const selectors = getPlatformSelectors();
    
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(adElement => {
          try {
            // Skip if already processed or too small
            if (adElement.offsetWidth < 50 || adElement.offsetHeight < 50) return;
            if (adElement.getAttribute('data-themed-replaced')) return;
            
            // Process ad element
            if (isAdRelevant(adElement, theme)) {
              adElement.style.border = "2px solid #4CAF50";
              adElement.setAttribute('data-themed-allowed', 'true');
              return;
            }
            
            // Replacement logic
            const randomAd = ads.length > 0 ? ads[Math.floor(Math.random() * ads.length)] : null;
            adElement.innerHTML = generateAdHtml(theme, randomAd);
            adElement.setAttribute('data-themed-replaced', 'true');
          } catch (elementError) {
            console.error("Ad element processing failed:", elementError);
          }
        });
      } catch (selectorError) {
        console.error("Selector processing failed:", selectorError);
      }
    });
  } catch (error) {
    console.error("Ad replacement failed:", error);
  }
}

