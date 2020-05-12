import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsSearchResults extends MDSWCBase {
    /*
    *************************
    STATIC METHODS
    *************************
    */
    static get defaultProps() {
        // List all props as camelCased object keys in alphabetical order
        return {
            additionalClass: {
                type: String, // type is required for all props
            },
            layered: {
                type: Boolean,
                default: false,
            },
            width: {
                type: String,
                default: 'fluid',
                values: ['300px', '500px', 'fluid'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsSearchResults.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes; // Observe all attributes by default
    }

    /*
    *************************
     CONSTRUCTOR (required)
    *************************
    */
    constructor() {
        super(MdsSearchResults.defaultProps);
    }

    /*
    *************************
    GETTERS (template required)
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-search-results` : `${this.mdsPrefix}-search-results`;
        const className = this.prefixedClassName;
        const containerClass = this.layered ? '' : ` ${this.prefixedClassName}__container`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const widthClass = ` ${className}--width-${this.width}`;
        const computedClassName = `${className}${containerClass}${widthClass}${additionalClasses}`;

        return `
            <div class="${computedClassName}">
                <slot></slot>
            </div>
        `;
    }
}
MDSWCBase.defineCustomElement('mds-search-results', MdsSearchResults);

export default MdsSearchResults;
