if (!customElements.get('variant-selects')) {
  customElements.define('variant-selects', class VariantSelects extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('change', this.onVariantChange);
    }

    onVariantChange() {
      this.updateOptions();
      this.updateMasterId();
      this.toggleAddButton(true, '', false);
      this.updatePickupAvailability();
      this.removeErrorMessage();
      this.updateVariantStatuses();

      if (!this.currentVariant) {
        this.toggleAddButton(true, '', true);
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();
        this.updateShareUrl();
      }
    }

    updateOptions() {
      this.options = Array.from(this.querySelectorAll('input[type="radio"]:checked, select'), (input) => input.value);
    }

    updateMasterId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return this.options[index] === option;
        }).includes(false);
      });
    }

    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;

      const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-"]`);
      mediaGalleries.forEach((mediaGallery) =>
        mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true)
      );

      const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
      if (!modalContent) return;
      const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
      modalContent.prepend(newMediaModal);
    }

    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateShareUrl() {
      const shareButton = document.getElementById(`Share-${this.dataset.section}`);
      if (!shareButton || !shareButton.updateUrl) return;
      shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
      const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    updateVariantStatuses() {
      const inputWrappers = [...this.querySelectorAll('.variant-radio-option')];
      inputWrappers.forEach((option) => {
        if (option.querySelector('input[type="radio"]')) {
          this.updateRadioButtonStatus(option);
        }
      });
    }

    updateRadioButtonStatus(option) {
      const input = option.querySelector('input');
      const label = option.querySelector('label');
      const optionValue = input.value;
      
      // Find which option position this input represents
      const allRadioGroups = [...this.querySelectorAll('fieldset.variant-radio-group')];
      let optionPosition = -1;
      for (let i = 0; i < allRadioGroups.length; i++) {
        if (allRadioGroups[i].contains(input)) {
          optionPosition = i;
          break;
        }
      }

      const selectedOptions = Array.from(this.querySelectorAll('input[type="radio"]:checked')).map(el => el.value);
      
      // Check if this option is available with currently selected options
      const availableVariants = this.getVariantData().filter((variant) => {
        return selectedOptions.every((selected, index) => {
          if (index === optionPosition) return true; // Skip checking this option's position
          return variant.options[index] === selected;
        });
      });

      const isAvailable = availableVariants.some((variant) => {
        return variant.available && variant.options[optionPosition] === optionValue;
      });

      // Update disabled state and label text
      input.disabled = !isAvailable;
      label.classList.toggle('variant-radio-label--disabled', !isAvailable);
      
      // Update label text to add/remove "- Out of stock"
      const baseText = optionValue;
      if (!isAvailable && !label.textContent.includes('- Out of stock')) {
        label.textContent = `${baseText} - Out of stock`;
      } else if (isAvailable && label.textContent.includes('- Out of stock')) {
        label.textContent = baseText;
      }
    }

    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector('pickup-availability');
      if (!pickUpAvailability) return;

      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.fetchAvailability(this.currentVariant.id);
      } else {
        pickUpAvailability.removeAttribute('available');
        pickUpAvailability.innerHTML = '';
      }
    }

    removeErrorMessage() {
      const section = this.closest('section');
      if (!section) return;

      const productForm = section.querySelector('product-form');
      if (productForm) productForm.handleErrorMessage();
    }

    renderProductInfo() {
      const requestedVariantId = this.currentVariant.id;
      const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;

      fetch(
        `${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
      )
        .then((response) => response.text())
        .then((responseText) => {
          if (this.currentVariant.id !== requestedVariantId) return;

          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const destination = document.getElementById(`price-${this.dataset.section}`);
          const source = html.getElementById(
            `price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          );
          const skuSource = html.getElementById(
            `Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          );
          const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
          const inventorySource = html.getElementById(
            `Inventory-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          );
          const inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);

          if (source && destination) destination.innerHTML = source.innerHTML;
          if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;
          if (skuSource && skuDestination) {
            skuDestination.innerHTML = skuSource.innerHTML;
            skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
          }

          const price = document.getElementById(`price-${this.dataset.section}`);

          if (price) price.classList.remove('visibility-hidden');

          if (inventoryDestination)
            inventoryDestination.classList.toggle('visibility-hidden', inventorySource.innerText === '');

          const addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`);
          this.toggleAddButton(
            addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true,
            window.variantStrings.soldOut
          );

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId,
              html,
              variant: this.currentVariant,
            },
          });
        });
    }

    toggleAddButton(disable = true, text, modifyClass = true) {
      const productForm = document.getElementById(`product-form-${this.dataset.section}`);
      if (!productForm) return;
      const addButton = productForm.querySelector('[name="add"]');
      const addButtonText = productForm.querySelector('[name="add"] > span.add-to-cart-text');
      if (!addButton) return;

      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        // Only update text if explicitly provided and it's a sold out/unavailable message
        if (text && (text === window.variantStrings.soldOut || text === window.variantStrings.unavailable)) {
          if (addButtonText) addButtonText.textContent = text;
        }
      } else {
        addButton.removeAttribute('disabled');
        // Only reset to "Add to Cart" if we're not in the middle of showing "Added!"
        if (addButtonText && addButtonText.textContent !== 'Added!') {
          addButtonText.textContent = window.variantStrings.addToCart;
        }
      }
    }

    setUnavailable() {
      const button = document.getElementById(`product-form-${this.dataset.section}`);
      const addButton = button.querySelector('[name="add"]');
      const addButtonText = button.querySelector('[name="add"] > span.add-to-cart-text');
      const price = document.getElementById(`price-${this.dataset.section}`);
      if (!addButton) return;
      if (addButtonText) addButtonText.textContent = window.variantStrings.unavailable;
      if (price) price.classList.add('visibility-hidden');
    }

    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }
  });
}

if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span.add-to-cart-text');
        this.addedText = this.submitButton.querySelector('span.added-to-cart-text');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-hasp