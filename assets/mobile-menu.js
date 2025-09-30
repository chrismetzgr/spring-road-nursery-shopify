const hamburgerMenuIcon = document.querySelector('#hamburger-icon');
const mobileNav = document.querySelector('#mobile-nav');
const wormFilterIcon = document.querySelector('#filter-icon');
const mobileFilter = document.querySelector('#mobile-filter')

function clickExitEventHandler(element) {
  element.classList.add('show');
  element.classList.remove('hide'); // Remove hide class if present
  
  const exitButton = element.querySelector('.exit-container')
  exitButton.addEventListener('click', () => {
    element.classList.remove('show');
    element.classList.add('hide');
    
    // Hide the element after animation completes
    setTimeout(() => {
      element.style.display = 'none';
    }, 500); // Match the animation duration (0.5s = 500ms)
  }, { once: true})
}

hamburgerMenuIcon.addEventListener('click', () => {
  mobileNav.style.display = 'block'; // Ensure it's visible before animating
  clickExitEventHandler(mobileNav);
});

wormFilterIcon.addEventListener('click', () => {
  mobileFilter.style.display = 'block'; // Ensure it's visible before animating
  clickExitEventHandler(mobileFilter);
});