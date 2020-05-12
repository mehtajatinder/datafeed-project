import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsSwitchGroup extends MDSWCBase {
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
            label: {
                type: String,
                required: true,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsSwitchGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsSwitchGroup.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-switch__group` : `${this.mdsPrefix}-switch__group`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${additionalClasses}`;

        // Legend
        const labelText = this.label ? `${this.label}` : '';

        // Accessibility
        const ariaDescribedby = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';

        return `
            <fieldset class="${computedClassName}"${ariaDescribedby} role="group">
                <legend class="${className}-label">
                ${labelText}
                </legend>
                <slot></slot>
            </fieldset>
        `;
    }
}

MDSWCBase.defineCustomElement('mds-switch-group', MdsSwitchGroup);

export default MdsSwitchGroup;
