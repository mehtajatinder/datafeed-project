import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsLoader extends MDSWCBase {
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
            ariaValuetext: {
                type: String,
                default: 'Loading...',
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsLoader.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes; // Observe all attributes
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsLoader.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-loader` : `${this.mdsPrefix}-loader`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;

        const loaderItemCount = 8;
        let loaderItems = '';

        for (let loaderItemCounter = 1; loaderItemCounter <= loaderItemCount; loaderItemCounter += 1) {
            loaderItems += `<div class="${className}__item ${className}__item--${loaderItemCounter}"></div>`;
        }

        return `<div class="${computedClassName}" role="progressbar" aria-valuetext="${this.ariaValuetext}">
                ${loaderItems}
            </div>`;
    }
}

MDSWCBase.defineCustomElement('mds-loader', MdsLoader);

export default MdsLoader;
