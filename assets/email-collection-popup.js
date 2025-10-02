const popupKey = 'springRoadNurseryNewsLetterSignup';
const popup = document.getElementById('email-collection-popup');

// Check if the page was refreshed after successful form submission
const urlParams = new URLSearchParams(window.location.search);
const customerPosted = urlParams.get('customer_posted');

// If form was just submitted, temporarily clear the localStorage to show success message
if (customerPosted === 'true' && localStorage.getItem(popupKey)) {
  localStorage.removeItem(popupKey);
}

if (popup && !localStorage.getItem(popupKey)) {
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  if (customerPosted === 'true') {
    // Show immediately if form was just submitted
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
  } else {
    // Normal behavior: show after 5 second delay
    setTimeout(() => {
      popup.style.opacity = '1';
      popup.style['z-index'] = 2000;
    }, 5000);
  }
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