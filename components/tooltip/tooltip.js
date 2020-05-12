import MDSWCBase from '../mdswc_base/mdswc_base.js';
import MdsPositioning from '../../behaviors/positioning.js';

class MdsTooltip extends MdsPositioning(MDSWCBase) {
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
            dismissIconAriaLabel: {
                type: String,
                default: 'Dismiss',
            },
            position: {
                type: String,
                values: ['bottom-center', 'bottom-left', 'bottom-right', 'left-bottom', 'left-center', 'left-top', 'right-bottom', 'right-center', 'right-top', 'top-center', 'top-left', 'top-right'],
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large'],
            },
            triggeredBy: {
                type: String,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            variation: {
                type: String,
                default: 'default',
                values: ['default', 'error', 'prompt'],
            },
            visible: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsTooltip.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsTooltip.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-tooltip` : `${this.mdsPrefix}-tooltip`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const variationClass = ` ${className}--${this.variation}`;
        const positionClass = this.position ? ` ${className}--${this.position}` : '';
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${variationClass}${sizeClass}${positionClass}${additionalClasses}`;
        const isPrompt = this.variation === 'prompt';
        const isError = this.variation === 'error';
        const buttonClassName = this.namespaced ? `${this.namespacePrefix}-button` : `${this.mdsPrefix}-button`;

        // Attributes
        const triggeredBy = this.triggeredBy ? ` triggered-by="${this.triggeredBy}"` : '';
        const dismissIconAriaLabel = `${this.dismissIconAriaLabel}`;

        if (isPrompt || isError) {
            this.setPropWithoutRendering('visible', true);
        }

        const promptClass = isPrompt ? ` ${className}--closable` : '';
        const closeButton = isPrompt ?
            `<div class="${className}__close-button">
                <mds-button
                additional-class="${buttonClassName}__icon"
                type="button"
                variation="icon-only"
                size="small"
                icon="remove--s"
                text="${dismissIconAriaLabel}"></mds-button>
            </div>` : '';

        const tooltipTextClass = this.size === 'large' ? ` ${className}__text--${this.size}` : '';

        return `
            <div${triggeredBy} class="${computedClassName}${promptClass}" role="tooltip" aria-hidden="true">
                <div class="${className}__text${tooltipTextClass}">
                    <slot>${this.text}</slot>
                </div>
                ${closeButton}
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
    render() {
        super.render(); // Calls the default base class render method
        this.componentRendered().then(() => {
            const renderedTooltip = this.querySelector(`.${this.prefixedClassName}`);
            if (this.visible) {
                this.setPosition();
                renderedTooltip.classList.add(`${this.prefixedClassName}--visible`);
                renderedTooltip.setAttribute('aria-hidden', 'false');
            }
        });
    }

    open() {
        if (this.parentNode !== document.body) {
            this.moveToBody();
        }
        this.setPosition();
        this.setPropWithoutRendering('visible', true);
        const renderedTooltip = this.querySelector(`.${this.prefixedClassName}`);
        renderedTooltip.classList.add(`${this.prefixedClassName}--visible`);
        renderedTooltip.setAttribute('aria-hidden', 'false');
    }

    dismiss() {
        this.setPropWithoutRendering('visible', false);
        const renderedTooltip = this.querySelector(`.${this.prefixedClassName}`);
        renderedTooltip.classList.remove(`${this.prefixedClassName}--visible`);
        renderedTooltip.setAttribute('aria-hidden', 'true');

        this.triggerEvent('mds-tooltip-dismissed');
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const removeButton = this.querySelector(`.${this.prefixedClassName}__close-button > mds-button`);
        const triggerElement = document.getElementById(`${this.triggeredBy}`);

        if (triggerElement) {
            triggerElement.addEventListener('mouseenter', () => {
                if (this.variation === 'default') {
                    this.open();
                }
            });

            triggerElement.addEventListener('focus', () => {
                if (this.variation === 'default') {
                    this.open();
                }
            });

            triggerElement.addEventListener('mouseleave', () => {
                if (this.variation === 'default') {
                    this.dismiss();
                }
            });

            triggerElement.addEventListener('blur', () => {
                if (this.variation === 'default') {
                    this.dismiss();
                }
            });

            window.addEventListener('resize', () => {
                this.setPosition();
            });

            window.addEventListener('scroll', () => {
                this.setPosition();
            });
        }

        if (removeButton) {
            removeButton.addEventListener('click', () => {
                this.dismiss();
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-tooltip', MdsTooltip);

export default MdsTooltip;
