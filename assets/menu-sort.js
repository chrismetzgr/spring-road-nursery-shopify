const hamburgerMenuIcon = document.querySelector('#hamburger-icon');
const mobileNav = document.querySelector('#mobile-nav');
const wormSortIcon = document.querySelector('#sort-icon');
const mobileSort = document.querySelector('#mobile-sort');
const desktopSortDropdown = document.querySelector('.sort-dropdown');

// Track what's currently open
let menuOpen = false;
let sortOpen = false;

function clickExitEventHandler(element, onClose) {
  element.classList.add('show');
  element.classList.remove('hide');
  
  const exitButton = element.querySelector('.exit-container img');
  exitButton.addEventListener('click', () => {
    element.classList.remove('show');
    element.classList.add('hide');
    
    setTimeout(() => {
      element.style.display = 'none';
      document.body.style.overflow = '';
      if (onClose) onClose();
    }, 500); 
  }, { once: true})
}

hamburgerMenuIcon.addEventListener('click', () => {
  // Close sort if open
  if (sortOpen) {
    mobileSort.classList.remove('show');
    mobileSort.classList.add('hide');
    setTimeout(() => {
      mobileSort.style.display = 'none';
      sortOpen = false;
    }, 500);
  }
  
  mobileNav.style.display = 'block';
  document.body.style.overflow = 'hidden';
  menuOpen = true;
  
  clickExitEventHandler(mobileNav, () => {
    menuOpen = false;
  });
});

wormSortIcon.addEventListener('click', () => {
  if(window.innerWidth < 850){
    // Close menu if open
    if (menuOpen) {
      mobileNav.classList.remove('show');
      mobileNav.classList.add('hide');
      setTimeout(() => {
        mobileNav.style.display = 'none';
        menuOpen = false;
      }, 500);
    }
    
    mobileSort.style.display = 'block';
    sortOpen = true;
    
    clickExitEventHandler(mobileSort, () => {
      sortOpen = false;
    });
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

// Mobile sort
document.getElementById('mobile-sort-menu')?.addEventListener('click', (e) => {
  const sortValue = e.target.dataset.sort;
  if (sortValue) {
    handleSort(sortValue);
    mobileSort.classList.remove('show');
    mobileSort.classList.add('hide');
    setTimeout(() => {
      mobileSort.style.display = 'none';
      sortOpen = false;
    }, 500);
  }
});

// Export state checker for modal
window.isMenuOrSortOpen = function() {
  return menuOpen || sortOpen;
};