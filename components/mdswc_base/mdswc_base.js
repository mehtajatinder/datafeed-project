class MDSWCBase extends HTMLElement { // eslint-disable-line no-unused-vars
    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor(props) {
        super();
        this.initializeLogger();
        this.majorVersion = '2';
        this.mdsVersion = '2.31.0'; // used for coverage tracking
        this.mdsPrefix = 'mds'; // used in namespacing
        this.namespacePrefix = `mds-v${this.majorVersion}`; // used in namespacing
        this.baseProps = {
            namespaced: {
                type: Boolean,
                default: false,
            },
        };
        this.defaultProps = Object.assign(Object.assign({}, this.baseProps), props); // Store the default props so they can be referenced later for slot overrides
        this.configurePropGettersAndSetters(Object.assign(Object.assign({}, this.baseProps), props));
        this.renderDebounce = undefined; // An instance level variable that holds the debounce timeout for the render method
        this.componentConnected = false;
        this.renderTimeout = 1000; // How long a component has to render before the componentRendered Promise fails
        this.firstSlotRender = {};
        this.hasSlotContent = {};
        this.state = {};
        this.rendered = false;
        this.renderEnabled = true;
        this.hasSlots = undefined;
        this.attributeChangedCallbackEnabled = false;
    }

    configurePropGettersAndSetters(props) {
        Object.keys(props).forEach((p) => {
            const propData = props[p];
            const propAttributeName = MDSWCBase.kebabCase(p);
            const ariaPrefix = 'aria';

            // Default getter and setter
            let getter = () => {
                const attributeValue = this.getAttribute(propAttributeName);
                if (attributeValue !== null && attributeValue.length > 0) {
                    if (this.validateProp(p, attributeValue)) {
                        this.state[p] = attributeValue;
                        if (propData.type === String && propAttributeName.substring(0, 4) === ariaPrefix) {
                            this.removeAttributeWithoutRendering(propAttributeName);
                        }
                    }
                }

                return this.state[p];
            };

            let setter = (newValue) => {
                if (this.validateProp(p, newValue)) {
                    this.state[p] = newValue;
                    if (propData.type === String && p.substring(0, 4) === ariaPrefix) {
                        this.removeAttributeWithoutRendering(propAttributeName);
                    } else {
                        this.setAttributeWithoutRendering(propAttributeName, newValue);
                    }
                    this.render();
                }
            };

            // getter and setter for boolean values
            if (propData.type === Boolean) {
                getter = () => {
                    if (this.hasAttribute(propAttributeName)) {
                        let attrValue = this.getAttribute(propAttributeName);
                        if (attrValue === false || attrValue === null || (typeof attrValue === 'string' && attrValue.toLowerCase() === 'false')) {
                            attrValue = false;
                        } else {
                            attrValue = true;
                        }

                        this.state[p] = attrValue;
                    }
                    return this.state[p];
                };

                setter = (newValue) => {
                    if (newValue === false || newValue === null || (typeof newValue === 'string' && newValue.toLowerCase() === 'false')) {
                        newValue = false;
                    } else {
                        // If it's anything other than false, it's true
                        newValue = true;
                    }

                    this.state[p] = newValue;
                    this.setAttributeWithoutRendering(propAttributeName, newValue);
                    this.render();
                };
            }

            // getter and setter for number values
            if (propData.type === Number) {
                getter = () => {
                    // If a valid number is passed in, cast it as a number, otherwise just pass whatever the value is and let prop validation catch it
                    if (this.hasAttribute(propAttributeName)) {
                        const value = this.getAttribute(propAttributeName);
                        const valueAsNumber = Number.isNaN(Number(value)) ? value : Number(value);
                        if (this.validateProp(p, valueAsNumber)) {
                            this.state[p] = valueAsNumber;
                        }
                    }
                    return this.state[p];
                };

                setter = (newValue) => {
                    const valueAsNumber = Number.isNaN(Number(newValue)) ? newValue : Number(newValue);
                    if (this.validateProp(p, valueAsNumber)) {
                        this.state[p] = valueAsNumber;
                        this.setAttributeWithoutRendering(propAttributeName, newValue);
                        this.render();
                    }
                };
            }

            // getter and setter for array or object values
            if (propData.type === Array || propData.type === Object) {
                getter = () => {
                    if (this.hasAttribute(propAttributeName)) {
                        let attribute = this.getAttribute(propAttributeName);
                        try {
                            attribute = JSON.parse(attribute);
                        } catch (e) {
                            this.logger.error(this.componentId, `Getter JSON Parsing error for ${propAttributeName}`); // TODO: Do we need to trigger a warning here?
                        }
                        if (this.validateProp(p, attribute)) {
                            this.state[p] = attribute;
                        }
                    }
                    return this.state[p];
                };

                setter = (newValue) => {
                    let parsedValue = newValue;
                    if (typeof newValue === 'string') {
                        try {
                            parsedValue = JSON.parse(newValue);
                        } catch (e) {
                            this.logger.error(this.componentId, `Setter JSON Parsing error for ${newValue}`);
                        }
                    }
                    if (this.validateProp(p, parsedValue)) {
                        this.state[p] = parsedValue;
                        this.setAttributeWithoutRendering(propAttributeName, JSON.stringify(newValue));
                        this.render();
                    }
                };
            }

            Object.defineProperty(this, p, {
                get: getter,
                set: setter,
            });
        });
    }

    setPropWithoutRendering(p, newValue) {
        this.renderEnabled = false;
        this[p] = newValue; // Calls the predefined setter with all validation rules applied but does nothing when that setter calls this.render();
        this.renderEnabled = true;
    }

    /*
    *************************
    CONNECTED CALLBACK
    *************************
    */
    connectedCallback() {
        this.mwcId = this.mwcId || this.getAttribute('mwc-id');
        this.setInitialComponentState(); // Reconcile the HTML attributes, default config, and any existing MWC config for the component
        this.componentId = this.mwcId || 'unknown';
        // this.logger.debug(this.componentId, 'CONNECTED CALLBACK');
        if (this.hasSlots === undefined) {
            this.hasSlots = this.template.search('<slot') !== -1;
        }

        // Be sure this only runs once per component object. Because detatching and reattaching components triggers this callback over and over, we only want it to run once
        if (!this.componentConnected) {
            this.firstConnectedCallback();
            this.setDefaultSlotContentPresence();
            this.setAttribute('mds-version', this.mdsVersion);
            this.validateAllProps(this.defaultProps); // Validate all props on initial load
            this.render(); // If there are no default values for a component, this render() call will make sure the component is rendered anyway
        }
    }

    firstConnectedCallback() {
        // Run once when the component is first injected into the DOM
        this.preRenderContent = document.createElement('div');
        MDSWCBase.moveChildNodes(this, this.preRenderContent);
        this.componentConnected = true;
    }

    setInitialComponentState() {
        // Set initial this.state based on attributes, prop setting and defaults
        const initialPropValues = this.initialPropValues();
        const settings = Object.assign(Object.assign({}, initialPropValues.defaults.settings), initialPropValues.instance.settings);
        this._config = this._config || {};
        this._config.settings = settings;

        this.state = this._config.settings;
    }

    initialPropValues() {
        const defaultConfig = {
            settings: {},
        };

        const instanceConfig = {
            settings: {},
        };
        // Loop over all the props in the class's prop definition
        Object.keys(this.defaultProps).forEach((p) => {
            const instanceValue = this[p];
            // If the prop definition specifies a default value, add it to the defaultConfig object
            const propData = this.defaultProps[p];
            if (propData.default !== undefined) {
                // Generate MWC config.settings defaults
                defaultConfig.settings[p] = propData.default;
            }

            // If prop is required and is of a String type, return an empty string rather than `undefined`
            if (propData.required && propData.type === String) {
                instanceConfig.settings[p] = '';
            }

            // Use prop getters to check for values set via HTML attributes, like "size" in this case: <mds-input size="large"></mds-input>
            if (instanceValue !== null && instanceValue !== '' && typeof instanceValue !== 'undefined') {
                // If the prop has been explicitly set, set that prop on the instanceConfig
                instanceConfig.settings[p] = instanceValue;
            }
        });

        return {
            defaults: defaultConfig,
            instance: instanceConfig,
        };
    }

    initializeLogger() {
        this.logger = console;
    }

    validateAllProps() {
        const slotMappings = this.slotPropOverrideMappings;
        Object.keys(this.defaultProps).forEach((p) => {
            let hasContent = false;
            if (slotMappings !== undefined) {
                // Check for any slots
                Object.keys(slotMappings).forEach((slotName) => {
                    // Check if slot has value
                    hasContent = this.hasNamedSlotContent(slotMappings[slotName]) || this.hasDefaultSlotContent();
                });
            }
            this.validateProp(p, this.state[p], hasContent);
        });
    }

    validateProp(propName, currentValue, hasSlot) {
        const rules = this.defaultProps[propName];
        let valid = true;
        // Required validation
        // On pre render prop validation don't throw warning if it has a slot
        if (rules.required && !currentValue && !hasSlot) {
            this.logger.warn(`${this.tagName}: ${this.componentId}`, `Prop validation warning: No value passed for required prop: '${propName}'. You must provide a value for '${propName}'`);
            valid = false;
        }

        // Type validation (only if value exists)
        if (currentValue) {
            if (!this.validatePropType(propName, currentValue, rules.type.name.toLowerCase())) {
                valid = false;
            }

            // Enum validation
            if (rules.values && rules.values.indexOf(currentValue) === -1) {
                let quote = '';
                if (rules.type.name.toLowerCase() === 'string') {
                    quote = "'";
                }
                this.logger.warn(`${this.tagName}: ${this.componentId}`, `Prop validation warning: '${propName}' must be one of: ${quote}${rules.values.join(`${quote}, ${quote}`)}${quote} - value is: ${quote}${currentValue}${quote}`);
                valid = false;
            }

            // Custom validation
            if (rules.validator && typeof rules.validator === 'function') {
                const validationResult = rules.validator(currentValue, this);
                if (typeof validationResult === 'boolean' && validationResult === false) {
                    this.logger.warn(`${this.tagName}: ${this.componentId}`, `Prop validation warning: '${propName}' did not pass the custom validator function associated with it`);
                    valid = validationResult;
                }
            }
        }

        return valid;
    }

    validatePropType(propName, propValue, expectedPropType) {
        // validate only when the prop is defined
        const actualPropType = MDSWCBase.identifyPropType(propValue);
        if (actualPropType === expectedPropType) {
            return true;
        }

        // If the prop is provided, but is of the wrong data type, trigger an error
        this.triggerPropTypeErrorMessage(propName, propValue, expectedPropType, actualPropType);
        return false;
    }

    triggerPropTypeErrorMessage(propName, propValue, expectedPropType, actualPropType) {
        const expectedPropTypeErrorMessageArticle = MDSWCBase.propTypeErrorMessageArticles[expectedPropType];
        const actualPropTypeErrorMessageArticle = MDSWCBase.propTypeErrorMessageArticles[actualPropType];
        this.logger.warn(this.componentId, `Prop validation warning: '${propName}' is not ${expectedPropTypeErrorMessageArticle} ${expectedPropType}, it's ${actualPropTypeErrorMessageArticle} ${actualPropType}. The value is: ${propValue}`);
    }

    /*
    *************************
    ATTRIBUTE CHANGED CALLBACK
    *************************
    */
    attributeChangedCallback(attributeName, oldValue, newValue) {
        // Run EACH time an attribute is changed, if multiple attributes are changed simultaneously, like when connectedCallback runs
        // This method is called for each individual attribute. For a component that has 20 default attributes, this method will be
        // called 20 times. To combat the DOM thrashing that would occur if render() was called every time, the render method is
        // debounced via setTimeout()
        if (this.attributeChangedCallbackEnabled) {
            this.logger.debug(this.componentId, 'ATTRIBUTE CHANGED CALLBACK');
            switch (attributeName) {
                default: {
                    const propName = MDSWCBase.camelCase(attributeName);
                    this[propName] = newValue;
                }
                break;
            }
        }
    }

    removeAttributeWithoutRendering(attributeName) {
        this.attributeChangedCallbackEnabled = false;
        this.removeAttribute(attributeName);
        this.attributeChangedCallbackEnabled = true;
    }

    setAttributeWithoutRendering(attributeName, value) {
        this.attributeChangedCallbackEnabled = false;
        if (value === 'undefined' || value === undefined) {
            this.removeAttributeWithoutRendering(attributeName);
        } else {
            this.setAttribute(attributeName, value);
        }
        this.attributeChangedCallbackEnabled = true;
    }

    /*
    *************************
    RENDER
    *************************
    */
    render() {
        if (this.componentConnected && this.renderEnabled) {
            this.renderTemplate();
        }
    }

    renderTemplate() {
        this.rendered = false;

        // Some light debouncing handled via setTimeout
        if (this.renderDebounce) {
            clearTimeout(this.renderDebounce);
        }

        this.renderDebounce = setTimeout(() => {
            if (this.hasSlots) {
                this.renderTemplateWithSlots();
            } else {
                this.innerHTML = this.template;
            }
            this.rendered = true;

            this.bindEventHandlers(); // Rebind event handlers after each rendering
        }, 10);
    }

    componentRendered() {
        return new Promise((resolve, reject) => {
            if (this.rendered) {
                resolve();
            } else {
                setTimeout(() => {
                    if (this.rendered) {
                        resolve();
                    } else {
                        reject(new Error(`${this.componentId} failed to render within ${this.renderTimeout}`));
                    }
                }, this.renderTimeout);
            }
        });
    }

    renderTemplateWithSlots() {
        // Create a fresh copy of the component's template using whatever current prop/attribute values exist
        const renderedTemplate = document.createElement('div');
        renderedTemplate.innerHTML = this.template; // Get the template defined on the child class

        // Search the template for the existence of a <slot> element with no [name] attribute
        const defaultSlot = renderedTemplate.querySelector('slot:not([name])');
        const {
            defaultSlotContent
        } = this; // Find the child nodes that should fill the default <slot></slot> in the template
        // Default slot replacement
        // If content is passed in as a child of the custom element tags it will replace a defined default slot in the template.
        // Check the slot prop mappings for any props that should override the default slot
        // If only a single prop is passed in, convert it to an array of one string
        // Get the default value for each prop, since a slot's content SHOULD override default prop values
        // If any of the overrideProps has a value set, and that value is NOT the default value for the component, use the prop value instead of the slot content
        let useSlotContent = true;
        if (defaultSlot && defaultSlotContent) {
            if (this.slotPropOverrideMappings && this.slotPropOverrideMappings.default) {
                const overrideProps = Array.isArray(this.slotPropOverrideMappings.default) ? this.slotPropOverrideMappings.default : [this.slotPropOverrideMappings.default];

                overrideProps.forEach((p) => {
                    const defaultValue = this.defaultProps[p] && this.defaultProps[p].default ? this.defaultProps[p].default : false;
                    // A value exists for this prop and there is no default value OR
                    // A value exists for this prop and it's not equal to the default value
                    if ((typeof this[p] !== 'undefined' && this[p] !== '' && !defaultValue) || (typeof this[p] !== 'undefined' && this[p] !== '' && defaultValue && this[p] !== defaultValue)) {
                        useSlotContent = false;
                    }
                });
            }

            // If there are no prop values set that should override this slot content, then use the slot content
            if (useSlotContent && !this.firstSlotRender.default) {
                this.firstSlotRender.default = true;
            }

            if (useSlotContent) {
                // Remove any existing default content from the default <slot> in the template
                defaultSlot.innerHTML = '';

                MDSWCBase.moveChildNodes(defaultSlotContent, defaultSlot);
            }
        }

        if (defaultSlot && defaultSlotContent === false && !this.firstSlotRender.default) {
            this.firstSlotRender.default = true;
        }

        // Search the template for the existence of a <slot> elements with [name] attributes
        let namedSlots = Array.from(renderedTemplate.querySelectorAll('slot[name]')).filter((node) => {
            // When finding named slots within the template, exclude nested <slot> elements since that signifies a separate MDSWC component's slot and not this one.
            // A single component will never have nested <slot>'s in its template

            // To do this, get all the parent nodes of a named slot and ensure there's not another <slot> somewhere in that node's ancestry
            const parentNodes = [];
            node = node.parentNode;
            while (node) {
                parentNodes.unshift(node);
                node = node.parentNode;
            }
            return parentNodes.find(pn => pn.tagName === 'SLOT') === undefined; // Only return named slots that have NO other <slot> in their ancestry
        });
        const namedSlotNames = Array.from(namedSlots).map(n => n.getAttribute('name'));

        namedSlotNames.forEach((slotName) => {
            const slotNameCamelCase = MDSWCBase.camelCase(slotName);
            let slotContent = false;
            let overrideProps = [slotNameCamelCase]; // By default a prop with the same name as the slot's name should override the slot behavior
            useSlotContent = true;

            // Are there any props that should prevent slot content from rendering?
            if (this.slotPropOverrideMappings && this.slotPropOverrideMappings[slotNameCamelCase]) {
                // If there are multiple props that can override this names slot, add all of them
                if (Array.isArray(this.slotPropOverrideMappings[slotNameCamelCase])) {
                    overrideProps = overrideProps.concat(this.slotPropOverrideMappings[slotNameCamelCase]); // merge the passed in prop overrides with the existing overrides array
                } else {
                    // If only a single prop is provided as an override simply push it onto the existing overrideProps array
                    overrideProps.push(this.slotPropOverrideMappings[slotNameCamelCase]);
                }
            }

            overrideProps.forEach((p) => {
                const defaultValue = this.defaultProps[p] ? this.defaultProps[p].default : undefined;
                if (typeof this[p] !== 'undefined' && this[p] !== null && this[p] !== defaultValue) {
                    useSlotContent = false;
                }
            });

            if (useSlotContent) {
                if (!this.firstSlotRender[slotName]) {
                    // First time the component is being rendered, find an element with an attribute of slot='${name}'
                    slotContent = this.preRenderContent.querySelector(`[slot="${slotName}"]`);

                    if (slotContent) {
                        // Remove the slot= attribute from the content that's going to be placed in the slot
                        slotContent.removeAttribute('slot');
                    }
                    this.firstSlotRender[slotName] = true;
                } else {
                    // The component has already been rendered, the <slot> exists in the DOM at this point, grab the content from there.
                    slotContent = this.querySelector(`slot[name="${slotName}"]`).firstChild;
                }

                if (slotContent) {
                    // querySelectorAll searches the entire renderedTemplate for slots with this name, since a component may be nested
                    namedSlots = renderedTemplate.querySelectorAll(`slot[name="${slotName}"]`);
                    // From all the matching named slots, get the last one in the NodeSet since that will be the highest ancestor slot in the tree
                    const namedSlot = namedSlots[namedSlots.length - 1];

                    // Remove any existing default content from the <slot> in the template
                    namedSlot.innerHTML = '';

                    namedSlot.appendChild(slotContent);
                }
            }
        });

        // Remove all children from the currently rendered custom element
        this.innerHTML = '';

        MDSWCBase.moveChildNodes(renderedTemplate, this);
    }

    bindEventHandlers() {
        // Empty parent method in case a child doesn't implement
    }

    triggerEvent(eventName, detail = {}, cancelable = true, bubbles = true) {
        if (typeof window.CustomEvent !== 'function') {
            // eslint-disable-next-line no-inner-declarations
            function CustomEvent(event, params) {
                const evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, true, params.detail);
                return evt;
            }

            window.CustomEvent = CustomEvent;
        }


        const event = new CustomEvent(eventName, {
            bubbles,
            cancelable,
            detail
        });
        this.dispatchEvent(event);
    }

    setDefaultSlotContentPresence() {
        Array.from(this.preRenderContent.childNodes).forEach((n) => {
            if (typeof n.hasAttribute === 'undefined' || !n.hasAttribute('slot')) {
                if (n.textContent.trim().length > 0) {
                    this.hasSlotContent.default = true;
                }
            }
        });

        const namedSlotContent = this.preRenderContent.querySelectorAll('[slot]');
        if (namedSlotContent && namedSlotContent.length > 0) {
            Array.from(namedSlotContent).forEach((s) => {
                this.hasSlotContent[s.getAttribute('slot')] = true;
            });
        }
    }

    hasNamedSlotContent(slotName) {
        return this.hasSlotContent[slotName] === true;
    }

    hasDefaultSlotContent() {
        return this.hasSlotContent.default === true;
    }

    /*
    *************************
    GETTERS
    *************************
    */
    get defaultSlotContent() {
        const existingSlotContent = this.querySelector('slot:not([name])');

        let defaultSlotContent = false;

        if (!this.firstSlotRender.default && this.preRenderContent && this.preRenderContent.childNodes.length > 0) {
            Array.from(this.preRenderContent.childNodes).forEach((n) => {
                if (typeof n.hasAttribute === 'undefined' || !n.hasAttribute('slot')) {
                    if (!defaultSlotContent) {
                        defaultSlotContent = document.createElement('div');
                    }
                    defaultSlotContent.appendChild(n); // If the default content is not named slot content add it to the default slot content, otherwise leave it to be mapped to a named slot
                }
            });
        } else if (existingSlotContent && existingSlotContent.childNodes.length > 0) {
            defaultSlotContent = existingSlotContent;
        }

        return defaultSlotContent;
    }

    /*
    *************************
    // STATIC METHODS
    *************************
    */
    static moveChildNodes(oldParent, newParent) {
        while (oldParent.childNodes.length > 0) {
            newParent.appendChild(oldParent.childNodes[0]);
        }
    }

    /*  This method returns the data type of the prop
        passed to it. The data type will be one of:
        `String`, `Boolean`, `Array`, or `Object`.
    */
    static identifyPropType(prop) {
        let propType = typeof prop;
        if (propType === 'object') {
            // make sure this 'object' isn't actually something else
            propType = Array.isArray(prop) ? 'array' : propType; // set propType to array if it is an array
        }

        return propType;
    }

    /*  This method generates a random number between
        0 and `max`. This number can be used to build
        unique default `id`'s for HTML templates.
    */
    static generateRandomNumber(max = 1000000000000000) {
        return Math.floor(Math.random() * Math.floor(max));
    }


    /*  Takes a kebab-cased string like `lightsaber-color`
        and converts it to a camelCased string like `lightsaberColor`.
        Used to convert kebab-cased HTML attributes into camelCased
        JavaScript properties.
    */
    static camelCase(string) {
        return string.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
    }


    /*  Converts a camelCased string like `jediMaster` and
        converts it to a kebab-cased string like `jedi-master`.
        Used to convert camelCased JavaScript properties into
        kebab-cased HTML attributes.
    */
    static kebabCase(string) {
        return string.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`);
    }


    /*  Returns an object containing prop type to grammatical
        articles for more grammatically correct error messages.
        For example `that prop is an array` vs. `that prop is
        a array`.
    */
    static get propTypeErrorMessageArticles() {
        return {
            string: 'a',
            number: 'a',
            boolean: 'a',
            array: 'an',
            object: 'an',
        };
    }

    // Define and register component
    static defineCustomElement(tag, element) {
        if (!customElements.get(tag)) {
            customElements.define(tag, element);
        }
    }

    static triggerNativeEvent(element, eventName, bubbles = true) {
        const event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, bubbles, true);
        element.dispatchEvent(event);
    }
}

export default MDSWCBase;
