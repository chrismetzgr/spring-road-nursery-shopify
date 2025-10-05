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
    }, 500); 
  }, { once: true})
}

hamburgerMenuIcon.addEventListener('click', () => {
  // Get actual viewport height in pixels
  const vh = window.innerHeight;
  
  // Set the container height
  mobileNav.style.height = vh + 'px';
  
  // Set the background to extend beyond
  const background = mobileNav.querySelector('.mobile-nav-background');
  if (background) {
    background.style.height = (vh * 1.2) + 'px';
    background.style.top = (vh * -0.1) + 'px';
  }
  
  mobileNav.style.display = 'block'; 
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
  const sectionId = productGrid?.dataset.id;
  
  if (!sectionId) return;
  
  const fetchUrl = `${url.pathname}?section_id=${sectionId}&${url.searchParams.toString()}`;
  
  fetch(fetchUrl)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContainer = doc.getElementById('ProductGridContainer');
      
      if (newContainer) {
        document.getElementById('ProductGridContainer').innerHTML = newContainer.innerHTML;
      }
      
      history.pushState({}, '', url.toString());
    });
}

// Desktop sort
desktopSortDropdown?.addEventListener('click', (e) => {
  const sortValue = e.target.dataset.sort;
  if (sortValue) {
    handleSort(sortValue);
    desktopSortDropdown.classList.remove('active');
  }
});

// Mobile sort
document.getElementById('mobile-sort-menu')?.addEventListener('click', (e) => {
  const sortValue = e.target.dataset.sort;
  if (sortValue) {
    handleSort(sortValue);
    mobileSort.classList.remove('show');
    mobileSort.classList.add('hide');
    setTimeout(() => {
      mobileSort.style.display = 'none';
    }, 500);
  }
});