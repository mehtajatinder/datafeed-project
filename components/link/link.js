import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsLink extends MDSWCBase {
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
            download: {
                type: String,
            },
            href: {
                type: String,
                required: true,
            },
            inDataTable: {
                type: Boolean,
                default: false,
            },
            target: {
                type: String,
            },
            text: {
                type: String,
                required: true,
            },
            underline: {
                type: Boolean,
                default: true,
            },
            visitedStyling: {
                type: Boolean,
                default: true,
            },
        };
    }

    get slotPropOverrideMappings() {
        return {
            default: 'text',
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsLink.defaultProps).map(k => MDSWCBase.kebabCase(k));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsLink.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-link` : `${this.mdsPrefix}-link`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const inDataTable = this.inDataTable ? ` ${className}--data-table` : '';
        const noUnderline = this.underline ? '' : ` ${className}--no-underline`;
        const visitedStyling = this.visitedStyling ? '' : ` ${className}--no-visited`;
        const computedClassName = `${className}${additionalClasses}${inDataTable}${noUnderline}${visitedStyling}`;

        const target = this.target ? ` target="${this.target}"` : '';
        let download = '';

        // Accessibility
        const ariaLabel = this.ariaLabel ? ` aria-label="${this.ariaLabel}"` : '';

        // Set download filename unless value is simply `true`
        if (this.download) {
            download = this.download !== 'true' ? ` download="${this.download}"` : ' download';
        }

        return `
            <a href="${this.href}" class="${computedClassName}"${ariaLabel}${download}${target}>
                <slot>${this.text}</slot>
            </a>
        `;
    }
}

MDSWCBase.defineCustomElement('mds-link', MdsLink);

export default MdsLink;
