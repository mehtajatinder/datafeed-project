import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsRadioButton extends MDSWCBase {
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
            checked: {
                type: Boolean,
                default: false,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            microcopy: {
                type: String,
            },
            name: {
                type: String,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
            value: {
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsRadioButton.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsRadioButton.defaultProps);
    }

    /*
    *************************
    GETTERS
    *************************
    */
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
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__radio-button` : `${this.mdsPrefix}-form__radio-button`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;

        // Attributes
        const name = this.name ? ` name="${this.name}"` : '';
        const checked = this.checked ? ' checked' : '';
        const disabled = this.disabled ? ' disabled' : '';
        const microcopy = this.microcopy ? `<span class="${className}-microcopy">${this.microcopy}</span>` : '';
        const value = this.value ? ` value="${this.value}"` : '';

        return `
            <label class="${computedClassName}">
                <input${name}${value} type="radio" class="${className}-input"${checked}${disabled} />
                <span class="${className}-visible-wrap">
                    <span class="${className}-visual"></span>
                    <span class="${className}-text ">
                        <slot>${this.text}</slot>
                        ${microcopy}
                    </span>
                </span>
            </label>
        `;
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const radioButton = this.querySelector(`.${this.prefixedClassName}`);
        const input = this.querySelector(`.${this.prefixedClassName}-input`);

        radioButton.addEventListener('focus', () => {
            this.triggerEvent('focus');
        });

        radioButton.addEventListener('blur', () => {
            this.triggerEvent('blur');
        });

        input.addEventListener('change', () => {
            this.setPropWithoutRendering('checked', input.checked);
        });
    }
}

MDSWCBase.defineCustomElement('mds-radio-button', MdsRadioButton);

export default MdsRadioButton;
