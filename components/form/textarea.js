import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsTextarea extends MDSWCBase {
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
                type: Boolean,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            id: {
                type: String,
                required: true,
            },
            maxlength: {
                type: Number,
            },
            minlength: {
                type: Number,
            },
            name: {
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
            rows: {
                type: Number,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
            text: {
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsTextarea.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsTextarea.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__textarea` : `${this.mdsPrefix}-form__textarea`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;

        const maxlength = this.maxlength === undefined ? '' : ` maxlength="${this.maxlength}"`;
        const minlength = this.minlength === undefined ? '' : ` minlength="${this.minlength}"`;
        const name = this.name === undefined ? '' : ` name="${this.name}"`;
        const disabled = this.disabled ? ' disabled' : '';
        const required = this.required ? ' required' : '';
        const readonly = this.readonly ? ' readonly' : '';
        const rows = this.rows === undefined ? '' : ` rows="${this.rows}"`;
        const placeholder = this.placeholder === undefined ? '' : ` placeholder="${this.placeholder}"`;
        const id = this.hasAttribute('id') ? ` id="${this.getAttribute('id')}-label"` : '';

        // Accessibility
        const ariaDescribedBy = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';
        const ariaInvalid = this.ariaInvalid === undefined ? '' : ` aria-invalid="${this.ariaInvalid}"`;

        return `
            <textarea class="${computedClassName}"${id}${name}${placeholder}${disabled}${ariaDescribedBy}${ariaInvalid}${required}${readonly}${minlength}${maxlength}${rows}></textarea>
        `;
    }

    render() {
        super.render();
        this.componentRendered().then(() => {
            if (this.text !== undefined) {
                this.querySelector(`.${this.prefixedClassName}`).innerText = this.text;
            }
        });
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const textarea = this.querySelector('textarea');

        textarea.addEventListener('focus', () => {
            this.triggerEvent('focus');
        });

        textarea.addEventListener('blur', () => {
            this.triggerEvent('blur');
        });

        textarea.addEventListener('input', () => {
            this.setPropWithoutRendering('text', this.querySelector('textarea').value);
        });
    }
}

MDSWCBase.defineCustomElement('mds-textarea', MdsTextarea);

export default MdsTextarea;
