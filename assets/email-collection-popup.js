const popupKey = 'springRoadNurseryNewsLetterSignup';
const popup = document.getElementById('email-collection-popup');

if (popup && !localStorage.getItem(popupKey)) {
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  setTimeout(() => {
    popup.style.opacity = '1';
    localStorage.setItem(popupKey, 'true');
  }, 5000);

