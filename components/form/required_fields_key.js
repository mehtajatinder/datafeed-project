import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsRequiredFieldsKey extends MDSWCBase {
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
        const attributes = Object.keys(MdsRequiredFieldsKey.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsRequiredFieldsKey.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__required-fields-key` : `${this.mdsPrefix}-form__required-fields-key`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;

        const template = `
            <span class="${computedClassName}">
                <slot>${this.text}</slot>
            </span>
        `;

        return template;
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }
}

MDSWCBase.defineCustomElement('mds-required-fields-key', MdsRequiredFieldsKey);

export default MdsRequiredFieldsKey;
