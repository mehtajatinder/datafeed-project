import MDSWCBase from '../mdswc_base/mdswc_base.js';
import '../button/button.js';
import '../icon/icon.js';

class MdsButtonGroup extends MDSWCBase {
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
      fullWidth: {
        type: Boolean,
        default: false,
      },
    };
  }

  static get observedAttributes() {
    const attributes = Object.keys(MdsButtonGroup.defaultProps).map(p => MDSWCBase.kebabCase(p));
    return attributes;
  }

  /*
  *************************
  CONSTRUCTOR
  *************************
  */
  constructor() {
    super(MdsButtonGroup.defaultProps);
  }

  /*
  *************************
  TEMPLATE
  *************************
  */
  get template() {
    this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-button-group` : `${this.mdsPrefix}-button-group`;
    const className = this.prefixedClassName;
    const fullWidthClass = this.fullWidth ? ` ${className}--justify` : '';
    const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
    const computedClassName = `${className}${fullWidthClass}${additionalClasses}`;

    return `
      <div class="${computedClassName}">
        <slot></slot>
      </div>
    `;
  }

  /*
  *************************
  EVENTS
  *************************
  */
  bindEventHandlers() {
    const buttons = this.querySelectorAll('mds-button');

    if (buttons.length > 0) {
      if (buttons[0].type !== 'radio') {
        return;
      }
      const buttonsArr = Array.from(buttons);
      buttonsArr.forEach((button) => {
        button.addEventListener('change', () => {
          const siblings = button.parentNode.children;
          const siblingsArr = Array.from(siblings);
          siblingsArr.forEach((sibButton) => {
            if (sibButton === button) {
              return;
            }
            sibButton.checked = false;
          });
        });
      });
    }
  }
}

MDSWCBase.defineCustomElement('mds-button-group', MdsButtonGroup);

export default MdsButtonGroup;
