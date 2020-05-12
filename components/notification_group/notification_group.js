import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsNotificationGroup extends MDSWCBase {
    /*
    *************************
    PROPS
    *************************
    */
    static get defaultProps() {
        // List all props as camelCased object keys in alphabetical order
        return {
            additionalClass: {
                type: String,
            },
            mastheadPadding: {
                type: String,
                values: ['below-masthead', 'masthead-tall'],
            },
            position: {
                type: String,
                default: 'top-center',
                values: ['bottom-right', 'top-center'],
            },
            width: {
                type: String,
                default: '500px',
                values: ['350px', '500px'],
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsNotificationGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes;
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsNotificationGroup.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-notification` : `${this.mdsPrefix}-notification`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const mastheadPaddingClass = this.mastheadPadding ? ` ${className}--${this.mastheadPadding}` : '';
        const positionClass = ` ${className}--${this.position}`;
        const widthClass = ` ${className}--width-${this.width}`;
        const computedClassName = `${className}${mastheadPaddingClass}${positionClass}${widthClass}${additionalClasses}`;

        return `
            <div class="${computedClassName}">
                <slot></slot>
            </div>
        `;
    }
}

MDSWCBase.defineCustomElement('mds-notification-group', MdsNotificationGroup);

export default MdsNotificationGroup;
