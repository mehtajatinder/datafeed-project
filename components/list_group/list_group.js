import MDSWCBase from '../mdswc_base/mdswc_base.js';
import MdsListGroupItem from '../list_group_item/list_group_item.js';

class MdsListGroup extends MDSWCBase {
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
            content: {
                type: Array, // active, class, disabled, href, iconLeft, iconRight, image, imageRound, metadata, metdataBelow, seperatorBefore, text, toggleActive, variation
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large', 'touch', 'touch-revised'], // TODO: `touch` Deprecated, will be removed in 3.0, use `touch-revised` instead
            },
            variation: {
                type: String,
                values: ['selection', 'navigation'],
            },
            withIcon: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsListGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsListGroup.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-list-group` : `${this.mdsPrefix}-list-group`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const withIconClass = this.withIcon ? ` ${className}--with-icon` : '';
        const computedClassName = `${className}${additionalClasses}${sizeClass}${withIconClass}`;

        // set appropriate attributes for Selection variation
        const selectionAttributes = this.variation === 'selection' ? ' role="radiogroup" tabindex="0"' : '';

        let itemsFragment = '';
        if (this.content) {
            itemsFragment = MdsListGroup.buildSubTemplate(this.content, this.size, this.variation);
        } else {
            itemsFragment = '<slot></slot>';
        }

        return `
            <ul class="${computedClassName}"${selectionAttributes}>
                ${itemsFragment}
            </ul>
        `;
    }

    // Loop through array and spit out whole fragment
    static buildSubTemplate(items, size, groupVariation) {
        let itemList = '';
        const parentVariation = groupVariation === undefined ? '' : ` parent-variation="${groupVariation}"`;
        const parentSize = ` size="${size}"`;

        // Get MdsListGroupItem API
        const listGroupItemAPI = Object.keys(MdsListGroupItem.defaultProps);

        items.forEach((item) => {
            let customPropsList = '';
            const active = item.active ? ' active' : '';
            const additionalClassNames = item.additionalClass === undefined ? '' : ` additional-class="${item.additionalClass}"`;
            const disabled = item.disabled ? ' disabled' : '';
            const id = item.id ? ` id="${item.id}"` : '';
            const image = item.image ? ` image="${item.image}"` : '';
            const imageRound = item.imageRound ? ' image-round' : '';
            const hrefLink = item.href ? ` href="${item.href}"` : '';
            const metadata = item.metadata ? ` metadata="${item.metadata}"` : '';
            const metadataBelow = item.metadataBelow === undefined ? '' : ` metadata-below='${JSON.stringify(item.metadataBelow)}'`;
            const microcopy = item.microcopy ? ` microcopy="${item.microcopy}"` : '';
            const header = item.header ? ' header' : '';
            const toggleActive = item.toggleActive ? ' toggle-active' : '';
            const children = item.children === undefined ? '' : ` children='${JSON.stringify(item.children)}'`;

            // Custom or additional props if provided
            const customItemKeys = Object.keys(item).filter(key => !listGroupItemAPI.includes(key));
            customItemKeys.forEach((key) => {
                customPropsList += ` ${MDSWCBase.kebabCase(key)}="${item[key]}"`;
            });

            // Single selection
            const checked = item.checked ? ' checked' : '';
            const value = item.value ? ` value="${item.value}"` : '';
            const name = item.name ? ` name="${item.name}"` : '';

            // Add icon if present
            const iconLeft = item.iconLeft === undefined ? '' : ` icon-left="${item.iconLeft}"`;
            const iconRight = item.iconRight === undefined ? '' : ` icon-right="${item.iconRight}"`;

            const computedItemAttributes = `${hrefLink}${parentVariation}${parentSize}${metadata}${microcopy}${metadataBelow}${iconLeft}${iconRight}${image}${imageRound}${additionalClassNames}${disabled}${header}${checked}${name}${value}`;

            itemList += `<mds-list-group-item${id}${customPropsList} text="${item.text}"${active}${toggleActive}${computedItemAttributes}${children}></mds-list-group-item>`;
        });

        return itemList;
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const listGroup = this.querySelector(`.${this.prefixedClassName}`);
        const listGroupItems = this.querySelectorAll('mds-list-group-item');

        if (this.variation === 'selection') {
            listGroup.addEventListener('change', (event) => {
                const selectedInput = event.target;
                const items = Array.from(listGroupItems);
                items.forEach((item) => {
                    const radioInput = item.querySelector('input');
                    if (radioInput === selectedInput) {
                        return;
                    }
                    item.setPropWithoutRendering('checked', false);
                    item.querySelector('.mds-list-group__item').classList.remove('mds-list-group__item--active');
                });
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-list-group', MdsListGroup);

export default MdsListGroup;
