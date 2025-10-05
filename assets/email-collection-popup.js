const popupKey = 'springRoadNurseryNewsLetterSignupUpdated';
const popup = document.getElementById('email-collection-popup');

function attemptShowPopup() {
  // Check if menu or sort is open
  if (window.isMenuOrSortOpen && window.isMenuOrSortOpen()) {
    // Wait 5 seconds and try again
    setTimeout(attemptShowPopup, 5000);
    return;
  }
  
  // Show the popup
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  setTimeout(() => {
    popup.style.opacity = '1';
    popup.style['z-index'] = 2000;
  }, 100);
}

// Check if the page was refreshed after successful form submission
const urlParams = new URLSearchParams(window.location.search);
const customerPosted = urlParams.get('customer_posted');

if (popup && customerPosted === 'true') {
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  popup.style.opacity = '1';
  popup.style['z-index'] = 2000;
  
  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 500);
    localStorage.setItem(popupKey, 'true');
    
    const url = new URL(window.location);
    url.searchParams.delete('customer_posted');
    window.history.replaceState({}, '', url);
  }, 5000);
} else if (popup) {
  // Wait 5 seconds then attempt to show
  setTimeout(attemptShowPopup, 5000);
}

// Exit button handler - scoped to popup only
popup?.querySelector('.exit-container img')?.addEventListener('click', () => {
  popup.style.opacity = '0';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 500);
  localStorage.setItem(popupKey, 'true');
});

// Form submission handler
const form = popup?.querySelector('form');
form?.addEventListener('submit', () => {
  localStorage.setItem(popupKey, 'true');
});