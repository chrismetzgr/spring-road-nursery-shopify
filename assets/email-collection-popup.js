const popupKey = 'springRoadNurseryNewsLetterSignup';
const popup = document.getElementById('email-collection-popup');

if (popup && !localStorage.getItem(popupKey)) {
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.5s ease';
  popup.style.display = 'block';
  
  setTimeout(() => {
    popup.style.opacity = '1';
    popup.style['z-index'] = 2000;
  }, 5000);
}

popup?.querySelector('.exit-container img')?.addEventListener('click', () => {
  popup.style.opacity = '0';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 500);
  localStorage.setItem(popupKey, 'true');
});

const form = popup?.querySelector('form');
form?.addEventListener('submit', () => {
    localStorage.setItem(popupKey, 'true');
});