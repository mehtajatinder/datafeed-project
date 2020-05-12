import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsCard extends MDSWCBase {
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
            caption: {
                type: String,
            },
            fullBleed: {
                type: Boolean,
                default: false,
            },
            headingLevel: { // Title heading level appropriate within product's information document hierarchy for accessibility.
                type: Number,
                default: 2,
                validator(value) {
                    return value >= 1 && value <= 6;
                },
            },
            href: {
                type: String,
            },
            label: {
                type: String,
            },
            metadata: {
                type: String,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large'],
            },
            supplementalContentFirst: {
                type: Boolean,
                default: false,
            },
            title: {
                type: String,
                required: true,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsCard.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsCard.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-card` : `${this.mdsPrefix}-card`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const fullBleedClass = this.fullBleed ? ` ${className}--full-bleed` : '';
        const fullBleedTopLabelOverlapClass = (this.fullBleed && this.supplementalContentFirst) ? ` ${className}--full-bleed-top-label-overlap` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const computedClassName = `${className}${additionalClasses}${fullBleedClass}${fullBleedTopLabelOverlapClass}${sizeClass}`;
        const href = this.href ? ` href="${this.href}"` : '';

        const hasSupplementalContent = this.hasNamedSlotContent('mds-card-supplemental-content');
        const hasActionContent = this.hasNamedSlotContent('mds-card-action');
        const renderAsLink = this.href && !hasActionContent;
        const rootElement = renderAsLink ? 'a' : 'div';

        const title = `<h${this.headingLevel} class="${className}__title"><slot>${this.title}</slot></h${this.headingLevel}>`;
        const caption = this.caption ? `<div class="${className}__caption">${this.caption}</div>` : '';
        const metadata = this.metadata ? `<div class="${className}__metadata">${this.metadata}</div>` : '';
        const label = this.label ?
            `
                <div class="${className}__label">
                    <div class="${className}__label-title">${this.label}</div>
                </div>
            ` : '';
        const supplementalContent = hasSupplementalContent ?
            `
                <div class="${className}__supplemental-content">
                    <slot name="mds-card-supplemental-content"></slot>
                </div>
            ` : '';
        const action = hasActionContent ?
            `
                <div class="${className}__action">
                    <slot name="mds-card-action"></slot>
                </div>
            ` : '';

        // Add role if card is a link
        if (renderAsLink) {
            this.setAttributeWithoutRendering('role', 'link');
        }

        return `
            <${rootElement}${href} class="${computedClassName}">
                ${label}
                ${this.supplementalContentFirst ?
                    `
                        ${supplementalContent}
                        ${title}
                        ${caption}
                    ` :
                    `
                        ${title}
                        ${caption}
                        ${supplementalContent}
                    `
                }
                ${action}
                ${metadata}
            </${rootElement}>
        `;
    }

    get slotPropOverrideMappings() {
        return {
            default: 'title',
        };
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const links = this.querySelectorAll('a');
        if (links.length) {
            this.bindLinks(links);
        }
    }

    bindLinks(links) {
        const linksArray = Array.from(links);
        linksArray.forEach((link) => {
            link.addEventListener('focus', (e) => { this.triggerEvent('focus', e); });
            link.addEventListener('blur', (e) => { this.triggerEvent('blur', e); });
        });
    }
}

MDSWCBase.defineCustomElement('mds-card', MdsCard);

export default MdsCard;
