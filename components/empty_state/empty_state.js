import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsEmptyState extends MDSWCBase {
    /*
    *************************
    STATIC METHODS (defaultProps and observedAttributes required, slotPropOverrideMappings optional)
    See the Props section of https://tinyurl.com/mdswc-coding-guidelines for naming conventions and other details
    *************************
    */
    static get defaultProps() {
        // List all props as camelCased object keys in alphabetical order
        return {
            additionalClass: {
                type: String, // type is required for all props
            },
            list: {
                type: Array,
            },
            message: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                default: 'medium',
                values: ['small', 'medium', 'large'],
            },
            title: {
                type: String,
                required: true,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsEmptyState.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes; // Observe all attributes by default
    }

    /*
    *************************
     CONSTRUCTOR (required)
    *************************
    */
    constructor() {
        super(MdsEmptyState.defaultProps);
    }

    /*
    *************************
    GETTERS (template required)
    See the Slots section of: https://tinyurl.com/mdswc-coding-guidelines for template slot examples and other details
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-empty-state` : `${this.mdsPrefix}-empty-state`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const computedClassName = `${className}${additionalClasses}${sizeClass}`;
        const title = `<div class="${className}__title"><slot>${this.title}</slot></div>`;
        const message = `<div class="${className}__message">${this.message}</div>`;

        const hasIconContent = this.hasNamedSlotContent('mds-empty-state-icon');
        const hasActionsContent = this.hasNamedSlotContent('mds-empty-state-actions');

        const icon = hasIconContent ?
            `
            <div class="${className}__icon">
                <slot name="mds-empty-state-icon"></slot>
            </div>
        ` : '';

        const actions = hasActionsContent ?
            `
            <div class="${className}__actions">
                <slot name="mds-empty-state-actions"></slot>
            </div>
        ` : '';

        return `
            <div class="${computedClassName}">
                ${icon}
                ${title}
                ${message}
                ${this.list && this.list.length ?
                    `
                        <ul class="${className}__list">
                            ${this.list.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    ` : ''
                }
                ${actions}
            </div>
        `;
    }

    // If your component uses a slots, specify which property or properties will prevent slots from being rendered
    get slotPropOverrideMappings() {
        return {
            default: 'title',
        };
    }
}
MDSWCBase.defineCustomElement('mds-empty-state', MdsEmptyState);

export default MdsEmptyState;
