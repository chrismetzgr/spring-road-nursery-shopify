const popupKey = 'springRoadNurseryNewsLetterSignupUpdated';
const popup = document.getElementById('email-collection-popup');

// Function to check if any drawer menus are open
function areDrawersOpen() {
  const mobileNav = document.querySelector('#mobile-nav');
  const mobileSort = document.querySelector('#mobile-sort');
  
  // Check if either drawer has the 'show' class or is displayed
  const navOpen = mobileNav && (mobileNav.classList.contains('show') || 
                  (mobileNav.style.display === 'block' && !mobileNav.classList.contains('hide')));
  const sortOpen = mobileSort && (mobileSort.classList.contains('show') || 
                   (mobileSort.style.display === 'block' && !mobileSort.classList.contains('hide')));
  
  return navOpen || sortOpen;
}

// Function to show the popup with drawer check
function showPopupWhenReady() {
  if (areDrawersOpen()) {
    // If drawers are open, wait 5 seconds and check again
    setTimeout(showPopupWhenReady, 5000);
  } else {
    // Drawers are closed, show the popup
    popup.style.opacity = '1';
    popup.style['z-index'] = 2000;
  }
}

// Check if the page was refreshed after successful form submission
const urlParams = new URLSearchParams(window.location.search);
const customerPosted = urlParams.get('customer_posted');

// If form was just submitted successfully, show the success message even if localStorage exists
if (popup && customerPosted === 'true') {
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  // Show immediately with success message (bypass drawer check for success messages)
  popup.style.opacity = '1';
  popup.style['z-index'] = 2000;
  
  // Close after 5 seconds
  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 500);
    localStorage.setItem(popupKey, 'true');
    
    // Clean up URL by removing query param
    const url = new URL(window.location);
    url.searchParams.delete('customer_posted');
    window.history.replaceState({}, '', url);
  }, 5000);
} else if (popup) {
  // Normal behavior: show after 5 second delay for first-time visitors
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  // Wait 5 seconds, then check if drawers are open before showing
  setTimeout(() => {
    showPopupWhenReady();
  }, 5000);
}

// Exit button handler
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