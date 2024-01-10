import { GameState, SimpleWelcomeMenuState } from './States.js'

export class StateManager {
    constructor(canvas, renderer, loader, document) {
        this.initialize = this.initialize.bind(this);
        this.getCurrentState = this.getCurrentState.bind(this);
        this.pushState = this.pushState.bind(this);
        this.popState = this.popState.bind(this);

        this.stateStack = [];
        this.canvas = canvas;
        this.renderer = renderer;
        this.loader = loader;
        this.document = document;
    }

    initialize() {
        this.gs = new GameState(this.canvas, this.renderer, this.loader); //TODO also stop resizing
        
        this.welcomeMenu = new SimpleWelcomeMenuState(this.document, this);
        this.pushState(this.welcomeMenu);
        }

    // pause the element on the top of the stack and add another element to stack and start it
    pushState(state) {
        if (this.stateStack.length > 0) {
            this.getCurrentState()?.stop();
        }

        this.stateStack.push(state);
        this.getCurrentState()?.start();

    }

    // pause the element on the top of the stack and remove it from stack
    popState() {
        if(this.stateStack.length > 0){
            this.getCurrentState()?.stop();
            return this.stateStack.pop();
        } else {
            throw new Error("Trying to pop states from empty stack");
        }
    }

    // returns element at the top of the stack
    getCurrentState() {
        if(this.stateStack.length > 0){
            return this.stateStack[this.stateStack.length - 1];
        } else {
            throw new Error("Trying to return states from empty stack");
        }
    }

}