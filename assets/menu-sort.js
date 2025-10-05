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

let clickCount = 0;

hamburgerMenuIcon.addEventListener('click', () => {
  clickCount++;
  console.log('=== HAMBURGER CLICK #' + clickCount + ' ===');
  console.log('Window inner height:', window.innerHeight);
  console.log('Document height:', document.documentElement.clientHeight);
  
  const background = document.querySelector('.mobile-nav-background');
  if (background) {
    const bgStyles = window.getComputedStyle(background);
    console.log('Background computed styles:');
    console.log('  height:', bgStyles.height);
    console.log('  top:', bgStyles.top);
    console.log('  position:', bgStyles.position);
    console.log('  display:', bgStyles.display);
  }
  
  const navStyles = window.getComputedStyle(mobileNav);
  console.log('Mobile nav computed styles:');
  console.log('  height:', navStyles.height);
  console.log('  top:', navStyles.top);
  console.log('  display:', navStyles.display);
  
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