import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../icon/icon.js';

class MdsListGroupItem extends MDSWCBase {
    static get defaultProps() {
        return {
            active: {
                type: Boolean,
                default: false,
            },
            additionalClass: {
                type: String,
            },
            checked: { // for Selection based list group only
                type: Boolean,
                default: false,
            },
            children: {
                type: Array,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            header: {
                type: Boolean,
                default: false,
            },
            href: {
                type: String,
                default: '#',
            },
            iconLeft: {
                type: String,
            },
            iconRight: {
                type: String,
            },
            id: {
                type: String,
            },
            image: {
                type: String,
            },
            imageRound: {
                type: Boolean,
                default: false,
            },
            metadata: {
                type: String,
            },
            metadataBelow: {
                type: Array,
            },
            microcopy: {
                type: String,
            },
            name: { // for Selection based list group only
                type: String,
            },
            parentVariation: { // from MdsListGroup to handle icon name automatically
                type: String,
            },
            separatorBefore: {
                type: Boolean,
                default: false,
            },
            size: { // from MdsListGroup to handle icon sizes
                type: String,
            },
            text: {
                type: String,
                required: true,
            },
            toggleActive: {
                type: Boolean,
                default: false,
            },
            value: { // for Selection based list group only
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsListGroupItem.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    constructor() {
        super(MdsListGroupItem.defaultProps);
    }

    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-list-group` : `${this.mdsPrefix}-list-group`;
        const className = `${this.prefixedClassName}__item`;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const headerClass = this.header ? ` ${className}--header` : '';
        const disabledClass = this.disabled ? ` ${className}--disabled` : '';
        const activeClass = (this.active || this.checked) ? ` ${className}--active` : '';
        const computedClassName = `${className}${additionalClasses}${headerClass}${disabledClass}${activeClass}`;

        const id = this.id ? ` id="${this.id}--item"` : '';
        const hrefLink = this.href;
        const metadata = this.metadata ? `<span class="${className}-metadata">${this.metadata}</span>` : '';
        const microcopy = this.microcopy ? `<span class="${className}-microcopy">${this.microcopy}</span>` : '';
        const useSmallIcon = this.size === 'small' || this.size === 'medium';
        const linkWithImageClass = this.image ? ` ${this.prefixedClassName}__link--with-image` : '';
        const imageRoundClass = this.imageRound ? ` ${className}-image--round` : '';

        // Accessibility
        const ariaDisabled = this.disabled ? ' aria-disabled="true"' : '';

        // Add left icon if present
        const iconLeft = this.iconLeft === undefined ? '' : `<mds-icon name="${this.iconLeft}" additional-class="${this.prefixedClassName}__left-icon" aria-hidden="true"></mds-icon>`;
        let iconRight = this.iconRight === undefined ? '' : `<mds-icon name="${this.iconRight}" additional-class="${this.prefixedClassName}__right-icon" aria-hidden="true"></mds-icon>`;

        // Props passed from mds-list-group
        let iconName = '';
        if (this.parentVariation === 'selection') {
            iconName = useSmallIcon ? 'check--s' : 'check';
        } else if (this.parentVariation === 'navigation') {
            iconName = useSmallIcon ? 'caret-right--s' : 'caret-right';
        }

        if (this.parentVariation === 'selection') {
            iconRight = `<mds-icon name="${iconName}" additional-class="${this.prefixedClassName}__active-icon" aria-hidden="true"></mds-icon>`;
        } else if (this.parentVariation === 'navigation') {
            iconRight = `<div class="${this.prefixedClassName}__active-indicator"></div>`;
        }

        const radioRole = this.parentVariation === 'selection' ? ' role="radio"' : '';

        // Item template
        let itemTemplate = `
            <a href="${hrefLink}" class="${this.prefixedClassName}__link${linkWithImageClass}"${ariaDisabled}>
                ${iconLeft}
                ${this.image ?
                    `
                        <img class="${className}-image${imageRoundClass}" src="${this.image}" aria-hidden="true">
                    ` : ''
                }
                <span class="${className}-text">
                    ${this.text}
                    ${metadata}
                    ${microcopy}
                    ${this.metadataBelow && this.metadataBelow.length ?
                        `
                        <span class="${className}-metadata-below">
                            ${this.metadataBelow.map(item => `<span class="${className}-metadata-below-item">${item}</span>`).join('')}
                        </span>
                        ` : ''
                    }
                </span>
                ${iconRight}
            </a>`;

        // If item has children, make this a toggle
        if (this.children) {
            const toggleId = MDSWCBase.generateRandomNumber();
            const toggleActive = this.toggleActive ? ' checked' : '';
            const iconClassName = this.namespaced ? `${this.namespacePrefix}-icon` : `${this.mdsPrefix}-icon`;

            let subItems = '';
            let childrenItems = this.children;
            try {
                childrenItems = JSON.parse(this.children);
            } catch (e) {
                // warning
            }
            subItems = MdsListGroupItem.buildSubTemplate(childrenItems, this.size, this.parentVariation, this.prefixedClassName);

            itemTemplate = `
                <input type="checkbox" class="${this.prefixedClassName}__toggle-input" id="mds-list-group__toggle-input-${toggleId}" ${toggleActive}>
                <label for="mds-list-group__toggle-input-${toggleId}" class="${this.prefixedClassName}__toggle">
                    ${iconLeft}
                    <svg class="${iconClassName} ${this.prefixedClassName}__toggle-icon" aria-hidden="true">
                        <use xlink:href="#triangle-fill-down--s"></use>
                    </svg>
                    <span class="${this.prefixedClassName}__toggle-text">
                        ${this.text}
                    </span>
                    ${iconRight}
                </label>
                ${subItems}
            `;
        }

        if (this.header) {
            itemTemplate = `${this.text}`;
        }

        if (this.parentVariation === 'selection') {
            const inputId = MDSWCBase.generateRandomNumber();
            const checked = this.checked ? ' checked' : '';
            const disabled = this.disabled ? ' disabled' : '';
            const selectionWithImageClass = this.image ? ` ${this.prefixedClassName}__selection--with-image` : '';

            // Validate `name` and `value`
            if (!this.name) {
                this.logger.warn(`${this.tagName}: ${this.componentId}`, `Prop validation failure: No value passed for required prop in ${this.parentVariation}: 'name'. You must provide a value for 'name'`);
            }

            if (!this.value) {
                this.logger.warn(`${this.tagName}: ${this.componentId}`, `Prop validation failure: No value passed for required prop in ${this.parentVariation}: 'value'. You must provide a value for 'value'`);
            }

            itemTemplate = `
                <input type="radio" value="${this.value}" name="${this.name}" class="${this.prefixedClassName}__selection-input" id="mds-list-group__selection-input-${inputId}"${checked}${disabled} />
                <label for="mds-list-group__selection-input-${inputId}" class="${this.prefixedClassName}__selection${selectionWithImageClass}"${ariaDisabled}>
                    ${iconLeft}
                    ${this.image ?
                        `
                            <img class="${className}-image${imageRoundClass}" src="${this.image}" aria-hidden="true">
                        ` : ''
                    }
                    <span class="${className}-text">
                        ${this.text}
                        ${metadata}
                        ${microcopy}
                        ${this.metadataBelow && this.metadataBelow.length ?
                            `
                            <span class="${className}-metadata-below">
                                ${this.metadataBelow.map(item => `<span class="${className}-metadata-below-item">${item}</span>`).join('')}
                            </span>
                            ` : ''
                        }
                    </span>
                    ${iconRight}
                </label>
            `;
        }

        return `
            <li${id} class="${computedClassName}"${radioRole}>
                ${itemTemplate}
            </li>
        `;
    }

    // Loop through array and spit out whole fragment
    static buildSubTemplate(children, size, variation, groupClassName) {
        const className = `${groupClassName}__item`;

        let subItems = '';
        children.forEach((child) => {
            let customAttributes = '';
            const activeClass = child.active ? ` ${className}--active` : '';
            const additionalClass = child.additionalClass ? ` ${child.additionalClass}` : '';
            const separatorClass = child.separatorBefore ? ` ${className}--separator-before` : '';
            const ariaDisabled = child.disabled ? ' aria-disabled="true"' : '';
            const disabledClass = child.disabled ? ` ${className}--disabled` : '';
            const id = child.id ? ` id="${child.id}--item"` : '';
            const hrefLink = child.href === undefined ? '#' : `${child.href}`;
            const metadata = child.metadata === undefined ? '' : `<span class="${className}-metadata">${child.metadata}</span>`;

            // Add icon if present
            let iconRight = child.iconRight === undefined ? '' : `<mds-icon name="${child.iconRight}" additional-class="${groupClassName}__active-icon" aria-hidden="true"></mds-icon>`;

            // if variation is 'navigation', use active indicator
            if (variation === 'navigation' && child.active) {
                iconRight = `<div class="${groupClassName}__active-indicator"></div>`;
            }

            // Custom attributes if provided
            const customItemKeys = Object.keys(child).filter(key => !Object.keys(MdsListGroupItem.defaultProps).includes(key));
            customItemKeys.forEach((key) => {
                customAttributes += ` ${MDSWCBase.kebabCase(key)}="${child[key]}"`;
            });

            subItems += `<li${id} class="${className} ${className}--sublist${activeClass}${separatorClass}${disabledClass}${additionalClass}">
                <a href="${hrefLink}" class='${groupClassName}__link'${ariaDisabled}${customAttributes}>
                    <span class='${groupClassName}__item-text'>
                    ${child.text}
                    ${metadata}
                    </span>
                    ${iconRight}
                </a>
            </li>`;
        });

        return `<ul class="${groupClassName}__sublist">${subItems}</ul>`;
    }

    bindEventHandlers() {
        const listGroupItemLink = this.querySelector('a');

        if (listGroupItemLink) {
            listGroupItemLink.addEventListener('focus', () => {
                this.triggerEvent('focus');
            });

            listGroupItemLink.addEventListener('blur', () => {
                this.triggerEvent('blur');
            });
        }

        // Selection based list item, e.g. radio button
        const listGroupItemInput = this.querySelector('input[type="radio"]');

        if (listGroupItemInput) {
            listGroupItemInput.addEventListener('focus', () => {
                this.triggerEvent('focus');
            });

            listGroupItemInput.addEventListener('blur', () => {
                this.triggerEvent('blur');
            });

            listGroupItemInput.addEventListener('change', () => {
                this.setPropWithoutRendering('checked', listGroupItemInput.checked);
                this.querySelector('.mds-list-group__item').classList.add('mds-list-group__item--active');
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-list-group-item', MdsListGroupItem);

export default MdsListGroupItem;
