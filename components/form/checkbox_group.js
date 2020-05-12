import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsCheckboxGroup extends MDSWCBase {
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
            ariaRequiredText: {
                type: String,
                default: 'Select an option.',
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
        const attributes = Object.keys(MdsCheckboxGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsCheckboxGroup.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form` : `${this.mdsPrefix}-form`;
        const className = `${this.prefixedClassName}__checkbox-group`;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;

        const labelText = this.label ? `${this.label}` : '';
        const optionalText = this.optional ? `${this.optionalText}` : '';

        // Accessibility
        const ariaDescribedby = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';
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
            <fieldset tabindex="0" class="${computedClassName}"${ariaDescribedby} role="group">
                <legend class="${className}-label">
                    ${labelText}${optionalTemplate}${requiredTemplate}
                </legend>
                <slot></slot>
            </fieldset>
        `;
    }
}

MDSWCBase.defineCustomElement('mds-checkbox-group', MdsCheckboxGroup);

export default MdsCheckboxGroup;
