const MdsPositioning = superclass => class extends superclass {
    getTagName() {
        return this.namespaced ? `${this.tagName.substring(0, 4)}v${this.majorVersion}-${this.tagName.substring(4)}` : this.tagName;
    }

    componentSelector() {
        const componentTag = this.getTagName();
        if (componentTag) {
            return this.querySelector(`.${componentTag.toLowerCase()}`);
        }
        return false;
    }

    moveToBody() {
        const currentComponent = this;
        const componentParent = this.parentNode;
        document.body.insertBefore(this, document.body.lastChild);
        let inDom = document.body.contains(componentParent);
        const observer = new MutationObserver(() => {
            if (document.body.contains(componentParent)) {
                inDom = true;
            } else if (inDom) {
                inDom = false;
                currentComponent.parentNode.removeChild(currentComponent);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    setPosition(fixedHeight = false) {
        if (this.position == null) {
            this.setPositionAuto(fixedHeight);
            return;
        }

        const triggerElement = document.getElementById(`${this.triggeredBy}`);
        const componentHeight = this.getComponentHeight();
        const attributes = {};

        if (triggerElement) {
            const topPos = this.getTopPosition() + window.pageYOffset;
            const leftPos = this.getLeftPosition() + window.pageXOffset;
            attributes.top = topPos;
            attributes.left = leftPos;
        }

        if (this.isCenterPositioned() && (this.isTopPositioned() || this.isBottomPositioned())) {
            const marginLeft = this.getLeftMargin();
            attributes.marginLeft = marginLeft;
        }

        // Set height
        if (this.isTopPositioned() && fixedHeight) {
            attributes.height = componentHeight;
        }

        this.setPositionStyleAttributes(attributes);
    }

    /**
     * based on component height check top and bottom edge
     * based on component width check left and right edge
     * if position prop not set
     * default top-center
     * if trigger elem top >= component height --- room on top
     * if window.innerWidth - trigger elem right >= component width --- room on right
     * if trigger elem left >= component width --- room on left
     * else set bottom-center
     */

    setPositionAuto(fixedHeight = false) {
        let topPos = '';
        let leftPos = '';
        const attributes = {};
        const isTooltip = this.getTagName().toLowerCase().indexOf('tooltip') !== -1;

        const renderedComponent = this.componentSelector();
        const triggerElement = document.getElementById(`${this.triggeredBy}`);
        this.removePositionClass();

        if (triggerElement) {
            const elementProps = {};
            elementProps.componentHeight = renderedComponent.getBoundingClientRect().height;
            elementProps.componentWidth = renderedComponent.getBoundingClientRect().width;
            elementProps.triggerTop = triggerElement.getBoundingClientRect().top;
            elementProps.triggerBottom = window.innerHeight - triggerElement.getBoundingClientRect().bottom;
            elementProps.triggerRight = window.innerWidth - triggerElement.getBoundingClientRect().right;
            elementProps.triggerLeft = triggerElement.getBoundingClientRect().left;
            elementProps.triggerHeight = triggerElement.getBoundingClientRect().height;
            elementProps.triggerWidth = triggerElement.getBoundingClientRect().width;

            const currentPosition = (elementProps.triggerTop >= elementProps.componentHeight) ? this.getAutoTopVariation(elementProps)
            : elementProps.triggerRight >= elementProps.componentWidth &&
                elementProps.triggerTop > -0.5 * elementProps.triggerHeight ? this.getAutoRightVariation(elementProps)
            : elementProps.triggerLeft >= elementProps.componentWidth &&
            elementProps.triggerTop > -0.5 * elementProps.triggerHeight ? this.getAutoLeftVariation(elementProps)
            : this.getAutoBottomVariation(elementProps);

            const heightBorders = (this.variation === 'default' && isTooltip && currentPosition.toLowerCase().trim().split('-')[0] === 'top') ? -2 : 0;
            const widthBorders = (this.variation === 'default' && isTooltip && currentPosition.toLowerCase().trim().split('-')[0] === 'left') ? -2 : 0;
            topPos = this.getTopPosition(currentPosition) + heightBorders + window.pageYOffset;
            leftPos = this.getLeftPosition(currentPosition) + widthBorders + window.pageXOffset;
            attributes.top = topPos;
            attributes.left = leftPos;
            renderedComponent.classList.add(`${this.getTagName().toLowerCase()}--${currentPosition}`);
            if (currentPosition === 'top-center' || currentPosition === 'bottom-center') {
                attributes.marginLeft = this.getLeftMargin();
            }

            if (currentPosition === 'top-center' && fixedHeight) {
                attributes.height = this.getComponentHeight();
            }

            this.setPositionStyleAttributes(attributes);
        }
    }

    getAutoTopVariation(elementProps) {
        elementProps.position = 'top';
        return this.getAutoTopBottom(elementProps);
    }

    getAutoBottomVariation(elementProps) {
        elementProps.position = 'bottom';
        return this.getAutoTopBottom(elementProps);
    }

    getAutoTopBottom(elementProps) {
        const currentPosition = (elementProps.triggerLeft + (0.5 * elementProps.triggerWidth) < 0.5 * elementProps.componentWidth) ?
            `${elementProps.position}-right`
            : (elementProps.triggerRight + (0.5 * elementProps.triggerWidth) < 0.5 * elementProps.componentWidth) ?
            `${elementProps.position}-left` : `${elementProps.position}-center`;
        return currentPosition;
    }

    getAutoRightVariation(elementProps) {
        elementProps.position = 'right';
        return this.getAutoLeftRight(elementProps);
    }

    getAutoLeftVariation(elementProps) {
        elementProps.position = 'left';
        return this.getAutoLeftRight(elementProps);
    }

    getAutoLeftRight(elementProps) {
        const currentPosition = ((0.5 * elementProps.triggerHeight) + elementProps.triggerTop < 0.5 * (elementProps.componentHeight + 2)) ?
            `${elementProps.position}-bottom`
            : ((0.5 * elementProps.triggerHeight) + elementProps.triggerBottom < 0.5 * (elementProps.componentHeight + 2)) ?
            `${elementProps.position}-top` : `${elementProps.position}-center`;
        return currentPosition;
    }

    setPositionStyleAttributes(attributes) {
        const renderedComponent = this.componentSelector();
        let styles = attributes.top && attributes.left ? `top: ${attributes.top}px; left: ${attributes.left}px;` : attributes;
        styles = attributes.marginLeft ? styles += ` margin-left: ${attributes.marginLeft};` : styles;
        styles = attributes.height ? styles += ` height: ${attributes.height};` : styles;
        renderedComponent.setAttribute('style', styles);
    }

    removePositionClass() {
        const renderedComponent = this.componentSelector();
        const positionOps = ['top-center', 'top-right', 'top-left', 'bottom-center', 'bottom-right', 'bottom-left', 'right-center', 'right-top', 'right-bottom', 'left-center', 'left-top', 'left-bottom'];

        positionOps.forEach((pos) => {
            const positionClass = `${this.getTagName().toLowerCase()}--${pos}`;
            if (renderedComponent.classList.contains(positionClass)) {
                renderedComponent.classList.remove(positionClass);
                renderedComponent.style.removeProperty('margin-left');
            }
        });
    }

    getComponentHeight() {
        const renderedComponent = this.componentSelector();
        const componentHeight = renderedComponent.getBoundingClientRect().height;
        return `${componentHeight}px`;
    }

    getTopPosition(autoPosition) {
        const isTooltip = this.getTagName().toLowerCase().indexOf('tooltip') !== -1;
        const bottomMargin = isTooltip ? 8 : 0;
        const topMargin = 8;
        const renderedComponent = this.componentSelector();
        const triggerElement = document.getElementById(`${this.triggeredBy}`);

        const componentHeight = renderedComponent.getBoundingClientRect().height;
        const triggerTop = triggerElement.getBoundingClientRect().top;
        const triggerBottom = triggerElement.getBoundingClientRect().bottom;
        const triggerHeight = triggerElement.getBoundingClientRect().height;
        const position = this.position ? this.position.toLowerCase() : autoPosition;
        const popoverSideCenter = !isTooltip && position.toLowerCase().trim().split('-')[1] === 'center' ? componentHeight * -0.5 : 0;
        switch (position) {
            case 'top-center':
            case 'top-right':
            case 'top-left':
                return triggerTop - componentHeight - topMargin;
            case 'bottom-center':
            case 'bottom-right':
            case 'bottom-left':
                return triggerBottom + bottomMargin;
            case 'right-center':
            case 'right-bottom':
            case 'left-center':
            case 'left-bottom':
                return triggerTop + popoverSideCenter + (triggerHeight / 2);
            case 'right-top':
            case 'left-top':
                return (triggerTop - componentHeight) + (triggerHeight / 2);
            default:
                break;
        }
        return triggerTop - componentHeight - bottomMargin;
    }

    getLeftPosition(autoPosition) {
        const isTooltip = this.getTagName().toLowerCase().indexOf('tooltip') !== -1;
        const rightMargin = isTooltip ? 8 : 0;
        const leftMargin = 8;
        const renderedComponent = this.componentSelector();
        const triggerElement = document.getElementById(`${this.triggeredBy}`);

        const componentWidth = renderedComponent.getBoundingClientRect().width;
        const triggerLeft = triggerElement.getBoundingClientRect().left;
        const triggerRight = triggerElement.getBoundingClientRect().right;
        const triggerWidth = triggerElement.getBoundingClientRect().width;
        const position = this.position ? this.position.toLowerCase() : autoPosition;
        switch (position) {
            case 'top-center':
            case 'top-right':
            case 'bottom-center':
            case 'bottom-right':
                return triggerLeft + (triggerWidth / 2);
            case 'top-left':
            case 'bottom-left':
                return (triggerLeft - componentWidth) + (triggerWidth / 2);
            case 'right-center':
            case 'right-bottom':
            case 'right-top':
                return triggerRight + rightMargin;
            case 'left-top':
            case 'left-center':
            case 'left-bottom':
                return triggerLeft - componentWidth - leftMargin;
            default:
                break;
        }
        return triggerLeft + (triggerWidth / 2);
    }

    getLeftMargin() {
        const renderedComponent = this.componentSelector();
        const popoverWidth = renderedComponent.getBoundingClientRect().width;
        return `-${(popoverWidth / 2)}px`;
    }

    isTopPositioned() {
        return !!((this.position.toLowerCase().trim().split('-')[0] === 'top' || this.position.toLowerCase().trim().split('-')[1] === 'top'));
    }

    isBottomPositioned() {
        return !!((this.position.toLowerCase().trim().split('-')[0] === 'bottom' || this.position.toLowerCase().trim().split('-')[1] === 'bottom'));
    }

    isCenterPositioned() {
        return this.position.toLowerCase().trim().split('-')[1] === 'center';
    }
};

export default MdsPositioning;
