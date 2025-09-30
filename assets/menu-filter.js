const hamburgerMenuIcon = document.querySelector('#hamburger-icon');
const mobileNav = document.querySelector('#mobile-nav');
const wormFilterIcon = document.querySelector('#filter-icon.mobile');
const mobileFilter = document.querySelector('#mobile-filter')

function clickExitEventHandler(element) {
  element.classList.add('show');
  element.classList.remove('hide'); // Remove hide class if present
  
  const exitButton = element.querySelector('.exit-container')
  exitButton.addEventListener('click', () => {
    element.classList.remove('show');
    element.classList.add('hide');
    
    setTimeout(() => {
      element.style.display = 'none';
    }, 500); 
  }, { once: true})
}

hamburgerMenuIcon.addEventListener('click', () => {
  mobileNav.style.display = 'block'; 
  clickExitEventHandler(mobileNav);
});

wormFilterIcon.addEventListener('click', () => {
  if(window.innerWidth > 850){
    mobileFilter.style.display = 'block'; 
    clickExitEventHandler(mobileFilter);
  }
});