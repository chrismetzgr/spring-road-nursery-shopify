const hamburgerMenuIcon = document.querySelector('#hamburger-icon');
const mobileNav = document.querySelector('#mobile-nav');
const wormSortIcon = document.querySelector('#sort-icon');
const mobileSort = document.querySelector('#mobile-sort')
const desktopSortDropdown = document.querySelector('.sort-dropdown')

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
desktopSortDropdown?.querySelectorAll('span[data-sort]').forEach(span => {
  span.addEventListener('click', (e) => {
    handleSort(e.target.dataset.sort);
    desktopSortDropdown.classList.remove('active');
  });
});

// Mobile sort
document.querySelectorAll('#mobile-sort span[data-sort]').forEach(span => {
  span.addEventListener('click', (e) => {
    handleSort(e.target.dataset.sort);
  });
});