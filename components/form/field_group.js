import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsFieldGroup extends MDSWCBase {
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
            error: {
                type: Boolean,
                default: false,
            },
            horizontal: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsFieldGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsFieldGroup.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        // Classes
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__field-group` : `${this.mdsPrefix}-form__field-group`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const horizontalClass = this.horizontal ? ` ${className}--horizontal` : '';
        const errorClass = this.error ? ` ${className}--error` : '';
        const computedClassName = `${className}${additionalClasses}${horizontalClass}${errorClass}`;

        return `
            <div class="${computedClassName}">
                <slot></slot>
            </div>
        `;
    }

    /*
    *************************
    EVENTS
    *************************
    */
    // TODO: Remove in 3.0 Deprecated to let team decide how to handle error prop
    bindEventHandlers() {
        const errorElems = this.querySelectorAll('mds-field-error');
        const errorElemsArray = Array.from(errorElems);
        if (errorElemsArray.length > 0) {
            errorElemsArray.forEach((elem) => {
                elem.addEventListener('mds-field-error-activated', () => {
                    this.error = true;
                });
            });

            errorElemsArray.forEach((elem) => {
                elem.addEventListener('mds-field-error-dismissed', () => {
                    this.error = false;
                });
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-field-group', MdsFieldGroup);

export default MdsFieldGroup;
