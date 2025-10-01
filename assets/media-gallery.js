if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnailList: this.querySelector('.thumbnail-list'),
          prevButton: this.querySelector('[data-thumbnail-prev]'),
          nextButton: this.querySelector('[data-thumbnail-next]'),
        };

        this.currentMediaId = null;
        this.init();
      }

      init() {
        // Set up thumbnail click handlers
        if (this.elements.thumbnailList) {
          const thumbnails = this.elements.thumbnailList.querySelectorAll('[data-target]');
          thumbnails.forEach((thumbnail) => {
            const button = thumbnail.querySelector('button');
            if (button) {
              button.addEventListener('click', () => {
                this.setActiveMedia(thumbnail.dataset.target);
              });
            }
          });

          // Set up thumbnail navigation buttons
          if (this.elements.prevButton) {
            this.elements.prevButton.addEventListener('click', () => this.scrollThumbnails('prev'));
          }
          if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', () => this.scrollThumbnails('next'));
          }

          // Update button states on scroll
          if (this.elements.thumbnailList) {
            this.elements.thumbnailList.addEventListener('scroll', () => this.updateNavigationButtons());
            this.updateNavigationButtons();
          }
        }

        // Find and set initial active media
        const activeItem = this.elements.viewer.querySelector('.media-gallery__item.is-active');
        if (activeItem) {
          this.currentMediaId = activeItem.dataset.mediaId;
          // Set initial active thumbnail
          this.setActiveThumbnail(this.currentMediaId);
        }
      }

      setActiveMedia(mediaId) {
        const targetMedia = this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`);
        const currentMedia = this.elements.viewer.querySelector('.media-gallery__item.is-active');

        if (!targetMedia || targetMedia === currentMedia) {
          return;
        }

        // Fade out current media
        if (currentMedia) {
          currentMedia.classList.remove('is-active');
        }

        // Fade in new media
        targetMedia.classList.add('is-active');
        this.currentMediaId = mediaId;

        // Update thumbnail active state
        this.setActiveThumbnail(mediaId);

        // Play media if applicable
        this.playActiveMedia(targetMedia);

        // Announce to screen readers
        const thumbnail = this.elements.thumbnailList?.querySelector(`[data-target="${mediaId}"]`);
        if (thumbnail) {
          this.announceLiveRegion(targetMedia, thumbnail.dataset.mediaPosition);
        }

        // Prevent sticky header
        this.preventStickyHeader();
      }

      setActiveThumbnail(mediaId) {
        if (!this.elements.thumbnailList) return;

        const thumbnails = this.elements.thumbnailList.querySelectorAll('[data-target]');
        thumbnails.forEach((thumbnail) => {
          const button = thumbnail.querySelector('button');
          if (thumbnail.dataset.target === mediaId) {
            button.setAttribute('aria-current', 'true');
            thumbnail.classList.add('active');
          } else {
            button.removeAttribute('aria-current');
            thumbnail.classList.remove('active');
          }
        });
      }

      scrollThumbnails(direction) {
        if (!this.elements.thumbnailList) return;

        const scrollAmount = 200; // Adjust based on thumbnail size
        const currentScroll = this.elements.thumbnailList.scrollLeft;

        if (direction === 'prev') {
          this.elements.thumbnailList.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: 'smooth'
          });
        } else {
          this.elements.thumbnailList.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
          });
        }
      }

      updateNavigationButtons() {
        if (!this.elements.thumbnailList || !this.elements.prevButton || !this.elements.nextButton) return;

        const list = this.elements.thumbnailList;
        const isAtStart = list.scrollLeft <= 0;
        const isAtEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;

        this.elements.prevButton.disabled = isAtStart;
        this.elements.nextButton.disabled = isAtEnd;
      }

      announceLiveRegion(activeItem, position) {
        const image = activeItem.querySelector('img');
        if (!image || !this.elements.liveRegion) return;

        const announce = () => {
          this.elements.liveRegion.setAttribute('aria-hidden', false);
          this.elements.liveRegion.innerHTML = window.accessibilityStrings?.imageAvailable?.replace('[index]', position) || `Image ${position} loaded`;
          setTimeout(() => {
            this.elements.liveRegion.setAttribute('aria-hidden', true);
          }, 2000);
        };

        if (image.complete) {
          announce();
        } else {
          image.onload = announce;
        }
      }

      playActiveMedia(activeItem) {
        window.pauseAllMedia?.();
        const deferredMedia = activeItem.querySelector('.deferred-media');
        if (deferredMedia) {
          deferredMedia.loadContent?.(false);
        }
      }

      preventStickyHeader() {
        const stickyHeader = document.querySelector('sticky-header');
        if (stickyHeader) {
          stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
        }
      }
    }
  );
}