/**
 * Email Collection Popup
 * Shows newsletter signup to first-time visitors with smart timing
 */

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'springRoadNurseryNewsLetterSignupUpdated';
const SUCCESS_SHOWN_KEY = 'springRoadNurserySuccessShown';
const INITIAL_DELAY = 5000; // 5 seconds
const SUCCESS_DISPLAY_TIME = 5000; // 5 seconds
const DRAWER_CHECK_INTERVAL = 5000; // 5 seconds
const FADE_DURATION = 500; // 0.5 seconds

// ============================================
// DOM ELEMENTS
// ============================================

const popup = document.getElementById('email-collection-popup');
const exitButton = popup?.querySelector('.srn-email-popup__exit');
const form = popup?.querySelector('form');

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if any mobile drawer menus are currently open
 */
function areDrawersOpen() {
  const mobileNav = document.querySelector('#mobile-nav');
  const mobileSort = document.querySelector('#mobile-sort');
  
  const isNavOpen = mobileNav?.classList.contains('show') || 
                    (mobileNav?.style.display === 'block' && !mobileNav?.classList.contains('hide'));
  
  const isSortOpen = mobileSort?.classList.contains('show') || 
                     (mobileSort?.style.display === 'block' && !mobileSort?.classList.contains('hide'));
  
  return isNavOpen || isSortOpen;
}

/**
 * Show the popup with fade-in animation
 */
function showPopup() {
  if (!popup) return;
  
  popup.style.opacity = '1';
  popup.style.zIndex = '2000';
}

/**
 * Hide the popup with fade-out animation
 */
function hidePopup() {
  if (!popup) return;
  
  popup.style.opacity = '0';
  
  setTimeout(() => {
    popup.style.display = 'none';
  }, FADE_DURATION);
}

/**
 * Mark popup as seen in localStorage
 */
function markPopupAsSeen() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

/**
 * Check if user has already seen the popup
 */
function hasSeenPopup() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Check if success message has already been shown
 */
function hasSeenSuccessMessage() {
  return localStorage.getItem(SUCCESS_SHOWN_KEY) === 'true';
}

/**
 * Mark success message as shown
 */
function markSuccessAsShown() {
  localStorage.setItem(SUCCESS_SHOWN_KEY, 'true');
}

/**
 * Recursively check if drawers are closed before showing popup
 */
function showPopupWhenReady() {
  if (areDrawersOpen()) {
    // If drawers are open, wait and check again
    setTimeout(showPopupWhenReady, DRAWER_CHECK_INTERVAL);
  } else {
    // Drawers are closed, safe to show popup
    showPopup();
  }
}

/**
 * Initialize popup with fade transition
 */
function initializePopup() {
  if (!popup) return;
  
  popup.style.opacity = '0';
  popup.style.transition = `opacity ${FADE_DURATION / 1000}s ease`;
  popup.style.display = 'block';
}

// ============================================
// POPUP DISPLAY LOGIC
// ============================================

/**
 * Handle successful form submission display
 */
function handleSuccessDisplay() {
  initializePopup();
  
  // Show immediately with success message (bypass drawer check)
  showPopup();
  
  // Auto-close after delay
  setTimeout(() => {
    hidePopup();
    markPopupAsSeen();
    markSuccessAsShown();
    
    // Clean up URL by removing query parameter
    const url = new URL(window.location);
    url.searchParams.delete('customer_posted');
    window.history.replaceState({}, '', url);
  }, SUCCESS_DISPLAY_TIME);
}

/**
 * Handle normal first-time visitor display
 */
function handleFirstTimeVisitor() {
  initializePopup();
  
  // Wait initial delay, then check if drawers are open before showing
  setTimeout(showPopupWhenReady, INITIAL_DELAY);
}

// ============================================
// MAIN EXECUTION
// ============================================

if (popup) {
  // Check if page was redirected after successful form submission
  const urlParams = new URLSearchParams(window.location.search);
  const customerPosted = urlParams.get('customer_posted');
  
  if (customerPosted === 'true' && !hasSeenSuccessMessage()) {
    // Only show success message if it hasn't been shown before
    handleSuccessDisplay();
  } else if (!hasSeenPopup()) {
    // Only show to first-time visitors for normal display
    handleFirstTimeVisitor();
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Handle exit button click
 */
if (exitButton) {
  exitButton.addEventListener('click', () => {
    hidePopup();
    markPopupAsSeen();
  });
}

/**
 * Handle form submission
 */
if (form) {
  form.addEventListener('submit', () => {
    markPopupAsSeen();
  });
}