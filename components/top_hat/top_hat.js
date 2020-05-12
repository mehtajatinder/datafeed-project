import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';
import '../button/button.js';

class MdsTopHat extends MDSWCBase {
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
                default: true,
            },
            dismissIconAriaLabel: {
                type: String,
                default: 'Dismiss',
            },
            removable: {
                type: Boolean,
                default: true,
            },
            role: {
                type: String,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium'],
            },
            variation: {
                type: String,
                values: ['error', 'warning', 'informational'],
                default: 'informational',
            },
            text: {
                type: String,
                required: true,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsTopHat.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsTopHat.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        // Classes
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-top-hat` : `${this.mdsPrefix}-top-hat`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const dismissedClass = this.dismissed ? ` ${className}--is-dismissed` : '';
        const dismissibleClass = this.dismissible ? ` ${className}--dismissible` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const variationClass = ` ${className}--${this.variation}`;
        const computedClassName = `${className}${additionalClasses}${dismissedClass}${dismissibleClass}${sizeClass}${variationClass}`;

        // Attributes
        const dismissIconAriaLabel = `${this.dismissIconAriaLabel}`;


        // Accessibility
        const role = this.role ? `role="${this.role}"` : '';

        return `
            <div class="${computedClassName}" ${role}>
                <div class="${className}__body">
                    <mds-icon
                        slot="icon"
                        name="${MdsTopHat.getVariationIcon(this.variation, this.size === 'small')}"
                        additional-class="${className}__icon"
                    >
                    </mds-icon>
                    <span class="${className}__message">
                        <slot>${this.text}</slot>
                    </span>
                </div>
                ${this.dismissible ?
                    `
                    <mds-button
                        additional-class="${className}__dismiss-button"
                        size="small"
                        icon="remove--s"
                        variation="icon-only"
                        text="${dismissIconAriaLabel}"
                    >
                    </mds-button>
                    ` : ''
                }
            </div>
        `;
    }

    static getVariationIcon(status, isSmall = false) {
        const icon = {
            error: 'alert',
            warning: 'alert',
            informational: 'info-circle',
        };

        return isSmall ? `${icon[status]}--s` : icon[status];
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }

    /*
    *************************
    METHODS
    *************************
    */
    dismiss(removeAfterDismissal = this.removable) {
        if (removeAfterDismissal) {
            this.bindDomRemovalAfterDismissal();
        }

        this.dismissed = true;
        const innerDiv = this.querySelector(`.${this.prefixedClassName}`);
        if (innerDiv) {
            innerDiv.classList.add(`${this.prefixedClassName}--is-dismissed`); // Manually add class since dismissed isn't a watched attribute but an internal prop
        }
        this.triggerEvent('mds-top-hat-dismissed');
    }

    bindDomRemovalAfterDismissal() {
        this.addEventListener('animationend', () => this.removeFromDom(), { once: true });
    }

    removeFromDom() {
        this.parentNode.removeChild(this);
        this.triggerEvent('mds-top-hat-removed');
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

        const links = this.querySelectorAll('a');
        if (links.length) {
            this.bindLinks(links);
        }
    }

    bindLinks(links) {
        const linksArray = Array.from(links);

        linksArray.forEach((link) => {
            link.addEventListener('focus', (e) => { this.triggerEvent('focus', e); });
            link.addEventListener('blur', (e) => { this.triggerEvent('blur', e); });
        });
    }
}

MDSWCBase.defineCustomElement('mds-top-hat', MdsTopHat);

export default MdsTopHat;
