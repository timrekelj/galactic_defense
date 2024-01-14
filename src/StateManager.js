import { GameState, SimplePauseMenuState, SimpleWelcomeMenuState, SimpleWinMenuState, SimpleLoseMenuState } from './States.js'

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

    // this makes instances of all possible states so you can then push them to stack form inside states
    // I don't like this, but I don't know how to do it better
    initialize() {
        this.gs = this.getGameState();
        
        this.welcomeMenu = new SimpleWelcomeMenuState(this.document, this);
        this.pauseMenu = new SimplePauseMenuState(this.document, this);
        this.winMenu = new SimpleWinMenuState(this.document, this);
        this.loseMenu = new SimpleLoseMenuState(this.document, this);
        this.pushState(this.welcomeMenu);
        }

    // need to trigger new game state instance somehow, this let's you do it from inside menu state
    // probably not the best way to do it, but it works
    getGameState(){
        if(this.gs){
            return this.gs;
        } else {
            this.gs = new GameState(this.canvas, this.renderer, this.loader, this);

            return this.gs;
        }
    }

    win(){
        console.log("Log from win");
        console.log(this.getCurrentState());
        console.log(this.stateStack.length);
        this.pushState(this.winMenu)

        console.log(this.getCurrentState());
        console.log(this.stateStack.length);
    }

    lose(){
        console.log("Log from win");
        console.log(this.getCurrentState());
        console.log(this.stateStack.length);
        this.pushState(this.loseMenu)

        console.log(this.getCurrentState());
        console.log(this.stateStack.length);
    }

    //TODO: research this
    // for some reason when you win and go back to main menu, the stack is just filling up and not cleaning old states
    // workaround -> when win menu calls to go back to welcome menu it will empty stack
    //I THINK, the win event is emitted more than once.... but not sure
    resetStack(){
    //UPDATE, this is not even used, if you use it it will crash the game
        console.log("reset stack");
        this.stateStack = [];
    }

    //we need this so when player exits the game, it destroy game state instance and it's data. 
    // So now when player starts new game it gets new game
    async destroyGameStateInstance(){
        if(this.gs){
            // need to remove loader scene cache
            this.loader.cache.clear();

            //hack, when you just cleare cache it doesn't work
            await this.loader.load('./assets/models/world.gltf');

            //this will destroy curent game instance (if you don't count gltf cache)
            this.gs = null
        }
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
        try {
            if(this.stateStack.length > 0){
                this.getCurrentState()?.stop();
                let removedState = this.stateStack.pop();
    
                //start whatever is left in stack
                if(this.stateStack.length > 0){
                    this.getCurrentState()?.start();
                }
    
                return removedState;
            } else {
                throw new Error("Trying to pop states from empty stack");
            }   
        } catch (error) {
            throw new Error("There was an error when trying to pop from state stack: " + error)
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
