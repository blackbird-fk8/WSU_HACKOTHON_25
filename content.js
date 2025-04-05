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

