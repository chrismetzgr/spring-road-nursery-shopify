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
          prevArrow: this.querySelector('[data-thumbnail-prev]'),
          nextArrow: this.querySelector('[data-thumbnail-next]'),
        };

        this.currentMediaId = null;
        this.init();
      }

      init() {
        // Set up thumbnail click handlers
        if (this.elements.thumbnailList) {
          const thumbnails = this.elements.thumbnailList.querySelectorAll('[data-target]');
          thumbnails.forEach((thumbnail) => {
            const button = thumbnail.querySelector('.thumbnail-button');
            if (button) {
              button.addEventListener('click', () => {
                this.setActiveMedia(thumbnail.dataset.target);
              });
            }
          });

          // Set up thumbnail navigation arrows to change main image
          if (this.elements.prevArrow) {
            this.elements.prevArrow.addEventListener('click', () => this.navigateImage('prev'));
            this.elements.prevArrow.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateImage('prev');
              }
            });
          }
          if (this.elements.nextArrow) {
            this.elements.nextArrow.addEventListener('click', () => this.navigateImage('next'));
            this.elements.nextArrow.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateImage('next');
              }
            });
          }

          // Update arrow states
          this.updateNavigationArrows();
        }

        // Find and set initial active media
        const activeItem = this.elements.viewer.querySelector('.media-gallery__item.is-active');
        if (activeItem) {
          this.currentMediaId = activeItem.dataset.mediaId;
          // Set initial active thumbnail
          this.setActiveThumbnail(this.currentMediaId);
        }
      }

      navigateImage(direction) {
        if (!this.elements.thumbnailList) return;

        const thumbnails = Array.from(this.elements.thumbnailList.querySelectorAll('[data-target]'));
        const currentIndex = thumbnails.findIndex(thumb => thumb.dataset.target === this.currentMediaId);
        
        let newIndex;
        if (direction === 'prev') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        } else {
          newIndex = currentIndex < thumbnails.length - 1 ? currentIndex + 1 : currentIndex;
        }

        if (newIndex !== currentIndex) {
          const newThumbnail = thumbnails[newIndex];
          this.setActiveMedia(newThumbnail.dataset.target);
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

        // Update arrow states
        this.updateNavigationArrows();

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
          const button = thumbnail.querySelector('.thumbnail-button');
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

        const scrollAmount = 200;
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

      updateNavigationArrows() {
        if (!this.elements.thumbnailList || !this.elements.prevArrow || !this.elements.nextArrow) return;

        const thumbnails = Array.from(this.elements.thumbnailList.querySelectorAll('[data-target]'));
        const currentIndex = thumbnails.findIndex(thumb => thumb.dataset.target === this.currentMediaId);

        const isAtStart = currentIndex <= 0;
        const isAtEnd = currentIndex >= thumbnails.length - 1;

        if (isAtStart) {
          this.elements.prevArrow.classList.add('disabled');
          this.elements.prevArrow.setAttribute('aria-disabled', 'true');
        } else {
          this.elements.prevArrow.classList.remove('disabled');
          this.elements.prevArrow.removeAttribute('aria-disabled');
        }

        if (isAtEnd) {
          this.elements.nextArrow.classList.add('disabled');
          this.elements.nextArrow.setAttribute('aria-disabled', 'true');
        } else {
          this.elements.nextArrow.classList.remove('disabled');
          this.elements.nextArrow.removeAttribute('aria-disabled');
        }
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