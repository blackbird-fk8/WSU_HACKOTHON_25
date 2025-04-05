// Remove ad elements from the page
function removeAds() {
  // Common ad selectors for various websites
  const adSelectors = [
    // Facebook
    'div[data-pagelet^="FeedUnit_"]',
    'div[aria-label="Sponsored"]',
    'div[data-testid="story-subtitle"]:has(span:contains("Sponsored"))',
    
    // Amazon
    '.puis-sponsored-container',
    '.a-section.a-spacing-none.puis-sponsored-container',
    '[data-component-type="sp-sponsored-result"]',
    
    // eBay
    '.ad-item',
    '.s-item__sep--ad',
    '.s-item__ad-badge',
    
    // General
    '[id*="ad-"]',
    '[class*="ad-"]',
    '[class*="Ad-"]',
    '.advertisement',
    '.ad-banner',
    '.ad-wrapper',
    '.ad-container'
  ];

  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.remove();
    });
  });
}

// Run initially and then observe DOM changes
removeAds();

// Create a MutationObserver to watch for new ads
const observer = new MutationObserver(mutations => {
  removeAds();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
