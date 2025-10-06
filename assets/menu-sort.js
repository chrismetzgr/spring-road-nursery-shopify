/**
 * Menu and Sort functionality for Spring Road Nursery
 * Handles mobile navigation, sort dropdown, and product filtering
 */

// ============================================
// CONSTANTS & DOM ELEMENTS
// ============================================

const BREAKPOINT_MOBILE = 850;
const DRAWER_ANIMATION_DELAY = 500;

const elements = {
  hamburgerIcon: document.querySelector('#hamburger-icon'),
  mobileNav: document.querySelector('#mobile-nav'),
  sortIcon: document.querySelector('#sort-icon'),
  mobileSort: document.querySelector('#mobile-sort'),
  desktopSortDropdown: document.querySelector('.srn-header__sort-dropdown'),
  mobileSortMenu: document.querySelector('#mobile-sort-menu'),
  productGrid: document.querySelector('#product-grid'),
  productGridContainer: document.querySelector('#ProductGridContainer')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if viewport is mobile size
 */
function isMobile() {
  return window.innerWidth <= BREAKPOINT_MOBILE;
}

/**
 * Open a drawer with animation
 */
function openDrawer(element) {
  if (!element) return;
  
  element.style.display = 'block';
  element.classList.add('show');
  element.classList.remove('hide');
  
  const exitButton = element.querySelector('.exit-container');
  if (exitButton) {
    exitButton.addEventListener('click', () => closeDrawer(element), { once: true });
  }
}

/**
 * Close a drawer with animation
 */
function closeDrawer(element) {
  if (!element || !element.classList.contains('show')) return;
  
  element.classList.remove('show');
  element.classList.add('hide');
  
  setTimeout(() => {
    element.style.display = 'none';
  }, DRAWER_ANIMATION_DELAY);
}

/**
 * Close all mobile drawers
 */
function closeAllDrawers() {
  closeDrawer(elements.mobileNav);
  closeDrawer(elements.mobileSort);
}

// ============================================
// MOBILE NAVIGATION
// ============================================

if (elements.hamburgerIcon && elements.mobileNav) {
  elements.hamburgerIcon.addEventListener('click', () => {
    openDrawer(elements.mobileNav);
    elements.hamburgerIcon.setAttribute('aria-expanded', 'true');
  });
  
  // Update aria-expanded when drawer closes
  const navExitButton = elements.mobileNav.querySelector('.exit-container');
  if (navExitButton) {
    navExitButton.addEventListener('click', () => {
      elements.hamburgerIcon.setAttribute('aria-expanded', 'false');
    });
  }
}

// ============================================
// SORT FUNCTIONALITY
// ============================================

let sortTimeout;

/**
 * Show desktop sort dropdown
 */
function showSortDropdown() {
  if (!isMobile() && elements.desktopSortDropdown) {
    clearTimeout(sortTimeout);
    elements.desktopSortDropdown.classList.add('active');
    elements.sortIcon?.setAttribute('aria-expanded', 'true');
  }
}

/**
 * Hide desktop sort dropdown with delay
 */
function hideSortDropdown() {
  if (!isMobile() && elements.desktopSortDropdown) {
    sortTimeout = setTimeout(() => {
      elements.desktopSortDropdown.classList.remove('active');
      elements.sortIcon?.setAttribute('aria-expanded', 'false');
    }, 100);
  }
}

// Desktop sort dropdown hover behavior
if (elements.sortIcon && elements.desktopSortDropdown) {
  // Sort icon hover
  elements.sortIcon.addEventListener('click', () => {
    if (isMobile()) {
      openDrawer(elements.mobileSort);
      elements.sortIcon.setAttribute('aria-expanded', 'true');
    }
  });
  
  elements.sortIcon.addEventListener('mouseover', showSortDropdown);
  elements.sortIcon.addEventListener('mouseout', hideSortDropdown);
  
  // Dropdown hover
  elements.desktopSortDropdown.addEventListener('mouseover', showSortDropdown);
  elements.desktopSortDropdown.addEventListener('mouseout', hideSortDropdown);
}

// ============================================
// PRODUCT SORTING
// ============================================

const SORT_MAPPING = {
  'featured': 'manual',
  'best-selling': 'best-selling',
  'price-low': 'price-ascending',
  'price-high': 'price-descending',
  'newest': 'created-descending'
};

/**
 * Handle product sorting
 */
function handleSort(sortValue) {
  const sortBy = SORT_MAPPING[sortValue];
  if (!sortBy || !elements.productGrid) return;
  
  const url = new URL(window.location.href);
  url.searchParams.set('sort_by', sortBy);
  
  const sectionId = elements.productGrid.dataset.id;
  if (!sectionId) return;
  
  const fetchUrl = `${url.pathname}?section_id=${sectionId}&${url.searchParams.toString()}`;
  
  fetch(fetchUrl)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContainer = doc.querySelector('#ProductGridContainer');
      
      if (newContainer && elements.productGridContainer) {
        elements.productGridContainer.innerHTML = newContainer.innerHTML;
      }
      
      history.pushState({}, '', url.toString());
    })
    .catch(error => console.error('Error sorting products:', error));
}

// Desktop sort dropdown click
if (elements.desktopSortDropdown) {
  elements.desktopSortDropdown.addEventListener('click', (e) => {
    const sortValue = e.target.dataset.sort;
    if (sortValue) {
      handleSort(sortValue);
      elements.desktopSortDropdown.classList.remove('active');
      elements.sortIcon?.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Keyboard navigation for sort options
  elements.desktopSortDropdown.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const sortValue = e.target.dataset.sort;
      if (sortValue) {
        handleSort(sortValue);
        elements.desktopSortDropdown.classList.remove('active');
        elements.sortIcon?.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

// Mobile sort menu click
if (elements.mobileSortMenu) {
  elements.mobileSortMenu.addEventListener('click', (e) => {
    const sortValue = e.target.dataset.sort;
    if (sortValue) {
      handleSort(sortValue);
      closeDrawer(elements.mobileSort);
      elements.sortIcon?.setAttribute('aria-expanded', 'false');
    }
  });
}

// ============================================
// RESPONSIVE BEHAVIOR
// ============================================

/**
 * Close mobile drawers when resizing to desktop
 */
window.addEventListener('resize', () => {
  if (!isMobile()) {
    closeAllDrawers();
    elements.hamburgerIcon?.setAttribute('aria-expanded', 'false');
    elements.sortIcon?.setAttribute('aria-expanded', 'false');
  }
});

// ============================================
// UPDATE ACTIVE SORT OPTION
// ============================================

/**
 * Makes sure active sort on mobile is selected
 */

function updateActiveSortOption() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentSort = urlParams.get('sort_by');
  
  const sortMap = {
    'manual': 'featured',
    'best-selling': 'best-selling',
    'price-ascending': 'price-low',
    'price-descending': 'price-high',
    'created-descending': 'newest'
  };
  
  // Remove wavy-underline from all sort options
  document.querySelectorAll('[data-sort]').forEach(el => {
    el.classList.remove('wavy-underline');
  });
  
  const activeSortValue = sortMap[currentSort] || 'featured';
  document.querySelectorAll(`[data-sort="${activeSortValue}"]`).forEach(el => {
    el.classList.add('wavy-underline');
  });
}