import MDSWCBase from '../mdswc_base/mdswc_base.js';
import MdsTrapFocus from '../../behaviors/trap_focus.js';
import MdsOverlay from '../overlay/overlay.js';
import '../icon/icon.js';
import '../button/button.js';

class MdsDialog extends MdsTrapFocus(MDSWCBase) {
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
            text: {
                type: String,
                required: true,
            },
            width: {
                type: String,
                default: '350px',
                values: ['350px', '500px'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsDialog.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsDialog.defaultProps);
        this.WRAP_STYLE = `
            bottom: 0;
            left: 0;
            position: fixed;
            right: 0;
            top: 0;
        `;
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-dialog` : `${this.mdsPrefix}-dialog`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const widthClass = ` ${className}--width-${this.width}`;
        const hiddenClass = ` ${className}--hidden`;
        const computedClassName = `${className}${hiddenClass}${widthClass}${additionalClasses}`;
        const buttonClassName = this.namespaced ? `${this.namespacePrefix}-button` : `${this.mdsPrefix}-button`;

        const supplementalContent = this.hasNamedSlotContent('mds-dialog-supplemental-content') ?
            `<slot name="mds-dialog-supplemental-content">
            </slot>` : '';

        const leftActionsContent = this.hasNamedSlotContent('mds-dialog-left-actions') ?
            `<slot class="${buttonClassName}__container" name="mds-dialog-left-actions">
                ${this.leftActions}
            </slot>` : '';

        return `
            <div role="dialog" class="${computedClassName}">
                <div class="${className}__message">
                    <slot>${this.text}</slot>
                </div>
                ${supplementalContent}
                <div class="${className}__action-buttons">
                    ${leftActionsContent}
                    <div class="${className}__cancel-resolve-buttons-holder">
                        <slot class="${buttonClassName}__container" name="mds-dialog-right-actions">
                            <mds-button type="button" variation="secondary">Cancel</mds-button>
                        </slot>
                    </div>
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
        const ACTIVE_CLASSLIST = [`${this.prefixedClassName}--active`, `${this.prefixedClassName}--fadeout`];
        const FADE_DURATION = 20;
        const overlay = document.querySelector('mds-overlay');
        const dialog = this.querySelector('[role=dialog]');
        this.setAttribute('style', this.WRAP_STYLE);

        overlay.dismissible = !this.actionRequired;
        dialog.classList.remove(`${this.prefixedClassName}--hidden`);
        dialog.classList.add(...ACTIVE_CLASSLIST);
        setTimeout(() => {
            overlay.open();
            dialog.classList.remove(`${this.prefixedClassName}--fadeout`);
            this.trapFocus();
            this.triggerEvent('mds-dialog-opened');
        }, FADE_DURATION);

        if (!this.actionRequired) this.addDialogEventListeners();
    }

    dismiss() {
        const ACTIVE_CLASSLIST = [`${this.prefixedClassName}--active`, `${this.prefixedClassName}--fadeout`];
        const FADE_DURATION = 500;
        const dialog = this.querySelector('[role=dialog]');
        dialog.classList.add(`${this.prefixedClassName}--fadeout`);
        setTimeout(() => {
            dialog.classList.add(`${this.prefixedClassName}--hidden`);
            dialog.classList.remove(...ACTIVE_CLASSLIST);
            this.removeAttribute('style');
        }, FADE_DURATION);

        this.removeDialogEventListeners();
        this.triggerEvent('mds-dialog-dismissed');
    }

    /*
    *************************
    EVENTS
    *************************
    */
    addDialogEventListeners() {
        const overlay = document.querySelector('mds-overlay');
        this.overlayClickEvents = this.overlayClickEvents.bind(this);
        this.dialogKeyDownEvents = this.dialogKeyDownEvents.bind(this);
        overlay.addEventListener('click', this.overlayClickEvents, true);
        document.addEventListener('keydown', this.dialogKeyDownEvents, true);
    }

    removeDialogEventListeners() {
        const overlay = document.querySelector('mds-overlay');
        overlay.removeEventListener('click', this.overlayClickEvents, true);
        document.removeEventListener('keydown', this.dialogKeyDownEvents, true);
    }

    overlayClickEvents() {
        const overlay = document.querySelector('mds-overlay');
        this.dismiss();
        overlay.dismiss();
    }

    dialogKeyDownEvents(event) {
        const overlay = document.querySelector('mds-overlay');
        if (event.keyCode === 27) {
            this.dismiss();
            overlay.dismiss();
        }
    }
}

MDSWCBase.defineCustomElement('mds-dialog', MdsDialog);

export default MdsDialog;
