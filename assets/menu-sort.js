// ============================================
// UTILITY FUNCTIONS
// ============================================

let scrollPosition = 0;

/**
 * Lock body scroll and save position
 */
function lockBodyScroll() {
  // Save current scroll position
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Apply styles to prevent scrolling
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

/**
 * Unlock body scroll and restore position
 */
function unlockBodyScroll() {
  // Remove fixed positioning
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
}

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