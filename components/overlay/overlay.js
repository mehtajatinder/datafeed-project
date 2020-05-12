import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsOverlay extends MDSWCBase {
    /*
    *************************
    STATIC METHODS (defaultProps and observedAttributes required, slotPropOverrideMappings optional)
    See the Props section of https://tinyurl.com/mdswc-coding-guidelines for naming conventions and other details
    *************************
    */
    static get defaultProps() {
        // List all props as camelCased object keys in alphabetical order
        return {
            additionalClass: {
                type: String, // type is required for all props
            },
            visible: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsOverlay.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes; // Observe all attributes by default
    }

    /*
    *************************
     CONSTRUCTOR (required)
    *************************
    */
    constructor() {
        super(MdsOverlay.defaultProps);
    }

    /*
    *************************
    GETTERS (template required)
    See the Slots section of: https://tinyurl.com/mdswc-coding-guidelines for template slot examples and other details
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-overlay` : `${this.mdsPrefix}-overlay`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const hiddenClass = !this.visible ? ` ${className}--hidden` : '';
        const classList = `${className}${additionalClasses}${hiddenClass}`;

        return `<div class="${classList}"></div>`;
    }

    /*
    *************************
     METHODS
    *************************
    */
    open() {
        const bodyClassName = this.namespaced ? `${this.namespacePrefix}-body-overlay` : `${this.mdsPrefix}-body-overlay`;
        document.body.classList.add(bodyClassName);
        const overlay = this.querySelector(`.${this.prefixedClassName}`);

        overlay.classList.remove(`${this.prefixedClassName}--hidden`);
        overlay.classList.add(`${this.prefixedClassName}--fadeout`);

        setTimeout(() => {
            overlay.classList.remove(`${this.prefixedClassName}--fadeout`);
        }, 100);

        this.triggerEvent('mds-overlay-opened');
    }

    dismiss() {
        const overlay = this.querySelector(`.${this.prefixedClassName}`);
        const bodyClassName = this.namespaced ? `${this.namespacePrefix}-body-overlay` : `${this.mdsPrefix}-body-overlay`;

        setTimeout(() => {
            overlay.classList.add(`${this.prefixedClassName}--fadeout`);
        }, 10);

        setTimeout(() => {
            document.body.classList.remove(bodyClassName);
            overlay.classList.remove(`${this.prefixedClassName}--fadeout`);
            overlay.classList.add(`${this.prefixedClassName}--hidden`);
        }, 500);

        this.triggerEvent('mds-overlay-dismissed');
    }

    addOverlay() {
        document.querySelector('body').appendChild(this);
    }
}

MDSWCBase.defineCustomElement('mds-overlay', MdsOverlay);

export default MdsOverlay;
