// A function that safely grabs elements from the website's
function getElementSafe(selector) {
  try {
    return document.querySelector(selector); // Grabs elements
  } catch (error) {
    console.error("Element query failed:", error); // Element may not exist
    return null;
  }
}

// Validates that the responses aren't garbage values
function validateResponse(response) {
  if (!response) {
    throw new Error("No response received"); // No data responses recieved or grabbed
  }
  if (response.error) {
    throw new Error(response.error);  // Response returned as an error
  }
  return response; // Response was not an error and was correct
}

// Sends message to the extension to background.js with error handling
async function sendMessageSafe(message) {
  try {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Message error:", chrome.runtime.lastError.message);  // Message script determined as error
          resolve(null);
        } else {
          try {
            resolve(validateResponse(response)); // Double check if response is an error
          } catch (error) {
            console.warn("Response validation failed:", error.message); // checks if response was an error
            resolve(null);
          }
        }
      });
    });
  } catch (error) {
    console.error("Message sending failed:", error);  // returns as an error 
    return null;
  }
}

// Updates the replaceAds function with better error handling
async function replaceAds(theme) {
  if (!theme) {
    console.warn("No theme provided for ad replacement");  // User did not pick a theme so return
    return;
  }

  try {
    const response = await sendMessageSafe({ // waits for ads matching the user selected theme
      action: "getAds", 
      theme: theme 
    });
    
    const ads = response?.ads || [];  // no ads, empty the list
    const selectors = getPlatformSelectors();  // Grabs CSS selectors for common matches
    
    selectors.forEach(selector => {  // gets every ad on the page
      try {
        document.querySelectorAll(selector).forEach(adElement => {  // Skip processed ads
          try {
            // Skip if already processed or too small
            if (adElement.offsetWidth < 50 || adElement.offsetHeight < 50) return;  // if ads to small ignore
            if (adElement.getAttribute('data-themed-replaced')) return;  // if ad was already processed ignore
            
            // Process ad element
            if (isAdRelevant(adElement, theme)) {  // If ad matches theme indicate and is selected
              adElement.style.border = "2px solid #4CAF50";  // indicate using green border
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

