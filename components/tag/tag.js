import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';
import '../button/button.js';

class MdsTag extends MDSWCBase {
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
            dismissible: {
                type: Boolean,
                default: false,
            },
            dismissIconAriaLabel: {
                type: String,
                default: 'Dismiss',
            },
            href: {
                type: String,
            },
            removable: {
                type: Boolean,
                default: true,
            },
            size: {
                type: String,
                default: 'small',
                values: ['small', 'medium'],
            },
            text: {
                type: String,
                required: true,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsTag.defaultProps);
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsTag.defaultProps);
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        // Classes
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-tag` : `${this.mdsPrefix}-tag`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;
        const dismissedClass = this.dismissed ? ` ${className}--is-dismissed` : '';
        const linkClass = this.href ? ` ${className}--link` : '';

        const tagName = this.href === undefined ? 'div' : 'a';
        const href = this.href ? ` href=${this.href}` : '';

        // Accessibility
        const dismissIconAriaLabel = `${this.dismissIconAriaLabel}`;

        return `
            <${tagName} class="${computedClassName}${dismissedClass}${linkClass}"${href}>
            <slot>${this.text}</slot>
            ${this.dismissible ? `<mds-button type="button" additional-class="${className}--dismissible__button" icon="remove--s" text="${dismissIconAriaLabel}" variation="icon-only"></mds-button>` : ''}
            </${tagName}>`;
        }

    /*
    *************************
    METHODS
    *************************
    */
    dismiss(removeAfterDismissal = this.removable === false ? this.removable : true) {
        if (removeAfterDismissal) {
            this.bindDomRemovalAfterDismissal();
        }
        this.dismissed = true;
        const innerTag = this.querySelector(`.${this.prefixedClassName}`);
        if (innerTag) {
            innerTag.classList.add(`${this.prefixedClassName}--is-dismissed`); // Manually add class since dismissed isn't a watched attribute but an internal prop
        }
        this.triggerEvent('mds-tag-dismissed');
    }

    bindDomRemovalAfterDismissal() {
        this.addEventListener('animationend', () => this.removeFromDom(), { once: true });
    }

    removeFromDom() {
        // Used internally when dismissed
        this.triggerEvent('mds-tag-removed');
        this.parentNode.removeChild(this);
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        if (this.dismissible) {
            const dismissButton = this.querySelector('mds-button');
            dismissButton.addEventListener('click', () => { this.dismiss(); });
        }

        if (this.href) {
            const link = this.querySelector(`.${this.prefixedClassName}`);

            link.addEventListener('focus', () => {
                this.triggerEvent('focus'); // This will trigger the 'focus' event on the parent <mds-tag> custom element in the DOM
            });

            link.addEventListener('blur', () => {
                this.triggerEvent('blur'); // This will trigger the 'blur' event on the parent <mds-tag> custom element in the DOM
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-tag', MdsTag);

export default MdsTag;
