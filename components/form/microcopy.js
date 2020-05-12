import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsMicrocopy extends MDSWCBase {
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
            id: { // added as an attribute to the custom element only
                type: String,
                required: true,
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
        const attributes = Object.keys(MdsMicrocopy.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsMicrocopy.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__microcopy` : `${this.mdsPrefix}-form__microcopy`;
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

MDSWCBase.defineCustomElement('mds-microcopy', MdsMicrocopy);

export default MdsMicrocopy;
