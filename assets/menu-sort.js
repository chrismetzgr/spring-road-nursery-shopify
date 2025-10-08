/**
 * Menu and Sort functionality for Spring Road Nursery
 * Handles mobile navigation, sort dropdown, and product filtering
 */

(function() {
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
   * Lock body scroll
   */
  function lockBodyScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Unlock body scroll
   */
  function unlockBodyScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  /**
   * Open a drawer with animation
   */
  function openDrawer(element) {
    if (!element) return;
    
    element.style.display = 'block';
    element.classList.add('show');
    element.classList.remove('hide');
    
    // Lock body scroll when mobile drawer opens
    if (isMobile()) {
      lockBodyScroll();
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
      
      // Unlock body scroll only if no mobile drawers are open
      if (isMobile() && !hasOpenDrawers()) {
        unlockBodyScroll();
      }
    }, DRAWER_ANIMATION_DELAY);
  }

  /**
   * Check if any mobile drawers are currently open
   */
  function hasOpenDrawers() {
    return (elements.mobileNav && elements.mobileNav.classList.contains('show')) ||
           (elements.mobileSort && elements.mobileSort.classList.contains('show'));
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

  // Set up exit button for mobile nav (once, at initialization)
  if (elements.mobileNav) {
    const navExitButton = elements.mobileNav.querySelector('.exit-container');
    if (navExitButton) {
      navExitButton.addEventListener('click', () => {
        closeDrawer(elements.mobileNav);
        elements.hamburgerIcon?.setAttribute('aria-expanded', 'false');
      });
    }
  }

  if (elements.hamburgerIcon && elements.mobileNav) {
    elements.hamburgerIcon.addEventListener('click', () => {
      openDrawer(elements.mobileNav);
      elements.hamburgerIcon.setAttribute('aria-expanded', 'true');
    });
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

  /**
   * Handle sort icon click - mobile opens drawer, desktop toggles dropdown
   */
  function handleSortIconClick(e) {
    if (isMobile()) {
      openDrawer(elements.mobileSort);
      elements.sortIcon.setAttribute('aria-expanded', 'true');
    } else {
      // Desktop: toggle the dropdown
      e.stopPropagation();
      const isActive = elements.desktopSortDropdown.classList.contains('active');
      if (isActive) {
        elements.desktopSortDropdown.classList.remove('active');
        elements.sortIcon.setAttribute('aria-expanded', 'false');
      } else {
        clearTimeout(sortTimeout);
        elements.desktopSortDropdown.classList.add('active');
        elements.sortIcon.setAttribute('aria-expanded', 'true');
      }
    }
  }

  // Set up exit button for mobile sort (once, at initialization)
  if (elements.mobileSort) {
    const sortExitButton = elements.mobileSort.querySelector('.exit-container');
    if (sortExitButton) {
      sortExitButton.addEventListener('click', () => {
        closeDrawer(elements.mobileSort);
        elements.sortIcon?.setAttribute('aria-expanded', 'false');
      });
    }
  }

  // Desktop sort dropdown hover behavior
  if (elements.sortIcon && elements.desktopSortDropdown) {
    // Sort icon click
    elements.sortIcon.addEventListener('click', handleSortIconClick);
    
    // Hover events for desktop (work alongside click)
    elements.sortIcon.addEventListener('mouseover', showSortDropdown);
    elements.sortIcon.addEventListener('mouseout', hideSortDropdown);
    
    // Dropdown hover
    elements.desktopSortDropdown.addEventListener('mouseover', showSortDropdown);
    elements.desktopSortDropdown.addEventListener('mouseout', hideSortDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!elements.sortIcon.contains(e.target) && 
          !elements.desktopSortDropdown.contains(e.target)) {
        elements.desktopSortDropdown.classList.remove('active');
        elements.sortIcon.setAttribute('aria-expanded', 'false');
      }
    });
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
        
        // Update the active sort option after URL changes
        updateActiveSortOption();
      })
      .catch(error => console.error('Error sorting products:', error));
  }

  /**
   * Handle desktop sort dropdown click
   */
  function handleDesktopSortClick(e) {
    const sortValue = e.target.dataset.sort;
    if (sortValue) {
      handleSort(sortValue);
      elements.desktopSortDropdown.classList.remove('active');
      elements.sortIcon?.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Handle desktop sort dropdown keyboard navigation
   */
  function handleDesktopSortKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const sortValue = e.target.dataset.sort;
      if (sortValue) {
        handleSort(sortValue);
        elements.desktopSortDropdown.classList.remove('active');
        elements.sortIcon?.setAttribute('aria-expanded', 'false');
      }
    }
  }

  /**
   * Handle mobile sort menu click
   */
  function handleMobileSortClick(e) {
    const sortValue = e.target.dataset.sort;
    if (sortValue) {
      handleSort(sortValue);
      closeDrawer(elements.mobileSort);
      elements.sortIcon?.setAttribute('aria-expanded', 'false');
    }
  }

  // Desktop sort dropdown click
  if (elements.desktopSortDropdown) {
    elements.desktopSortDropdown.addEventListener('click', handleDesktopSortClick);
    elements.desktopSortDropdown.addEventListener('keydown', handleDesktopSortKeydown);
  }

  // Mobile sort menu click
  if (elements.mobileSortMenu) {
    elements.mobileSortMenu.addEventListener('click', handleMobileSortClick);
  }

  // ============================================
  // RESPONSIVE BEHAVIOR
  // ============================================

  /**
   * Close mobile drawers when resizing to desktop
   */
  function handleResize() {
    if (!isMobile()) {
      closeAllDrawers();
      elements.hamburgerIcon?.setAttribute('aria-expanded', 'false');
      elements.sortIcon?.setAttribute('aria-expanded', 'false');
      
      // Clear any active dropdown state and timeouts
      clearTimeout(sortTimeout);
      if (elements.desktopSortDropdown) {
        elements.desktopSortDropdown.classList.remove('active');
      }
      
      // Unlock body scroll when switching to desktop
      unlockBodyScroll();
    }
  }

  // Debounced resize handler
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 150);
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
    
    // Remove active classes from all sort options
    document.querySelectorAll('[data-sort]').forEach(el => {
      el.classList.remove('wavy-underline', 'sort-active');
    });
    
    const activeSortValue = sortMap[currentSort] || 'featured';
    document.querySelectorAll(`[data-sort="${activeSortValue}"]`).forEach(el => {
      // Desktop dropdown gets sort-active, mobile gets wavy-underline
      if (el.closest('.srn-header__sort-dropdown')) {
        el.classList.add('sort-active');
      } else {
        el.classList.add('wavy-underline');
      }
    });
  }

  updateActiveSortOption();
})();