import MDSWCBase from '../mdswc_base/mdswc_base.js';
import MdsTrapFocus from '../../behaviors/trap_focus.js';
import MdsOverlay from '../overlay/overlay.js';
import '../header/header.js';

class MdsModal extends MdsTrapFocus(MDSWCBase) {
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
            ariaLabelledby: {
                type: String,
            },
            actionRequired: {
                type: Boolean,
                default: false,
            },
            title: {
                type: String,
                required: true,
            },
            titleHidden: {
                type: Boolean,
                default: false,
            },
            triggeredBy: {
                type: String,
                required: true,
            },
            visible: {
                type: Boolean,
                default: false,
            },
            width: {
                type: String,
                default: '900px',
                values: ['600px', '900px', '1200px'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsModal.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsModal.defaultProps);
        this.modalActive = false;
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-modal` : `${this.mdsPrefix}-modal`;
        const className = this.prefixedClassName;
        const visibleClass = this.visible ? ` ${className}--open` : '';
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const widthClass = ` ${className}--width-${this.width}`;
        const computedClassName = `${className}${visibleClass}${widthClass}${additionalClasses}`;
        const buttonClassName = this.namespaced ? `${this.namespacePrefix}-button` : `${this.mdsPrefix}-button`;

        const triggeredBy = this.triggeredBy ? ` triggered-by="${this.triggeredBy}"` : '';

        // Model's header
        const titleHidden = this.titleHidden ? ' title-hidden' : '';

        // Accessibility
        const ariaHidden = ` aria-hidden="${!this.visible}"`;
        const ariaLabelledby = this.ariaLabelledby ? ` aria-labelledby="${this.ariaLabelledby}"` : '';
        const ariaDescribedby = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';
        const titleId = this.ariaLabelledby ? ` id="${this.ariaLabelledby}"` : '';
        const descriptionId = this.ariaDescribedby ? ` id="${this.ariaDescribedby}"` : '';

        return `
            <div${triggeredBy} class="${computedClassName}">
                <div class="${className}__wrapper">
                    <section role="dialog"${ariaLabelledby}${ariaDescribedby}${ariaHidden} class="${className}__container">
                        <div class="${className}__inner">
                            <mds-header heading-level="1" border="primary" border-position="bottom"${titleId}${titleHidden}>
                                ${this.title}
                                <slot class="${buttonClassName}__container" name="mds-modal-actions" slot="mds-header-actions"></slot>
                            </mds-header>
                            <div class="${className}__content"${descriptionId}>
                                <slot></slot>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /*
    *************************
    METHODS
    *************************
    */
    render() {
        super.render();
        // Check if overlay is present
        const overlay = document.querySelector('mds-overlay');
        if (!overlay) {
            const newOverlay = new MdsOverlay();
            newOverlay.addOverlay();
        }
    }

    open() {
        this.modalActive = true;
        const modal = this.querySelector(`.${this.prefixedClassName}`);
        const overlay = document.querySelector('mds-overlay');
        overlay.dismissible = !this.actionRequired;

        modal.classList.add(`${this.prefixedClassName}--open`);
        modal.querySelector(`.${this.prefixedClassName}__container`).setAttribute('aria-hidden', 'false');

        // Animate
        setTimeout(() => {
            modal.classList.add(`${this.prefixedClassName}--active`);
            overlay.open();
            this.trapFocus();
            this.triggerEvent('mds-modal-activated');
        }, 200);

        // add listeners only if action-required is false
        if (!this.actionRequired) this.addModalEventListeners();

        this.triggerEvent('mds-modal-opened');
    }

    dismiss() {
        this.modalActive = false;
        const modal = this.querySelector(`.${this.prefixedClassName}`);
        const overlay = document.querySelector('mds-overlay');

        modal.querySelector(`.${this.prefixedClassName}__container`).removeAttribute('tabindex');
        modal.querySelector(`.${this.prefixedClassName}__container`).setAttribute('aria-hidden', 'true');
        modal.classList.remove(`${this.prefixedClassName}--active`);

        setTimeout(() => {
            modal.classList.remove(`${this.prefixedClassName}--open`);
        }, 500);

        this.removeModalEventListeners();
        this.triggerEvent('mds-modal-dismissed');

        overlay.dismiss();
    }

    /*
    *************************
    EVENTS
    *************************
    */
    addModalEventListeners() {
        const overlay = document.querySelector('mds-overlay');
        this.overlayClickEvents = this.overlayClickEvents.bind(this);
        this.modalKeyDownEvents = this.modalKeyDownEvents.bind(this);
        overlay.addEventListener('click', this.overlayClickEvents, true);
        document.addEventListener('keydown', this.modalKeyDownEvents, true);
        this.modalHeaderEventListeners();
    }

    removeModalEventListeners() {
        const overlay = document.querySelector('mds-overlay');
        overlay.removeEventListener('click', this.overlayClickEvents, true);
        document.removeEventListener('keydown', this.modalKeyDownEvents, true);
    }

    // Click event to overlay
    overlayClickEvents() {
        this.dismiss();
    }

    // Esc handler
    modalKeyDownEvents(event) {
        if (event.keyCode === 27) {
            this.dismiss();
        }
    }

    // Add event listeners to any icon-only buttons in modal's header
    // Modal is dismissed only if button's icon name is `remove`
    modalHeaderEventListeners() {
        const dismissButton = this.querySelector(`.${this.prefixedClassName}--open .mds-header__actions mds-button[variation="icon-only"][icon="remove"]`);

        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                this.dismiss();
            });
        }
    }

    bindEventHandlers() {
        // Bind trigger
        const triggerElement = document.getElementById(`${this.triggeredBy}`);

        if (triggerElement) {
            triggerElement.addEventListener('click', () => {
                this.open();
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-modal', MdsModal);

export default MdsModal;
