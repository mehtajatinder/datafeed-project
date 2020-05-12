import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';
import '../button/button.js';

class MdsNotification extends MDSWCBase {
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
                values: ['polite', 'assertive'],
            },
            dismissible: {
                type: Boolean,
                default: true,
            },
            dismissIconAriaLabel: {
                type: String,
                default: 'Dismiss',
            },
            dismissDelay: {
                type: Number,
                default: 5000,
            },
            list: {
                type: Array,
            },
            removable: {
                type: Boolean,
                default: true,
            },
            role: {
                type: String,
                default: 'alert',
                values: ['alert', 'alertdialog'],
            },
            size: {
                type: String,
                default: 'medium',
                values: ['medium', 'small'],
            },
            status: {
                type: String,
                default: 'informational',
                values: ['error', 'informational', 'success', 'warning'],
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
            visible: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsNotification.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsNotification.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        // Classes
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-notification` : `${this.mdsPrefix}-notification`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClass = this.additionalClass ? ` ${this.additionalClass}` : '';
        const dismissibleClass = this.dismissible ? ` ${className}__item--dismissible` : '';
        const statusClass = ` ${className}__item--${this.status}`;
        const tintedClass = this.status !== 'informational' && this.tinted ? ` ${className}__item--tinted` : '';
        const visibleClass = this.visible ? ` ${className}__item--visible` : '';
        const computedClassName = `${className}__item${dismissibleClass}${sizeClass}${statusClass}${tintedClass}${visibleClass}${additionalClass}`;

        // Attributes
        const dismissIconAriaLabel = `${this.dismissIconAriaLabel}`;

        // Accessibility
        const ariaLiveAttribute = this.ariaLive ? ` aria-live="${this.ariaLive}"` : '';
        const role = ` role="${this.role}"`;

        const actionSlot = this.hasNamedSlotContent('mds-notification-custom-action') ? '<slot name="mds-notification-custom-action"></slot>' : '';

        return `
        <div${role}${ariaLiveAttribute} class="${computedClassName}">
            <div class="${className}__status">
                <mds-icon
                    name="${MdsNotification.getStatusIcon(this.status, this.size === 'small')}"
                    additional-class="${className}__icon"
                >
            </div>
            <div class="${className}__body">
                <div class="${className}__content">
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
                </div>
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
    </div>
        `;
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
    open() {
        const hasAction = this.hasNamedSlotContent('mds-notification-custom-action');
        this.visible = true;
        this.triggerEvent('mds-notification-opened');
        if (this.dismissible && !hasAction) {
            this.startDismissDelay();
        }
    }

    dismiss(removeAfterDismissal = this.removable) {
        this.stopDismissDelay();
        this.clearMouseEvents();
        this.bindAnimationEnd(removeAfterDismissal);
        this.triggerEvent('mds-notification-dismissed');
        this.querySelector(`.${this.prefixedClassName}__item`).classList.add(`${this.prefixedClassName}__item--is-dismissed`);
    }

    bindAnimationEnd(removeAfterDismissal) {
        this.addEventListener('animationend', () => {
            this.visible = false;
            if (removeAfterDismissal) {
                this.removeFromDom();
            }
        }, { once: true });
    }

    removeFromDom() {
        this.parentNode.removeChild(this);
        this.triggerEvent('mds-notification-removed');
    }

    stopDismissDelay() {
        clearTimeout(this.delay);
        this.delay = null;
    }

    clearMouseEvents() {
        this.removeEventListener('mouseenter', this.stopDismissDelay);
        this.removeEventListener('mouseleave', this.startDismissDelay);
    }

    startDismissDelay() {
        this.delay = setTimeout(() => {
            this.dismiss();
        }, this.dismissDelay);
    }

    static getStatusIcon(status, isSmall = false) {
        const icon = {
            error: 'alert',
            informational: 'info-circle',
            success: 'check',
            warning: 'alert',
        };

        return isSmall ? `${icon[status]}--s` : icon[status];
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const hasAction = this.hasNamedSlotContent('mds-notification-custom-action');

        if (this.dismissible) {
            const dismissButton = this.querySelector(`.${this.prefixedClassName}__item > mds-button`);
            dismissButton.addEventListener('click', () => { this.dismiss(); });
        }

        if (this.dismissible && hasAction) {
            this.addEventListener('mouseenter', this.stopDismissDelay);
            this.addEventListener('mouseleave', this.startDismissDelay);
        }
    }
}

MDSWCBase.defineCustomElement('mds-notification', MdsNotification);

export default MdsNotification;
