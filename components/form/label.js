import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsLabel extends MDSWCBase {
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
            for: {
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
            requiredText: {
                type: String,
                default: 'This field is required.',
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
            text: {
                type: String,
                required: true,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsLabel.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsLabel.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        // Classes
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form` : `${this.mdsPrefix}-form`;
        const className = `${this.prefixedClassName}__label`;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className} ${sizeClass} ${additionalClasses}`;

        const forAttribute = ` for="${this.for}-label"`;

        const optionalText = this.optional || this.hasNamedSlotContent('mds-label-optional-text') ? `${this.optionalText}` : '';
        const requiredText = this.required ? `${this.requiredText}` : '';

        let optionalSlot = '';
        let requiredTemplate = '';

        if (this.optional && !this.required) {
            optionalSlot = `<span class="${this.prefixedClassName}__label-optional"><slot name="mds-label-optional-text">${optionalText}</slot></span>`;
        }

        if (this.required && !this.optional) {
            requiredTemplate = `
                <abbr class="${this.prefixedClassName}__label-required-indicator" title="${requiredText}" aria-label="${requiredText}">*</abbr>
            `;
        }

        return `
            <label class="${computedClassName}"${forAttribute}>
                <slot>${this.text}</slot>
                ${requiredTemplate}
                ${optionalSlot}
            </label>
        `;
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
            MdsLabelOptionalText: 'optionalText',
        };
    }
}

MDSWCBase.defineCustomElement('mds-label', MdsLabel);

export default MdsLabel;
