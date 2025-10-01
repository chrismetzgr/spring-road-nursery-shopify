if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
        this.currentMediaId = null;
        this.thumbnails = [];
      }

      connectedCallback() {
        // Cache all DOM elements once
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnailList: this.querySelector('.media-gallery-thumbnail-list'),
          prevArrow: this.querySelector('[data-thumbnail-prev]'),
          nextArrow: this.querySelector('[data-thumbnail-next]'),
        };

        // Cache thumbnail array once
        if (this.elements.thumbnailList) {
          this.thumbnails = Array.from(this.elements.thumbnailList.querySelectorAll('[data-target]'));
          this.init();
        }

        // Set initial active media
        const activeItem = this.elements.viewer?.querySelector('.media-gallery__item.is-active');
        if (activeItem) {
          this.currentMediaId = activeItem.dataset.mediaId;
          this.setActiveThumbnail(this.currentMediaId);
        }
      }

      init() {
        // Use event delegation for thumbnail clicks (more efficient)
        this.elements.thumbnailList.addEventListener('click', (e) => {
          const btn = e.target.closest('.media-gallery-thumbnail-btn');
          if (btn) {
            const item = btn.closest('[data-target]');
            if (item) this.setActiveMedia(item.dataset.target);
          }
        });

        // Arrow navigation
        if (this.elements.prevArrow) {
          this.elements.prevArrow.addEventListener('click', () => this.navigateImage(-1));
          this.elements.prevArrow.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.navigateImage(-1);
            }
          });
        }

        if (this.elements.nextArrow) {
          this.elements.nextArrow.addEventListener('click', () => this.navigateImage(1));
          this.elements.nextArrow.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.navigateImage(1);
            }
          });
        }

        this.updateNavigationArrows();
      }

      navigateImage(direction) {
        const currentIndex = this.thumbnails.findIndex(t => t.dataset.target === this.currentMediaId);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.thumbnails.length) {
          this.setActiveMedia(this.thumbnails[newIndex].dataset.target);
        }
      }

      setActiveMedia(mediaId) {
        if (mediaId === this.currentMediaId) return;

        const targetMedia = this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`);
        const currentMedia = this.elements.viewer.querySelector('.media-gallery__item.is-active');

        if (!targetMedia) return;

        // Simple class toggle for fade effect
        currentMedia?.classList.remove('is-active');
        targetMedia.classList.add('is-active');
        
        this.currentMediaId = mediaId;
        this.setActiveThumbnail(mediaId);
        this.updateNavigationArrows();

        // Play media if needed
        window.pauseAllMedia?.();
        const deferredMedia = targetMedia.querySelector('.deferred-media');
        deferredMedia?.loadContent?.(false);

        // Announce to screen readers
        const thumbnail = this.thumbnails.find(t => t.dataset.target === mediaId);
        if (thumbnail && this.elements.liveRegion) {
          const img = targetMedia.querySelector('img');
          if (img?.complete) {
            this.announce(thumbnail.dataset.mediaPosition);
          } else if (img) {
            img.onload = () => this.announce(thumbnail.dataset.mediaPosition);
          }
        }

        // Prevent sticky header
        document.querySelector('sticky-header')?.dispatchEvent(new Event('preventHeaderReveal'));
      }

      setActiveThumbnail(mediaId) {
        this.thumbnails.forEach((thumbnail) => {
          const btn = thumbnail.querySelector('.media-gallery-thumbnail-btn');
          const isActive = thumbnail.dataset.target === mediaId;
          
          btn?.setAttribute('aria-current', isActive ? 'true' : 'false');
          thumbnail.classList.toggle('active', isActive);
        });
      }

      updateNavigationArrows() {
        if (!this.elements.prevArrow || !this.elements.nextArrow) return;

        const currentIndex = this.thumbnails.findIndex(t => t.dataset.target === this.currentMediaId);
        const isFirst = currentIndex <= 0;
        const isLast = currentIndex >= this.thumbnails.length - 1;

        this.elements.prevArrow.classList.toggle('disabled', isFirst);
        this.elements.prevArrow.setAttribute('aria-disabled', isFirst);

        this.elements.nextArrow.classList.toggle('disabled', isLast);
        this.elements.nextArrow.setAttribute('aria-disabled', isLast);
      }

      announce(position) {
        if (!this.elements.liveRegion || !window.accessibilityStrings?.imageAvailable) return;
        
        this.elements.liveRegion.setAttribute('aria-hidden', 'false');
        this.elements.liveRegion.textContent = window.accessibilityStrings.imageAvailable.replace('[index]', position);
        
        setTimeout(() => {
          this.elements.liveRegion.setAttribute('aria-hidden', 'true');
        }, 2000);
      }
    }
  );
}