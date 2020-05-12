import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';
import '../button/button.js';

class MdsSearchField extends MDSWCBase {
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
            ariaLabel: {
                type: String,
                default: 'Search',
            },
            clearIconAriaLabel: {
                type: String,
                default: 'Clear search field',
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            placeholder: {
                type: String,
                default: 'Search...',
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch'],
            },
            value: {
                type: String,
            },
            variation: {
                type: String,
                values: ['primary', 'secondary'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsSearchField.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsSearchField.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-search-field` : `${this.mdsPrefix}-search-field`;
        const className = this.prefixedClassName;
        const sizeClass = ` ${className}--${this.size}`;
        const variationClass = this.variation ? ` ${className}--${this.variation}` : '';
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const computedClassName = `${className}${variationClass}${sizeClass}${additionalClasses}`;

        // Attributes
        const value = this.value === undefined ? '' : ` value="${this.value}"`;
        const iconName = this.size === 'large' || this.size === 'touch' ? 'search-padless' : 'search--s';
        const disabled = this.disabled ? ' disabled' : '';
        const placeholder = ` placeholder="${this.placeholder}"`;

        // Accessibility
        const ariaLabel = ` aria-label="${this.ariaLabel}"`;

        return `
            <div class="${computedClassName}" role="search">
                <input type="text" class="${className}__input"${ariaLabel}${placeholder}${value}${disabled}>
                <mds-icon name="${iconName}" additional-class="${className}__search-icon"></mds-icon>
                <mds-button
                    additional-class="${className}__clear-button ${className}__clear-button--hidden"
                    type= "button"
                    variation="icon-only"
                    size="small"
                    icon="remove--s"
                    text="${this.clearIconAriaLabel}"></mds-button>
                <span class="${className}__input-focus-outline"></span>
            </div>
        `;
    }

    /*
    *************************
    METHODS
    *************************
    */
    render() {
        super.render();
        this.componentRendered().then(() => {
            if (this.value) {
                this.showRemove();
            }
        });
    }

    showRemove() {
        const removeButton = this.querySelector(`.${this.prefixedClassName}__clear-button`);
        removeButton.classList.remove(`${this.prefixedClassName}__clear-button--hidden`);
    }

    hideRemove() {
        const removeButton = this.querySelector(`.${this.prefixedClassName}__clear-button`);
        removeButton.classList.add(`${this.prefixedClassName}__clear-button--hidden`);
    }

    clear() {
        this.hideRemove();
        this.querySelector('input').value = '';
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const searchInput = this.querySelector(`.${this.prefixedClassName}__input`);
        const removeButton = this.querySelector(`.${this.prefixedClassName} > mds-button`);

        removeButton.addEventListener('click', () => {
            this.clear();
            MDSWCBase.triggerNativeEvent(searchInput, 'change');
            searchInput.focus();
        });

        searchInput.addEventListener('hover', () => {
            this.triggerEvent('hover');
        });

        searchInput.addEventListener('focus', () => {
            this.triggerEvent('focus');
        });

        searchInput.addEventListener('input', () => {
            this.setPropWithoutRendering('value', this.querySelector('input').value);
            if (this.querySelector('input').value.length > 0) {
                this.showRemove();
            } else {
                this.hideRemove();
            }
        });
    }
}

MDSWCBase.defineCustomElement('mds-search-field', MdsSearchField);

export default MdsSearchField;
