import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsSwitch extends MDSWCBase {
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
            checked: {
                type: Boolean,
                default: false,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            hiddenText: {
                type: Boolean,
                default: false,
            },
            name: {
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
            value: {
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsSwitch.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsSwitch.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-switch` : `${this.mdsPrefix}-switch`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const hiddenTextClass = this.hiddenText ? ` ${className}--hide-label` : '';
        const computedClassName = `${className}${sizeClass}${additionalClasses}${hiddenTextClass}`;

        // Attributes
        const name = this.name ? ` name="${this.name}"` : '';
        const value = this.value ? ` value="${this.value}"` : '';
        const disabled = this.disabled ? ' disabled' : '';
        const checked = this.checked ? ' checked' : '';

        return `
            <div class="${computedClassName}">
                <label class="${className}__label">
                    <input type="checkbox" role="switch" class="${className}__input"${name}${value}${disabled}${checked} />
                    <span class="${className}__text">
                        <slot>${this.text}</slot>
                    </span>
                </label>
            </div>
        `;
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const switchElement = this.querySelector(`.${this.prefixedClassName}__input`);

        switchElement.addEventListener('focus', () => {
            this.triggerEvent('focus');
        });

        switchElement.addEventListener('blur', () => {
            this.triggerEvent('blur');
        });

        switchElement.addEventListener('input', () => {
            this.setPropWithoutRendering('checked', switchElement.checked);
        });
    }
}

MDSWCBase.defineCustomElement('mds-switch', MdsSwitch);

export default MdsSwitch;
