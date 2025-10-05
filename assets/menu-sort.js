const hamburgerMenuIcon = document.querySelector('#hamburger-icon');
const mobileNav = document.querySelector('#mobile-nav');
const wormSortIcon = document.querySelector('#sort-icon');
const mobileSort = document.querySelector('#mobile-sort')
const desktopSortDropdown = document.querySelector('.sort-dropdown')

function clickExitEventHandler(element) {
  element.classList.add('show');
  element.classList.remove('hide');
  
  const exitButton = element.querySelector('.exit-container')
  exitButton.addEventListener('click', () => {
    element.classList.remove('show');
    element.classList.add('hide');
    
    setTimeout(() => {
      element.style.display = 'none';
      // Unlock body scroll when menu closes
      document.body.style.overflow = '';
      document.body.style.position = '';
    }, 500); 
  }, { once: true})
}

hamburgerMenuIcon.addEventListener('click', () => {
  mobileNav.style.display = 'block';
  // Lock body scroll when menu opens
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  clickExitEventHandler(mobileNav);
});

wormSortIcon.addEventListener('click', () => {
  if(window.innerWidth < 850){
    mobileSort.style.display = 'block'; 
    clickExitEventHandler(mobileSort);
  }
});

let sortTimeout;

wormSortIcon.addEventListener('mouseover', () => {
  if(window.innerWidth > 850){
    clearTimeout(sortTimeout);
    desktopSortDropdown.classList.add('active');
  }
});

wormSortIcon.addEventListener('mouseout', () => {
  if(window.innerWidth > 850){
    sortTimeout = setTimeout(() => {
      desktopSortDropdown.classList.remove('active');
    }, 100);
  }
});

desktopSortDropdown.addEventListener('mouseover', () => {
  if(window.innerWidth > 850){
    clearTimeout(sortTimeout);
    desktopSortDropdown.classList.add('active');
  }
});

desktopSortDropdown.addEventListener('mouseout', () => {
  if(window.innerWidth > 850){
    sortTimeout = setTimeout(() => {
      desktopSortDropdown.classList.remove('active');
    }, 100);
  }
});

function handleSort(sortValue) {
  const sortMapping = {
    'featured': 'manual',
    'best-selling': 'best-selling',
    'price': 'price-ascending',
    'newest': 'created-descending'
  };
  
  const url = new URL(window.location.href);
  url.searchParams.set('sort_by', sortMapping[sortValue]);
  
  const productGrid = document.getElementById('product-grid');
  const sectionId = p