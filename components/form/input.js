import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsInput extends MDSWCBase {
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
            ariaInvalid: {
                type: String,
                default: 'false',
                values: ['false', 'true', 'grammar', 'spelling'],
            },
            autocomplete: {
                type: String,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            id: {
                type: String,
                required: true,
            },
            max: {
                type: Number,
            },
            maxlength: {
                type: Number,
            },
            min: {
                type: Number,
            },
            minlength: {
                type: Number,
            },
            name: {
                type: String,
            },
            pattern: {
                type: String,
            },
            placeholder: {
                type: String,
            },
            readonly: {
                type: Boolean,
                default: false,
            },
            required: {
                type: Boolean,
                default: false,
            },
            rightAligned: {
                type: Boolean,
                default: false,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
            spellcheck: {
                type: Boolean,
            },
            step: {
                type: Number,
            },
            type: {
                type: String,
                default: 'text',
                values: ['email', 'number', 'password', 'tel', 'text', 'url'],
            },
            value: {
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsInput.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsInput.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__input` : `${this.mdsPrefix}-form__input`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const rightAlignedClass = this.rightAligned ? ` ${className}--right-aligned` : '';
        const computedClassName = `${className}${additionalClasses}${sizeClass}${rightAlignedClass}`;

        const id = this.hasAttribute('id') ? ` id="${this.getAttribute('id')}-label"` : '';
        const name = this.name ? ` name="${this.name}"` : '';
        const value = this.value ? ` value="${this.value}"` : '';
        const placeholder = this.placeholder ? ` placeholder="${this.placeholder}"` : '';
        const readonly = this.readonly ? ' readonly' : '';
        const required = this.required ? ' required' : '';
        const disabled = this.disabled ? ' disabled' : '';

        // Less common attributes
        const autocomplete = this.autocomplete ? ` autocomplete="${this.autocomplete}"` : '';
        const max = this.max ? ` max="${this.max}"` : '';
        const maxlength = this.maxlength ? ` maxlength="${this.maxlength}"` : '';
        const min = this.min !== undefined ? ` min="${this.min}"` : '';
        const minlength = this.minlength ? ` minlength="${this.minlength}"` : '';
        const pattern = this.pattern ? ` pattern="${this.pattern}"` : '';
        const spellcheck = this.spellcheck ? ` spellcheck="${this.spellcheck}"` : '';
        const step = this.step ? ` step="${this.step}"` : '';

        // Accessibility
        const ariaDescribedBy = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';
        const ariaInvalid = ` aria-invalid="${this.ariaInvalid}"`;

        return `<input type="${this.type}" class="${computedClassName}"${id}${name}${value}${placeholder}${disabled}${ariaDescribedBy}${ariaInvalid}${required}${readonly}${autocomplete}${minlength}${maxlength}${pattern}${min}${max}${spellcheck}${step} />`;
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const input = this.querySelector('input');

        input.addEventListener('focus', () => {
            this.triggerEvent('focus');
        });

        input.addEventListener('blur', () => {
            this.triggerEvent('blur');
        });

        input.addEventListener('input', () => {
            this.setPropWithoutRendering('value', this.querySelector('input').value);
        });
    }
}

MDSWCBase.defineCustomElement('mds-input', MdsInput);

export default MdsInput;
