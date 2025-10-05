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
cons