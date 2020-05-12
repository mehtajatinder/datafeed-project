import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';

class MdsSelect extends MDSWCBase {
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
            disabled: {
                type: Boolean,
                default: false,
            },
            id: {
                type: String,
                required: true,
            },
            name: {
                type: String,
            },
            placeholder: {
                type: String,
            },
            options: {
                type: Array,
                validator: (items, otherProps) => {
                    let optionsValid = true;
                    const placeholderPosition = otherProps.placeholder === undefined ? 0 : -1;
                    items.forEach((item, index) => {
                        if (item.children === undefined && index > placeholderPosition) {
                            optionsValid = item.value !== '';
                        } else if (item.children !== undefined) {
                            item.children.forEach((child) => {
                                if ((child.value === undefined || child.value.length < 1) || (child.text === undefined || child.text.length < 1)) {
                                    optionsValid = false;
                                }
                            });
                        }
                    });
                    return optionsValid;
                },
            },
            required: {
                type: Boolean,
                default: false,
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
        const attributes = Object.keys(MdsSelect.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsSelect.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-form__select` : `${this.mdsPrefix}-form__select`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const additionalClasses = this.additionalClass === undefined ? '' : ` ${this.additionalClass}`;
        const computedClassName = `${className}${sizeClass}${additionalClasses}`;

        const name = this.name ? ` name="${this.name}"` : '';
        const disabled = this.disabled ? ' disabled' : '';
        const required = this.required ? ' required' : '';
        const placeholder = this.placeholder === undefined ? '' : `<option value="" class="${className}-option">${this.placeholder}</option>`;
        const id = this.hasAttribute('id') ? ` id="${this.getAttribute('id')}-label"` : '';

        // Accessibility
        const ariaDescribedBy = this.ariaDescribedby ? ` aria-describedby="${this.ariaDescribedby}"` : '';
        const ariaInvalid = ` aria-invalid="${this.ariaInvalid}"`;

        let optionItems = '';

        if (this.options) {
            this.options.forEach((elem) => {
                optionItems += MdsSelect.buildSubTemplate(elem, className);
            });
        }

        return `
            <div class="${computedClassName}">
                <select class="${className}-input"${id}${name}${disabled}${ariaDescribedBy}${required}${ariaInvalid}>
                    ${placeholder}
                    ${optionItems}
                </select>
                <div class="${className}-visual-wrap"></div>
                <span class="${className}-open-indicator">
                    <mds-icon name="caret-down--s" additional-class="${className}-open-icon"></mds-icon>
                </span>
            </div>
        `;
    }

    // Loop through array and spit out whole fragment
    static buildSubTemplate(option, className) {
        let optionTemplate = '';

        if (option.children) {
            const optgroupClass = option.class === undefined ? '' : ` class="${option.class}"`;
            const optgroupDisabled = option.disabled ? ' disabled' : '';

            let childOptions = '';
            option.children.forEach((child) => {
                const childOptionClass = child.class === undefined ? '' : ` ${child.class}`;
                const childOptionDisabled = child.disabled ? ' disabled' : '';
                childOptions += `<option class="${className}-option${childOptionClass}" value="${child.value}"${childOptionDisabled}>${child.text}</option>`;
            });
            optionTemplate = `<optgroup label="${option.text}"${optgroupClass}${optgroupDisabled}>${childOptions}</optgroup>`;
        } else {
            const optionClass = option.class === undefined ? '' : ` ${option.class}`;
            const optionDisabled = option.disabled ? ' disabled' : '';
            optionTemplate = `<option class="${className}-option${optionClass}" value="${option.value}"${optionDisabled}>${option.text}</option>`;
        }

        return optionTemplate;
    }

    render() {
        super.render();
        this.componentRendered().then(() => {
            if (this.value) {
                this.querySelector(`.${this.prefixedClassName}-input`).value = this.value;
            }
        });
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const select = this.querySelector(`.${this.prefixedClassName}-input`);

        select.addEventListener('focus', () => {
          this.triggerEvent('focus');
        });

        select.addEventListener('blur', () => {
          this.triggerEvent('blur');
        });

        select.addEventListener('change', () => {
            this.setPropWithoutRendering('value', this.querySelector('select').value);
        });
    }
}

MDSWCBase.defineCustomElement('mds-select', MdsSelect);

export default MdsSelect;
