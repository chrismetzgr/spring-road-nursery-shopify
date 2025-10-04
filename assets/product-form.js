// Function to update variant option availability based on current selections
function updateVariantAvailability() {
  const variantSelects = document.querySelector('variant-selects');
  if (!variantSelects) return;

  const allVariantsScript = document.querySelector('script[data-product-variants]');
  if (!allVariantsScript) return;
  
  const allVariants = JSON.parse(allVariantsScript.textContent);
  const radioGroups = variantSelects.querySelectorAll('fieldset.product-form__input--pill');
  
  if (radioGroups.length === 0) return;

  // For the FIRST option group (e.g., Size/Type), check if ANY variant with that option is available
  const firstGroup = radioGroups[0];
  const firstGroupRadios = firstGroup.querySelectorAll('input[type="radio"]');
  
  firstGroupRadios.forEach(radio => {
    const optionValue = radio.value;
    
    // Check if ANY variant with this first option value is available
    const hasAnyAvailable = allVariants.some(variant => {
      return variant.available && variant.options[0] === optionValue;
    });

    const label = radio.nextElementSibling;
    if (label) {
      label.classList.toggle('variant-radio-label--disabled', !hasAnyAvailable);
      
      if (!hasAnyAvailable && !label.textContent.includes('- Out of stock')) {
        label.textContent = `${optionValue} - Out of stock`;
      } else if (hasAnyAvailable && label.textContent.includes('- Out of stock')) {
        label.textContent = optionValue;
      }
    }
    
    radio.disabled = !hasAnyAvailable;
    if (!hasAnyAvailable) {
      radio.classList.add('disabled');
    } else {
      radio.classList.remove('disabled');
    }
  });

  // For SUBSEQUENT option groups (e.g., Color), check availability based on selected first option
  const selectedFirstOption = firstGroup.querySelector('input[type="radio"]:checked')?.value;
  
  if (!selectedFirstOption) return;

  for (let groupIndex = 1; groupIndex < radioGroups.length; groupIndex++) {
    const group = radioGroups[groupIndex];
    const radios = group.querySelectorAll('input[type="radio"]');
    
    radios.forEach(radio => {
      const optionValue = radio.value;
      
      // Check if this option is available with the selected first option
      const isAvailable = allVariants.some(variant => {
        return variant.available && 
               variant.options[0] === selectedFirstOption && 
               variant.options[groupIndex] === optionValue;
      });

      const label = radio.nextElementSibling;
      if (label) {
        label.classList.toggle('variant-radio-label--disabled', !isAvailable);
        
        if (!isAvailable && !label.textContent.includes('- Out of stock')) {
          label.textContent = `${optionValue} - Out of stock`;
        } else if (isAvailable && label.textContent.includes('- Out of stock')) {
          label.textContent = optionValue;
        }
      }
      
      radio.disabled = !isAvailable;
      if (!isAvailable) {
        radio.classList.add('disabled');
      } else {
        radio.classList.remove('disabled');
      }
    });
    
    // Auto-select first available option if current selection is unavailable
    const checkedRadio = group.querySelector('input[type="radio"]:checked');
    if (checkedRadio && checkedRadio.disabled) {
      const firstAvailable = group.querySelector('input[type="radio"]:not(:disabled)');
      if (firstAvailable) {
        firstAvailable.checked = true;
        // Trigger change event to update the variant
        firstAvailable.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }
}

// Radio button variant selector
function initializeRadioButtons() {
  const variantSelects = document.querySelector('variant-selects');
  if (!variantSelects) return;
  
  const radioButtons = variantSelects.querySelectorAll('input[type="radio"]');
  
  radioButtons.forEach(radio => {
    radio.removeEventListener('change', handleRadioChange);
    radio.addEventListener('change', handleRadioChange);
  });
}

function handleRadioChange(e) {
  const variantSelects = document.querySelector('variant-selects');
  const selectedOptionValues = Array.from(
    variantSelects.querySelectorAll('input[type="radio"]:checked')
  ).map(input => input.value);
  
  publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
    data: {
      event: e,
      target: variantSelects,
      selectedOptionValues: selectedOptionValues
    }
  });
}

document.addEventListener('DOMContentLoaded', initializeRadioButtons);

// Listen for variant changes and update availability
subscribe(PUB_SUB_EVENTS.variantChange, () => {
  const attempts = [100, 300, 500, 800, 1200];
  
  attempts.forEach(delay => {
    setTimeout(() => {
      const radioGroups = document.querySelectorAll('fieldset.product-form__input--pill');
      console.log(`Attempt at ${delay}ms: Found ${radioGroups.length} radio groups`);
      
      if (radioGroups.length > 0) {
        updateVariantAvailability();
      }
    }, delay);
  });
});

// Product form with "Added!" functionality
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
        console.log({formData})

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
              // Update header cart count
              this.updateHeaderCart(response.item_count);
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

      updateHeaderCart(itemCount) {
        // Dispatch custom event with cart count
        const event = new CustomEvent('cart:updated', {
          detail: { itemCount: itemCount }
        });
        document.dispatchEvent(event);
      }

      getSectionInnerHTML(html, selector) {
        return new DOMParser()
          .parseFromString(html, 'text/html')
          .querySelector(selector).innerHTML;
      }

      showAddedMessage() {
        this.submitButton.classList.add('button--processing');
        
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
              this.submitButton.classList.remove('button--processing');
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