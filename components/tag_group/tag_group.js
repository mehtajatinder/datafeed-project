import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsTagGroup extends MDSWCBase {
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
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsTagGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsTagGroup.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-tag-group` : `${this.mdsPrefix}-tag-group`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';

        return `
            <div class="${this.prefixedClassName}${additionalClasses}">
                <slot></slot>
            </div>
        `;
    }
}

MDSWCBase.defineCustomElement('mds-tag-group', MdsTagGroup);

export default MdsTagGroup;
