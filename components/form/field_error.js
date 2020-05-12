import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsFieldError extends MDSWCBase {
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
            id: {
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
            visible: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsFieldError.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsFieldError.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__field-error` : `${this.mdsPrefix}-form__field-error`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const visible = this.visible ? '' : ` ${className}--hidden`;
        const computedClassName = `${className}${sizeClass}${additionalClasses}${visible}`;

        // Default template
        return `<span class="${computedClassName}" aria-live="assertive">
                    <span class="${className}-text">
                        <slot>${this.text}</slot>
                    </span>
                </span>`;
    }

    // If your component uses a slots, specify which property or properties will prevent slots from being rendered
    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }

    /*
    *************************
    METHODS
    *************************
    */
    show() { // TODO: Remove in 3.0 Deprecated show method() to let team handle the inner-working of Form elements and the state
        this.logger.warn(`${this.tagName}:`, 'show() method deprecated (to be removed in MDS 3.x) instead set visible prop to true');
        this.visible = true;
        this.triggerEvent('mds-field-error-activated');
    }

    hide() { // TODO: Remove in 3.0 Deprecated hide method() to let team handle the inner-working of Form elements and the state
        this.logger.warn(`${this.tagName}:`, 'hide() method deprecated (to be removed in MDS 3.x) instead set visible prop to false');
        this.visible = false;
        this.triggerEvent('mds-field-error-dismissed');
    }
}

MDSWCBase.defineCustomElement('mds-field-error', MdsFieldError);

export default MdsFieldError;
