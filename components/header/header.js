import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../button/button.js';

class MdsHeader extends MDSWCBase {
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
            },
            border: {
                type: String,
                default: 'primary',
                values: ['primary', 'secondary', 'tertiary', 'none'],
            },
            borderPosition: {
                type: String,
                default: 'top',
                values: ['bottom', 'top'],
            },
            headingLevel: {
                type: Number,
                default: 2,
                validator(value) {
                    return value >= 1 && value <= 6;
                },
            },
            size: {
                type: String,
                default: 'level 5',
                values: ['level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'level 6', 'level 7', 'level 8', 'level 9'],
            },
            text: {
                type: String,
                required: true,
            },
            titleDescription: {
                type: Boolean,
                default: false,
            },
            titleDescriptionIcon: {
                type: String,
                default: 'question-circle',
            },
            titleHidden: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsHeader.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsHeader.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-header` : `${this.mdsPrefix}-header`;
        const className = this.prefixedClassName;
        const borderClass = this.border !== 'none' ? `${className}--${this.border}` : '';
        const borderPositionClass = this.borderPosition === 'bottom' ? `${className}--border-bottom` : '';
        const titleHiddenClass = this.titleHidden ? `${className}--title-hidden` : '';
        const additionalClasses = this.additionalClass ? `${this.additionalClass}` : '';
        const computedClassName = `${className} ${borderClass} ${className}--${this.size.replace(/\s+/g, '-')} ${borderPositionClass} ${titleHiddenClass} ${additionalClasses}`;

        // Accessibility
        const ariaLabel = this.ariaLabel ? `aria-label="${this.ariaLabel}"` : '';

        // If size is smaller than default level-5, automatically set the description icon size to small
        const descriptionIconSize = parseInt(this.size[this.size.length - 1], 10) > 5 ? 'size="small"' : '';
        const titleDescription = this.titleDescription ?
            `<div class="${className}__title-description">
                <mds-button ${descriptionIconSize} icon="${this.titleDescriptionIcon}" variation="icon-only"></mds-button>
            </div>` : '';

        const actionsContent = this.hasNamedSlotContent('mds-header-actions') ?
            `<div class="${className}__actions">
                <slot name="mds-header-actions">
                </slot>
            </div>` : '';

        return `
            <header class="${computedClassName}">
                <h${this.headingLevel} ${ariaLabel} class="${className}__title">
                <slot>${this.text}</slot>${titleDescription}
                </h${this.headingLevel}>
                ${actionsContent}
            </header>
        `;
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }
}

MDSWCBase.defineCustomElement('mds-header', MdsHeader);

export default MdsHeader;
