import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsRadioButtonGroup extends MDSWCBase {
    /*
    *************************
    PROPS
    *************************
    */
    static get defaultProps() {
        return {
            ariaDescribedby: {
                type: String,
            },
            ariaRequiredText: {
                type: String,
                default: 'Please select an option.',
            },
            additionalClass: {
                type: String,
            },
            label: {
                type: String,
                required: true,
            },
            optional: {
                type: Boolean,
                default: false,
            },
            optionalText: {
                type: String,
                default: '(Optional)',
            },
            required: {
                type: Boolean,
                default: false,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsRadioButtonGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsRadioButtonGroup.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form` : `${this.mdsPrefix}-form`;
        const className = `${this.prefixedClassName}__radio-button-group`;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;
        const labelText = this.label ? `${this.label}` : '';
        const optionalText = this.optional ? `${this.optionalText}` : '';

        // Accessibility
        const ariaRequiredText = this.required ? `${this.ariaRequiredText}` : '';

        let optionalTemplate = '';
        if (this.optional && !this.required) {
            optionalTemplate = ` <span class="${this.prefixedClassName}__label-optional">${optionalText}</span>`;
        }

        let requiredTemplate = '';
        if (this.required && !this.optional) {
            requiredTemplate = `
                <abbr class="${this.prefixedClassName}__label-required-indicator" title="${ariaRequiredText}" aria-label="${ariaRequiredText}">*</abbr>
            `;
        }

        return `
        <fieldset tabindex="0" class="${computedClassName}" aria-describedby="${this.ariaDescribedby}" role="radiogroup">
            <legend class="${this.prefixedClassName}__radio-button-group-label">
                ${labelText}${optionalTemplate}${requiredTemplate}
            </legend>
            <slot></slot>
        </fieldset>
        `;
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const radioButtonGroup = this.querySelector(`.${this.prefixedClassName}__radio-button-group`);
        const radioButtons = this.querySelectorAll('mds-radio-button');
        const inputPrefix = this.namespaced ? `${this.namespacePrefix}-form__radio-button` : `${this.mdsPrefix}-form__radio-button`;

        radioButtonGroup.addEventListener('change', (event) => {
            const selectedInput = event.target;
            const radios = Array.from(radioButtons);
            radios.forEach((radioBtn) => {
                const radioInput = radioBtn.querySelector(`.${inputPrefix}-input`);
                if (radioInput === selectedInput) {
                    return;
                }
                radioBtn.setPropWithoutRendering('checked', false);
            });
        });
    }
}

MDSWCBase.defineCustomElement('mds-radio-button-group', MdsRadioButtonGroup);

export default MdsRadioButtonGroup;
