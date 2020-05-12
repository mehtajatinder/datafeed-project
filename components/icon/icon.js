import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsIcon extends MDSWCBase {
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
            name: {
                type: String,
                required: true,
            },
            title: {
                type: String,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsIcon.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes; // Observe all attributes by default
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsIcon.defaultProps);
    }

    /*
    *************************
    TEMPLATE
    *************************
    */
    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-icon` : `${this.mdsPrefix}-icon`;
        let template = '';

        if (this.name) {
            const ariaHidden = !this.title ? 'aria-hidden="true"' : '';
            const className = this.prefixedClassName;
            const additionalClasses = this.additionalClass ? `${this.additionalClass}` : '';
            const title = this.title ? `<title>${this.title}</title>` : '';
            const sizeClass = this.name.includes('--s') ? `${className}--s` : '';
            const computedClassName = `${className} ${sizeClass} ${additionalClasses}`.trim();


        template = `
            <svg class="${computedClassName}" ${ariaHidden}>
                <use xlink:href="#${this.name}" href="#${this.name}">${title}</use>
            </svg>
            `;
        }

        return template;
    }

    render() {
        super.render();
        if (!document.querySelector('#mds-svg-icons')) {
            // eslint-disable-next-line no-console
            this.logger.warn('The MDS Icon SVG file must be loaded on the page in order to display icons properly. Documentation on how to load the SVG file can be found at http://designsystem.morningstar.com/getting-started/for-engineers.html?tab=page_setup#svg-icon-sprite.');
        }
    }
}

MDSWCBase.defineCustomElement('mds-icon', MdsIcon);

export default MdsIcon;
