import MDSWCBase from '../mdswc_base/mdswc_base.js';
import MdsPositioning from '../../behaviors/positioning.js';
import '../header/header.js';

class MdsPopover extends MdsPositioning(MDSWCBase) {
    /*
    *************************
    PROPS
    *************************
    */
    static get defaultProps() {
        return {
            actionRequired: {
                type: Boolean,
                default: false,
            },
            additionalClass: {
                type: String,
            },
            headingLevel: { // Title heading level appropriate within product's information document hierarchy for accessibility.
                type: Number,
                default: 2,
                validator(value) {
                    return value >= 1 && value <= 6;
                },
            },
            menu: {
                type: Boolean,
                default: false,
            },
            position: {
                type: String,
                default: 'bottom-right',
                values: ['bottom-center', 'bottom-left', 'bottom-right', 'left-bottom', 'left-center', 'left-top', 'right-bottom', 'right-center', 'right-top', 'top-center', 'top-left', 'top-right'],
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
                default: '300px',
                values: ['200px', '300px', '500px'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsPopover.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsPopover.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-popover` : `${this.mdsPrefix}-popover`;
        const className = this.prefixedClassName;
        const visibleClass = this.visible ? ` ${className}--visible` : '';
        const widthClass = ` ${className}--width-${this.width}`;
        const positionClass = ` ${className}--${this.position}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const menuClass = this.menu ? ` ${className}--menu` : '';
        const computedClassName = `${className}${visibleClass}${widthClass}${menuClass}${positionClass}${additionalClasses}`;
        const buttonClassName = this.namespaced ? `${this.namespacePrefix}-button` : `${this.mdsPrefix}-button`;

        const triggeredBy = this.triggeredBy ? ` triggered-by="${this.triggeredBy}"` : '';

        // Popover's header
        const title = `${this.title}`;
        const titleHidden = this.titleHidden ? ' title-hidden' : '';
        const actionsTemplate = this.hasNamedSlotContent('mds-popover-actions') ? `<slot class="${buttonClassName}__container" name="mds-popover-actions" slot="mds-header-actions"></slot>` : '';

        // Accessibility
        const ariaHidden = !this.visible;

        return `
            <section${triggeredBy} class="${computedClassName}" role="tooltip" aria-hidden="${ariaHidden}">
                <mds-header border="primary" border-position="bottom" heading-level="${this.headingLevel}" size="level 8"${titleHidden}>
                    ${title}
                    ${actionsTemplate}
                </mds-header>
                <div class="${className}__content">
                    <slot></slot>
                </div>
            </section>
        `;
    }

    /*
    *************************
    METHODS
    *************************
    */
    render() {
        super.render();
        this.componentRendered().then(() => {
            const renderedPopover = this.querySelector(`.${this.prefixedClassName}`);
            if (this.visible) {
                this.setPosition(true);
                renderedPopover.classList.add(`${this.prefixedClassName}--visible`);
                renderedPopover.setAttribute('aria-hidden', 'false');
            }
        });
    }

    open() {
        if (this.parentNode !== document.body) {
            this.moveToBody();
        }
        this.setPosition(true);
        this.setPropWithoutRendering('visible', true);
        const renderedPopover = this.querySelector(`.${this.prefixedClassName}`);
        renderedPopover.classList.add(`${this.prefixedClassName}--visible`);
        renderedPopover.setAttribute('aria-hidden', 'false');

        // add listeners only if action-required is false
        if (!this.actionRequired) this.addPopoverEventListeners();

        this.triggerEvent('mds-popover-opened');
    }

    dismiss() {
        this.setPropWithoutRendering('visible', false);
        const renderedPopover = this.querySelector(`.${this.prefixedClassName}`);
        renderedPopover.classList.remove(`${this.prefixedClassName}--visible`);
        renderedPopover.setAttribute('aria-hidden', 'true');

        // remove listeners
        if (!this.actionRequired) this.removePopoverEventListeners();

        this.triggerEvent('mds-popover-dismissed');
    }

    /*
    *************************
    EVENTS
    *************************
    */
    addPopoverEventListeners() {
        this.bodyClickEvents = this.bodyClickEvents.bind(this);
        this.popoverKeyDownEvents = this.popoverKeyDownEvents.bind(this);
        document.body.addEventListener('click', this.bodyClickEvents, true);
        document.addEventListener('keydown', this.popoverKeyDownEvents, true);
        this.popoverHeaderEventListeners();
    }

    removePopoverEventListeners() {
        document.body.removeEventListener('click', this.bodyClickEvents, true);
        document.removeEventListener('keydown', this.popoverKeyDownEvents, true);
    }

    // Add click event listener to body and check target isn't popover itself
    bodyClickEvents(event) {
        const popover = this.querySelector(`.${this.prefixedClassName}--visible`);
        const triggerElement = document.getElementById(`${this.triggeredBy}`);
        let targetElement = event.target;

        // Suppress calling the dismiss method when the popover or its trigger is clicked to allow the listener on the trigger to handle this
        do {
            if (targetElement === popover || targetElement === triggerElement) {
                return;
            }
            targetElement = targetElement.parentNode;
        } while (targetElement);

        this.dismiss();
    }

    // Esc keydown handler
    popoverKeyDownEvents(event) {
        if (event.keyCode === 27) {
            this.dismiss();
        }
    }

    // Add event listeners to `remove--s` icon-only button in popover's header
    // Popover is dismissed only if button's icon name is `remove--s`
    popoverHeaderEventListeners() {
        const dismissButton = this.querySelector(`.${this.prefixedClassName}--visible .mds-header__actions mds-button[variation="icon-only"][icon="remove--s"]`);

        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                this.dismiss();
            });
        }
    }

    bindEventHandlers() {
        // Bind trigger
        const triggerElement = document.getElementById(`${this.triggeredBy}`);

        if (triggerElement && !triggerElement.disabled) {
            triggerElement.addEventListener('click', () => {
                if (this.visible && !this.actionRequired) {
                    this.dismiss();
                } else {
                    this.open();
                }
            });

            // Reposition if window is resized
            window.addEventListener('resize', () => {
                this.setPosition(true);
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-popover', MdsPopover);

export default MdsPopover;
