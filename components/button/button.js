import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';

class MdsButton extends MDSWCBase {
    /*
    *************************
    PROPS
    *************************
    */
    static get defaultProps() {
        return {
            additionalClass: {
                type: String,
            },
            ariaDescribedby: {
                type: String,
            },
            checked: {
                type: Boolean,
                default: false,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            href: {
                type: String,
            },
            icon: {
                type: String,
            },
            iconRight: {
                type: String,
            },
            name: {
                type: String,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
            text: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                default: 'submit', // submit is default button behavior. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button
                values: ['button', 'reset', 'submit', 'checkbox', 'radio'],
            },
            value: {
                type: String,
            },
            variation: {
                type: String,
                default: 'secondary',
                values: ['primary', 'secondary', 'flat', 'icon-only'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsButton.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsButton.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-button` : `${this.mdsPrefix}-button`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const variationClass = ` ${className}--${this.variation}`;
        const computedClassName = `${className}${additionalClasses}${sizeClass}${variationClass}`;

        const hasIcon = this.icon !== undefined;
        const hasIconRight = this.iconRight !== undefined;
        const isIconOnly = this.variation === 'icon-only';
        const disabled = this.disabled ? ' disabled' : '';
        let defaultContent;

        // Accessibility
        if (isIconOnly && this.text.length < 1) {
            if (this.hasSlotContent.default) {
                defaultContent = this.defaultSlotContent.innerText;
            } else {
                this.logger.warn(`${this.tagName}: ${this.componentId}`, 'Prop validation failure: No text passed in icon-only. You must provide a value for "text" or within default slot.');
            }
        } else {
            defaultContent = this.text;
        }
        const ariaLabel = isIconOnly ? ` aria-label="${defaultContent}"` : '';
        const ariaDescribedby = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';

        let tagName = 'button';
        const type = this.href ? '' : ` type="${this.type}"`;
        let href = '';
        let iconLeft = '';
        let iconRight = '';
        let textSlot = isIconOnly ? '' : `<slot>${this.text}</slot>`;

        if (this.href) {
            tagName = 'a';
            href = ` href="${this.href}"`;
        }

        const leftIconClass = isIconOnly ? '' : ` ${className}__icon--left`;
        if (this.icon) {
            iconLeft = `<mds-icon name="${this.icon}" additional-class="${className}__icon${leftIconClass}"></mds-icon>`;
        }

        if (this.iconRight) {
            iconRight = `<mds-icon name="${this.iconRight}" additional-class="${className}__icon ${className}__icon--right"></mds-icon>`;
        }

        if ((hasIcon || hasIconRight) && !isIconOnly) {
            // Wrap text so vertical alignment between text and icons is correct
            textSlot = `<span class="${className}__text"><slot>${this.text}</slot></span>`;
        }

        let template = `
            <${tagName}${type}${href} class="${computedClassName}"${ariaLabel}${disabled}${ariaDescribedby}>
                ${iconLeft}
                ${textSlot}
                ${iconRight}
            </${tagName}>
        `;

        // Alternate template for checkbox and radio buttons, significantly different markup
        if (this.type === 'checkbox' || this.type === 'radio') {
            const value = this.value ? ` value="${this.value}"` : '';
            const name = this.name ? ` name="${this.name}"` : '';
            const checked = this.checked ? ' checked' : '';

            // Validate `name` and `value`
            if (!this.name) {
                this.logger.warn(`${this.tagName}: ${this.componentId}`, `Prop validation failure: No value passed for required prop in ${this.type}: 'name'. You must provide a value for 'name'`);
            }

            if (!this.value) {
                this.logger.warn(`${this.tagName}: ${this.componentId}`, `Prop validation failure: No value passed for required prop in ${this.type}: 'value'. You must provide a value for 'value'`);
            }

            template = `
                <label class="${className}__input-outer-wrapper">
                    <input class="${className}__input"${ariaLabel}${value} type="${this.type}"${disabled}${name}${checked}${ariaDescribedby} />
                    <span class="${computedClassName}">
                        ${iconLeft}
                        ${textSlot}
                        ${iconRight}
                    </span>
                </label>
            `;
        }

        return template;
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const className = this.prefixedClassName;
        const targetElementSelector = this.type === 'checkbox' || this.type === 'radio' ? `.${className}__input` : `.${className}`;
        const targetElement = this.querySelector(targetElementSelector);
        const input = this.querySelector(`.${className}__input`);

        targetElement.addEventListener('focus', () => {
            this.triggerEvent('focus'); // This will trigger the 'focus' event on the parent <mds-button> custom element in the DOM
        });

        targetElement.addEventListener('blur', () => {
            this.triggerEvent('blur'); // This will trigger the 'blur' event on the parent <mds-button> custom element in the DOM
        });

        if (input) {
            input.addEventListener('change', () => {
                this.setPropWithoutRendering('checked', input.checked);
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-button', MdsButton);

export default MdsButton;
