import MDSWCBase from '../mdswc_base/mdswc_base.js';

class MdsStepper extends MDSWCBase {
    /*
    *************************
    PROPS
    *************************
    */
    static get defaultProps() {
        return {
            activeSmallStep: {
                type: String,
            },
            activeStep: {
                type: String,
            },
            additionalClass: {
                type: String,
            },
            animation: {
                type: Boolean,
                default: true,
            },
            interactiveSmallSteps: {
                type: Boolean,
                default: true,
            },
            lightLabels: {
                type: Boolean,
                default: false,
            },
            size: {
                type: String,
                default: 'large',
                value: ['small', 'medium', 'large'],
            },
            smallStepIndicators: {
                type: Boolean,
                default: true,
            },
            steps: {
                type: Array,
                required: true,
                validator: (stepsArray) => {
                    const isArrayOfStrings = stepsArray.every(i => typeof i === 'string');

                    // if there are no small steps validate and return
                    if (isArrayOfStrings) {
                        return [...new Set(stepsArray)].length === stepsArray.length;
                    }

                    // if there are small steps, validate that the last step contains no small steps
                    if (typeof stepsArray[stepsArray.length - 1] !== 'string') {
                        return false;
                    }

                    // if there are small steps, filter into 2 arrays and validate both steps and small steps
                    const filtered = stepsArray.reduce((res, step) => {
                        if (typeof step === 'object') {
                            res.steps.push(step.label);
                            res.smallSteps.push(step.smallSteps);
                        } else {
                            res.steps.push(step);
                        }
                        return res;
                    }, {
                            steps: [],
                            smallSteps: [],
                        });

                    // check if step array is unique and if every small step array is unique
                    return [...new Set(filtered.steps)].length === filtered.steps.length &&
                        filtered.smallSteps.every(i => [...new Set(i)].length === i.length);
                },
            },
            wide: {
                type: Boolean,
                default: false,
            },
        };
    }

    static get observedAttributes() {
        const attributes = Object.keys(MdsStepper.defaultProps).map(p => MDSWCBase.kebabCase(p));
        return attributes; // Observe all attributes by default
    }

    /*
    *************************
    CONSTRUCTOR
    *************************
    */
    constructor() {
        super(MdsStepper.defaultProps);
        this.firstRender = true;
        this.smallActive = false;
    }

    get template() {
        this.prefixedClassName = this.namespaced ? `${this.namespacePrefix}-stepper` : `${this.mdsPrefix}-stepper`;
        const className = this.prefixedClassName;
        const additionalClasses = this.additionalClass ? ` ${this.additionalClass}` : '';
        const sizeClass = ` ${className}--${this.size}`;
        const wide = this.wide ? ` ${className}--wide` : '';
        const smallStepIndicators = this.smallStepIndicators ? '' : ` ${className}--no-small-step-indicators`;
        const lightLabels = this.lightLabels ? ` ${className}--light-labels` : '';
        const computedClassName = `${className}${additionalClasses}${sizeClass}${wide}${smallStepIndicators}${lightLabels}`;
        // eslint-disable-next-line no-use-before-define
        const stepsTmp = this.steps ? stepsTemplate`<ul class="${className}__list">${this.steps}</ul>${this}` : '';
        const activeStepLabel = this.activeStep;

        // Small step tagged literal, values is an array of all ${data} passed to the tag
        function smallStepTemplate(strings, ...values) {
            const step = values[1];
            const classContext = values[2];
            let partial = '';
            const { smallSteps } = step;

            for (let i = 0; i < smallSteps.length; i += 1) {
                const status = classContext.getStepStatus(step, smallSteps[i]);
                classContext.smallActive = status === 'active';
                const statusClass = MdsStepper.getStatusClass(status, className);
                const smallStepLabel = `<span class="${className}__step-label">${smallSteps[i]}</span>`;

                // Accessibility
                const ariaCurrent = (status === 'active') ? `aria-current="${smallSteps[i]}"` : '';

                let stepIndicatorTemplate = `<span class="${className}__step-indicator" tabindex="-1" ${ariaCurrent}>${smallStepLabel}</span>`;

                // Interactive step
                if (classContext.interactiveSmallSteps) {
                    stepIndicatorTemplate = `<a href="#${(`${smallSteps[i]}`).replace(/\s+/g, '-').toLowerCase()}" title="${smallSteps[i]}" class="${className}__step-indicator" tabindex="-1" ${ariaCurrent}>${smallStepLabel}</a>`;
                }

                partial += `
                    <div class="${className}__step ${className}__step--small-step ${statusClass}" data-status="${status}">
                        ${stepIndicatorTemplate}
                        <span class="${className}__step-progress-track ${className}__step-progress-track--small-step-left"></span>
                        <span class="${className}__step-progress-track ${className}__step-progress-track--small-step-right"></span>
                    </div>
                `;
            }

            return `${strings[0]}${values[0]}${strings[1]}${partial}${strings[2]}`;
        }
        // Step tagged literal, values is an array of all ${data} passed to the tag
        function stepTemplate(strings, ...values) {
            const step = values[1];
            const classContext = values[2];
            const hasSmallSteps = typeof step !== 'string';
            const smallStepTmp = hasSmallSteps ? smallStepTemplate`<div class="${className}__small-steps">${step}</div>${classContext}` : '';
            const stepLabel = step.label || step;
            const status = classContext.getStepStatus(stepLabel);
            const statusClass = MdsStepper.getStatusClass(status, className);

            // Accessibility
            const ariaCurrent = (status === 'active') ? `aria-current="${stepLabel}"` : '';

            const partial = `
                <div class="${className}__step ${hasSmallSteps ? `${className}__step--has-small-step` : ''} ${statusClass}" data-status="${status}">
                    <a href="#${stepLabel.replace(/\s+/g, '-').toLowerCase()}" title="${stepLabel}" class="${className}__step-indicator" ${ariaCurrent}>
                        <svg class="${className}__step-complete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-0.044 0.062 9.211 8.841">
                            <path fill="none" stroke="#FFF" stroke-width="2" d="M.643 4.653L3.535 7.39 8.355.642" />
                        </svg>
                        <span class="${className}__step-label">${stepLabel}</span>
                    </a>
                    ${hasSmallSteps ? smallStepTmp : `<span class="${className}__step-progress-track ${className}__step-progress-track--large-step"></span>`}
                </div>
                <a href="#${stepLabel.replace(/\s+/g, '-').toLowerCase()}" class="${className}__list-item-label" tabindex="-1">${stepLabel}</a>
            `;

            return `${strings[0]}${values[0]}${strings[1]}${partial}${strings[2]}`;
        }

        // Steps tagged literal, values is an array of all ${data} passed to the tag
        function stepsTemplate(strings, ...values) {
            const stepsArray = values[1];
            const classContext = values[2];
            let partial = '';
            partial = `${stepsArray.map(step => stepTemplate`<li class="${className}__list-item">${step}</li>${classContext}`).join('\n      ')}`;
            return `${strings[0]}${values[0]}${strings[1]}${partial}${strings[2]}`;
        }

        return `
            <div class="${computedClassName}">
                <div class="${className}__active-step-summary">
                    <span class="${className}__active-step-label">${activeStepLabel}</span>
                </div>
                ${stepsTmp}
            </div>
        `;
    }

    /*
    *************************
    METHODS
    *************************
    */
    getStepStatus(step, smallStep) {
        const stepsOnly = this.steps.map(s => ((typeof s === 'string') ? s : s.label));

        const stepLabel = step.label || step;
        const stepStatus = MdsStepper.getStatus(this.activeStep, stepLabel, stepsOnly);

        if (smallStep) {
            if (stepStatus === 'next') {
                return 'incomplete';
            }
            if (stepStatus === 'active') {
                if (this.activeSmallStep === undefined) {
                    return 'next';
                }
                return MdsStepper.getStatus(this.activeSmallStep, smallStep, step.smallSteps);
            } else if (stepStatus === 'previous') {
                if (this.activeSmallStep === undefined && step.smallSteps.indexOf(smallStep) === step.smallSteps.length - 1) {
                    return 'previous';
                }
                return 'complete';
            }
        }

        return stepStatus;
    }

    static getStatusClass(status, className) {
        const classNames = {
            complete: `${className}__step--complete`,
            active: `${className}__step--active`,
            incomplete: '',
            previous: `${className}__step--complete`,
            next: '',
        };

        return classNames[status];
    }

    static getStatus(activeStep, step, steps) {
        if (activeStep === step) {
            return 'active';
        }

        if (steps.indexOf(activeStep) - steps.indexOf(step) === 1) {
            return 'previous';
        }

        if (steps.indexOf(step) - steps.indexOf(activeStep) === 1) {
            return 'next';
        }

        if (steps.indexOf(step) < steps.indexOf(activeStep)) {
            return 'complete';
        }

        return 'incomplete';
    }

    static getStepIndex(step, steps) {
        const stepsOnly = steps.map(s => ((typeof s === 'string') ? s : s.label));
        return stepsOnly.indexOf(step);
    }

    activatePreviousStep() {
        this.direction = 'previous';
        const activeStepIndex = MdsStepper.getStepIndex(this.activeStep, this.steps);
        const activeStep = this.steps[activeStepIndex];
        const activeHasSmallSteps = typeof activeStep !== 'string';

        const prevStepIndex = activeStepIndex - 1;
        const prevStep = this.steps[prevStepIndex];
        const prevHasSmallSteps = typeof prevStep !== 'string';

        // if there is no previous step do nothing
        if (!prevStep && this.activeSmallStep === undefined) { return; }

        // if both previous and current steps are large steps, activate the previous step
        if ((!activeHasSmallSteps || this.activeSmallStep === undefined) && !prevHasSmallSteps) {
            this.animateStep();
            this.activateStep(prevStep.label || prevStep);
            return;
        }

        // if current step is large step and previous has small steps, activate the last small step of previous step
        if ((!activeHasSmallSteps || this.activeSmallStep === undefined) && prevHasSmallSteps) {
            this.animateStep({ previous: `${this.prefixedClassName}__step--small-step` }, true);
            this.activateStep(prevStep.label, prevStep.smallSteps[prevStep.smallSteps.length - 1]);
            return;
        }

        // if current active step is small step and there are more small steps left, activate the previous small step
        if (this.activeSmallStep !== undefined && MdsStepper.getStepIndex(this.activeSmallStep, activeStep.smallSteps) > 0) {
            this.animateStep({ active: `${this.prefixedClassName}__step--small-step`, previous: `${this.prefixedClassName}__step--small-step` });
            this.activateStep(this.activeStep, activeStep.smallSteps[MdsStepper.getStepIndex(this.activeSmallStep, activeStep.smallSteps) - 1]);
            return;
        }

        // if current active step is small step and there are no more small steps left, set the active step as active
        this.animateStep({ previous: null, active: `${this.prefixedClassName}__step--small-step` });
        this.activateStep(this.activeStep);
    }

    activateNextStep() {
        this.direction = 'next';
        const activeStepIndex = MdsStepper.getStepIndex(this.activeStep, this.steps);
        const activeStep = this.steps[activeStepIndex];
        const activeHasSmallSteps = typeof activeStep !== 'string';

        const nextStepIndex = activeStepIndex + 1;
        const nextStep = this.steps[nextStepIndex];
        const nextHasSmallSteps = typeof nextStep !== 'string';

        // if there is no next step do nothing
        if (!nextStep) { return; }

        // if both next and current steps are large steps, activate the next step
        if (!activeHasSmallSteps) {
            this.animateStep();
            this.activateStep(nextStep.label || nextStep);
            return;
        }

        // if current active step is small step and there are more small steps left, activate the next small step
        if (this.activeSmallStep !== undefined && MdsStepper.getStepIndex(this.activeSmallStep, activeStep.smallSteps) < activeStep.smallSteps.length - 1) {
            this.animateStep({ active: `${this.prefixedClassName}__step--small-step`, next: `${this.prefixedClassName}__step--small-step` });
            this.activateStep(this.activeStep, activeStep.smallSteps[MdsStepper.getStepIndex(this.activeSmallStep, activeStep.smallSteps) + 1]);
            return;
        }

        // if current active step is large step and there are small steps activate the next small step
        if (activeHasSmallSteps && this.activeSmallStep === undefined) {
            this.animateStep({ active: null, next: `${this.prefixedClassName}__step--small-step` });
            this.activateStep(this.activeStep, activeStep.smallSteps[0]);
            return;
        }

        // if current active step is small step and there are no more small steps left, set the next step as active
        const label = nextHasSmallSteps ? nextStep.label : nextStep;
        this.animateStep({ active: `${this.prefixedClassName}__step--small-step` }, true);
        this.activateStep(label);
    }

    activateStep(activeStep, activeSmallStep) {
        const previousStepLevel = this.activeSmallStep ? this.activeSmallStep : this.activeStep;
        this.triggerEvent('mds-stepper-step-deactivated', { previousStepLevel });
        this.activeStep = activeStep;
        this.activeSmallStep = activeSmallStep || undefined;
        this.triggerEvent('mds-stepper-step-activated');
    }

    animateStep({
        previous = `${this.prefixedClassName}__step`,
        next = `${this.prefixedClassName}__step`,
        active = `${this.prefixedClassName}__step`,
    } = {}, updateParent = false) {
        if (this.animation) {
            const leftSelector = `.${previous}[data-status='previous']`;
            const rightSelector = `.${next}[data-status='next']`;
            const activeSelector = `.${active}[data-status='active']`;
            const previousParentSelector = `.${this.prefixedClassName}__step[data-status="previous"]`;
            const nextParentSelector = `.${this.prefixedClassName}__step[data-status="active"]`;

            if (this.direction === 'next') {
                if (active) {
                    this.querySelector(activeSelector).classList.replace(`${this.prefixedClassName}__step--active`, `${this.prefixedClassName}__step--complete`);
                }
                if (updateParent) {
                    this.querySelector(nextParentSelector).classList.replace(`${this.prefixedClassName}__step--active`, `${this.prefixedClassName}__step--complete`);
                }
                this.querySelector(rightSelector).classList.add(`${this.prefixedClassName}__step--active`);
            }
            if (this.direction === 'previous') {
                this.querySelector(activeSelector).classList.remove(`${this.prefixedClassName}__step--active`);
                if (previous) {
                    this.querySelector(leftSelector).classList.replace(`${this.prefixedClassName}__step--complete`, `${this.prefixedClassName}__step--active`);
                }
                if (updateParent) {
                    this.querySelector(previousParentSelector).classList.replace(`${this.prefixedClassName}__step--complete`, `${this.prefixedClassName}__step--active`);
                }
            }
        }
    }

    render() {
        if (this.firstRender === true || !this.direction) {
            super.render();
            this.componentRendered().then(() => {
                if (this.firstRender === true) {
                    this.firstRender = false;
                }
            });
        }

        if (this.firstRender === false && this.direction) {
            const delay = this.animation ? 400 : 100;
            setTimeout(() => {
                super.render();
            }, delay);
        }
    }

    /*
    *************************
    EVENTS
    *************************
    */
    bindEventHandlers() {
        const links = this.querySelectorAll('a');

        for (let i = 0; i < links.length; i += 1) {
            links[i].addEventListener('focus', (e) => {
                this.triggerEvent('focus', e);
            });
            links[i].addEventListener('blur', (e) => {
                this.triggerEvent('blur', e);
            });
        }
    }
}

MDSWCBase.defineCustomElement('mds-stepper', MdsStepper);

export default MdsStepper;
