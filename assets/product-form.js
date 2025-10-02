// Radio button listener for variant selection
document.addEventListener('DOMContentLoaded', function() {
  const variantSelects = document.querySelector('variant-selects');
  if (!variantSelects) return;
  
  const radioButtons = variantSelects.querySelectorAll('input[type="radio"]');
  console.log('Radio button variant selector initialized. Found', radioButtons.length, 'radio buttons');
  
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function(e) {
      console.log('Radio changed to:', e.target.value);
      
      // Get all selected option values
      const selectedOptionValues = Array.from(
        variantSelects.querySelectorAll('input[type="radio"]:checked')
      ).map(input => input.value);
      
      console.log('Selected options:', selectedOptionValues);
      
      // Publish the event that product-info is listening for
      publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
        data: {
          event: e,
          target: variantSelects,
          selectedOptionValues: selectedOptionValues
        }
      });
    });
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