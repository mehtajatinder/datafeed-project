const MdsTrapFocus = superclass => class extends superclass {
    trapFocus() {
        this.setAttribute('tabindex', '-1');

        const nodes = this.focusableElements();
        if (nodes.length) nodes[0].focus();

        // Adds listener for tabbing
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 9) this.maintainFocus(e);
        });
    }

    focusableElements() {
        const elements = [
            'a[href]',
            'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
            'select:not([disabled]):not([aria-hidden])',
            'textarea:not([disabled]):not([aria-hidden])',
            'button:not([disabled]):not([aria-hidden])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex^="-"])',
        ];
        const nodes = this.querySelectorAll(elements);
        return Object.keys(nodes).map(key => nodes[key]);
    }
    maintainFocus(event) {
        const focusableNodes = this.focusableElements();

        const focusedItemIndex = focusableNodes.indexOf(document.activeElement);

        if (event.shiftKey && focusedItemIndex === 0) {
            focusableNodes[focusableNodes.length - 1].focus();
            event.preventDefault();
        }

        if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
            focusableNodes[0].focus();
            event.preventDefault();
        }
    }
  };

export default MdsTrapFocus;
