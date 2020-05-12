import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';

class MdsCheckbox extends MDSWCBase {
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
            checked: {
                type: Boolean,
                default: false,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            // TODO: Remove in 3.0 Deprecated indeterminate property now use setIndeterminate() method
            indeterminate: {
                type: Boolean,
                default: false,
            },
            hiddenText: {
                type: Boolean,
                default: false,
            },
            microcopy: {
                type: String,
            },
            name: {
                type: String,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
            value: {
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsCheckbox.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes; // Observe all attributes by default
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsCheckbox.defaultProps);
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__checkbox` : `${this.mdsPrefix}-form__checkbox`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const hiddenTextClass = this.hiddenText ? ` ${className}--hide-label` : '';
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${hiddenTextClass}${sizeClass}${additionalClasses}`;

        // Attributes
        const checked = this.checked ? ' checked' : '';
        const disabled = this.disabled ? ' disabled' : '';
        const microcopy = this.microcopy ? `<span class="${className}-microcopy">${this.microcopy}</span>` : '';
        const name = this.name ? ` name="${this.name}"` : '';
        const value = this.value ? ` value="${this.value}"` : '';

        // Accessibility
        const ariaDescribedby = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';

        return `
            <label class="${computedClassName}">
                <input${name}${ariaDescribedby}${value} type="checkbox" class="${className}-input"${checked}${disabled} />
                <span class="${className}-visible-wrap">
                    <span class="${className}-visual">
                        <mds-icon
                        name="check--s"
                        additional-class="${className}-checked-icon">
                        </mds-icon>
                        <mds-icon
                        name="minus--s"
                        additional-class="${className}-indeterminate-icon">
                        </mds-icon>
                    </span>
                    <span class="${className}-text">
                        <slot>${this.text}</slot>
                        ${microcopy}
                    </span>
                </span>
            </label>
        `;
    }

    render() {
        super.render(); // Calls the default base class render method
        this.componentRendered().then(() => {
            if (this.indeterminate === true) { // TODO: Remove in 3.0 Deprecated indeterminate property now use setIndeterminate() method
                this.logger.warn(`${this.tagName}:`, 'indeterminate property deprecated (to be removed in MDS 3.x) now use setIndeterminate() method');
                this.setIndeterminate();
            }
        });
    }

    setIndeterminate() {
        const input = this.querySelector(`.${this.prefixedClassName}-input`);
        input.checked = false;
        input.indeterminate = true; // You have to set it this way, indeterminate state cannot be set via setAttribute or in the HTML: https://css-tricks.com/indeterminate-checkboxes/
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const checkbox = this.querySelector(`.${this.prefixedClassName}`);
        const input = this.querySelector(`.${this.prefixedClassName}-input`);

        checkbox.addEventListener('focus', () => {
            this.triggerEvent('focus');
        });

        checkbox.addEventListener('blur', () => {
            this.triggerEvent('blur');
        });

        input.addEventListener('change', () => {
            this.setPropWithoutRendering('checked', input.checked);
        });
    }
}

MDSWCBase.defineCustomElement('mds-checkbox', MdsCheckbox);

export default MdsCheckbox;
