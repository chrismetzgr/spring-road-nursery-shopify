const popupKey = 'springRoadNurseryNewsLetterSignupUpdated';
const popup = document.getElementById('email-collection-popup');

// Check if the page was refreshed after successful form submission
const urlParams = new URLSearchParams(window.location.search);
const customerPosted = urlParams.get('customer_posted');

// If form was just submitted successfully, show the success message even if localStorage exists
if (popup && customerPosted === 'true') {
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  // Show immediately with success message
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
// } else if (popup && !localStorage.getItem(popupKey)) {
} else if (popup) {
  // Normal behavior: show after 5 second delay for first-time visitors
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  setTimeout(() => {
    popup.style.opacity = '1';
    popup.style['z-index'] = 2000;
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