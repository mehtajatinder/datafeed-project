import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';
import '../button/button.js';

class MdsAlert extends MDSWCBase {
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
            ariaLive: {
                type: String,
                values: ['assertive', 'polite'],
            },
            dismissible: {
                type: Boolean,
                default: true,
            },
            dismissIconAriaLabel: {
                type: String,
                default: 'Dismiss',
            },
            list: {
                type: Array,
                default: [],
                validator: items => items.every(item => typeof item === 'string'),
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
                default: 'informational',
                values: ['error', 'warning', 'success', 'informational'],
            },
            text: {
                type: String,
                required: true,
            },
            tinted: {
                type: Boolean,
                default: false,
            },
            title: {
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsAlert.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsAlert.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-alert` : `${this.mdsPrefix}-alert`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const dismissedClass = this.dismissed ? ` ${className}--is-dismissed` : '';
        const dismissibleClass = this.dismissible ? ` ${className}--dismissible` : '';
        const variationClass = ` ${className}--${this.variation}`;
        const tintedClass = this.tinted ? ` ${className}--tinted` : '';
        const computedClassName = `${className}${additionalClasses}${dismissedClass}${dismissibleClass}${sizeClass}${variationClass}${tintedClass}`;

        // Accessibility
        const ariaLive = this.ariaLive ? ` aria-live="${this.ariaLive}"` : '';
        const roleAttribute = this.role ? ` role="${this.role}"` : '';
        const dismissIconAriaLabel = `${this.dismissIconAriaLabel}`;

        const actionSlot = this.hasNamedSlotContent('mds-alert-custom-action') ? '<slot name="mds-alert-custom-action"></slot>' : '';

        return `
            <div class="${computedClassName}"${ariaLive}${roleAttribute}>
                <div class="${className}__cell-icon">
                <mds-icon
                    name="${MdsAlert.getVariationIcon(this.variation, this.size === 'small')}"
                    additional-class="${className}__icon"
                >
                </div>
                <div class="${className}__cell-body">
                    <aside class="${className}__content">
                        ${this.title ?
                            `
                                <strong class="${className}__title">${this.title}</strong>
                            ` : ''
                        }
                        <p class="${className}__message">
                            <slot>${this.text}</slot>
                        </p>
                        ${this.list && this.list.length ?
                            `
                                <ul class="${className}__list">
                                    ${this.list.map(item => `<li class="${className}__list-item">${item}</li>`).join('')}
                                </ul>
                            ` : ''
                        }
                        ${actionSlot}
                    </aside>
                </div>
                ${this.dismissible ?
                    `
                        <mds-button
                            additional-class="${className}__dismiss-button"
                            size="small"
                            icon="remove--s"
                            variation="icon-only"
                            text=${dismissIconAriaLabel}
                        >
                        </mds-button>
                    ` : ''
                }
            </div>
        `;
    }

    static getVariationIcon(variation, isSmall = false) {
        const icon = {
            error: 'alert',
            warning: 'alert',
            success: 'check',
            informational: 'info-circle',
        };

        return isSmall ? `${icon[variation]}--s` : icon[variation];
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
        const innerAlert = this.querySelector(`.${this.prefixedClassName}`);
        if (innerAlert) {
            innerAlert.classList.add(`${this.prefixedClassName}--is-dismissed`); // Manually add class since dismissed isn't a watched attribute but an internal prop
        }
        this.triggerEvent('mds-alert-dismissed');
    }

    bindDomRemovalAfterDismissal() {
        this.addEventListener('animationend', () => this.removeFromDom(), { once: true });
    }

    removeFromDom() {
        this.parentNode.removeChild(this);
        this.triggerEvent('mds-alert-removed');
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const className = this.prefixedClassName;
        if (this.dismissible) {
            const dismissButton = this.querySelector(`.${className} > mds-button`);
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

MDSWCBase.defineCustomElement('mds-alert', MdsAlert);

export default MdsAlert;
