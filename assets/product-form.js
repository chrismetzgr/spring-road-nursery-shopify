if (!customElements.get('variant-selects')) {
  customElements.define('variant-selects', class VariantSelects extends HTMLElement {
constructor() {
  super();
  console.log('testing');
  
  // Listen for changes on radio buttons specifically
  this.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', this.onVariantChange.bind(this));
  });
  
  // Also listen for changes on select elements (in case there are any)
  this.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', this.onVariantChange.bind(this));
  });
}

onVariantChange(event) {
  console.log('=== VARIANT CHANGE START ===');
  console.log('Event target:', event.target);
  
  // Store the checked states before any processing
  const checkedBefore = Array.from(this.querySelectorAll('input[type="radio"]:checked')).map(el => ({
    name: el.name,
    value: el.value,
    checked: el.checked
  }));
  console.log('Checked before processing:', checkedBefore);
  
  this.updateOptions();
  this.updateMasterId();
  
  console.log('Selected options:', this.options);
  console.log('Current variant:', this.currentVariant);
  
  this.updateVariantInput();
  
  // Check what's selected after processing
  const checkedAfter = Array.from(this.querySelectorAll('input[type="radio"]:checked')).map(el => ({
    name: el.name,
    value: el.value,
    checked: el.checked
  }));
  console.log('Checked after processing:', checkedAfter);
  
  console.log('=== VARIANT CHANGE END ===');
  
  // Wait a moment and check again
  setTimeout(() => {
    const checkedDelayed = Array.from(this.querySelectorAll('input[type="radio"]:checked')).map(el => ({
      name: el.name,
      value: el.value
    }));
    console.log('Checked after 100ms delay:', checkedDelayed);
  }, 100);
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
      
      const allRadioGroups = [...this.querySelectorAll('fieldset.variant-radio-group')];
      let optionPosition = -1;
      for (let i = 0; i < allRadioGroups.length; i++) {
        if (allRadioGroups[i].contains(input)) {
          optionPosition = i;
          break;
        }
      }

      const selectedOptions = Array.from(this.querySelectorAll('input[type="radio"]:checked')).map(el => el.value);
      
      const availableVariants = this.getVariantData().filter((variant) => {
        return selectedOptions.every((selected, index) => {
          if (index === optionPosition) return true;
          return variant.options[index] === selected;
        });
      });

      const isAvailable = availableVariants.some((variant) => {
        return variant.available && variant.options[optionPosition] === optionValue;
      });

      input.disabled = !isAvailable;
      label.classList.toggle('variant-radio-label--disabled', !isAvailable);
      
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

// renderProductInfo() {
//   const requestedVariantId = this.currentVariant.id;
//   const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;

//   fetch(
//     `${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
//   )
//     .then((response) => response.text())
//     .then((responseText) => {
//       if (this.currentVariant.id !== requestedVariantId) return;

//       const html = new DOMParser().parseFromString(responseText, 'text/html');
      
//       // Only update price, SKU, and inventory - DO NOT update variant selectors
//       const destination = document.getElementById(`price-${this.dataset.section}`);
//       const source = html.getElementById(
//         `price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
//       );
//       if (source && destination) destination.innerHTML = source.innerHTML;
      
//       const skuSource = html.getElementById(
//         `Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
//       );
//       const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
//       if (skuSource && skuDestination) {
//         skuDestination.innerHTML = skuSource.innerHTML;
//         skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
//       }
      
//       const inventorySource = html.getElementById(
//         `Inventory-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
//       );
//       const inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);
//       if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;

//       const price = document.getElementById(`price-${this.dataset.section}`);
//       if (price) price.classList.remove('visibility-hidden');

//       if (inventoryDestination)
//         inventoryDestination.classList.toggle('visibility-hidden', inventorySource.innerText === '');

//       const addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`);
//       this.toggleAddButton(
//         addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true,
//         window.variantStrings.soldOut
//       );

//       publish(PUB_SUB_EVENTS.variantChange, {
//         data: {
//           sectionId,
//           html,
//           variant: this.currentVariant,
//         },
//       });
//     });
// }

    toggleAddButton(disable = true, text, modifyClass = true) {
      const productForm = document.getElementById(`product-form-${this.dataset.section}`);
      if (!productForm) return;
      const addButton = productForm.querySelector('[name="add"]');
      const addButtonText = productForm.querySelector('[name="add"] > span.add-to-cart-text');
      if (!addButton) return;

      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        if (text && (text === window.variantStrings.soldOut || text === window.variantStrings.unavailable)) {
          if (addButtonText) addButtonText.textContent = text;
        }
      } else {
        addButton.removeAttribute('disabled');
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

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
        
        if (this.submitButtonText) {
          this.submitButtonText.style.transition = 'opacity 0.3s ease';
        }
        if (this.addedText) {
          this.addedText.style.transition = 'opacity 0.3s ease';
          this.addedText.style.opacity = '0';
        }
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        
        if (this.submitButtonText) {
          this.submitButtonText.style.opacity = '0.5';
        }

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              this.showAddedMessage();
              return;
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            
            this.showAddedMessage();
            
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              quickAddModal.hide(true);
            }
            
            if (this.cart) {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.getSectionsToRender().forEach((section) => {
                  const sectionElement = document.getElementById(section.id);
                  if (sectionElement && response.sections && response.sections[section.id]) {
                    sectionElement.innerHTML = this.getSectionInnerHTML(
                      response.sections[section.id],
                      section.selector
                    );
                  }
                });
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      getSectionInnerHTML(html, selector) {
        return new DOMParser()
          .parseFromString(html, 'text/html')
          .querySelector(selector).innerHTML;
      }

      showAddedMessage() {
        if (this.submitButtonText) {
          this.submitButtonText.style.opacity = '0';
          
          setTimeout(() => {
            this.submitButtonText.style.display = 'none';
            if (this.addedText) {
              this.addedText.style.display = 'inline';
              this.addedText.offsetHeight;
              this.addedText.style.opacity = '1';
            }
          }, 300);
        }

        setTimeout(() => {
          if (this.addedText) {
            this.addedText.style.opacity = '0';
            
            setTimeout(() => {
              this.addedText.style.display = 'none';
              if (this.submitButtonText) {
                this.submitButtonText.style.display = 'inline';
                this.submitButtonText.offsetHeight;
                this.submitButtonText.style.opacity = '1';
              }
            }, 300);
          }
        }, 2000);
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}