export class ValidatedDialog extends Dialog {
    constructor(dialogData, options) {
        super(dialogData, options);
    }
    validate() {
        const innerHTML = this.element
            .find(".window-content")
            .children();
        const elementsToCheck = (Array.from(innerHTML.find("select,input,textarea")));
        const good = elementsToCheck
            .map((e) => {
            var _a, _b;
            const markedRequired = e.getAttribute("required") == null;
            const checkValid = e.checkValidity();
            const blankValue = e.value !== "";
            const elementGood = markedRequired || (checkValid && blankValue);
            // TODO: add some basic error messages
            if (elementGood) {
                (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove("failed-validation");
            }
            else {
                (_b = e.parentElement) === null || _b === void 0 ? void 0 : _b.classList.add("failed-validation");
            }
            return elementGood;
        })
            .reduce((e, n) => {
            return e && n;
        });
        return good;
    }
    submit(button) {
        var _a, _b;
        if (this.validate()) {
            return super.submit(button);
        }
        else {
            (_b = (_a = this.options).failCallback) === null || _b === void 0 ? void 0 : _b.call(_a, button);
        }
    }
}

//# sourceMappingURL=ValidatedDialog.js.map
