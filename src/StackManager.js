export class StateManager {
    constructor() {
        this.stateStack = [];
    }

    // pause the element on the top of the stack and add another element to stack and start it
    pushState(state) {
        if (this.stateStack.length > 0) {
            this.getCurrentState().stop();
        }

        this.stateStack.push(state);
        this.getCurrentState().start();

    }

    // pause the element on the top of the stack and remove it from stack
    popState() {
        this.getCurrentState().stop();
        return this.stateStack.pop();
    }

    // returns element at the top of the stack
    getCurrentState() {
        return this.stateStack[this.stateStack.length - 1];
    }

}