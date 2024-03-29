import { ResizeSystem } from './../engine/systems/ResizeSystem.js'
import { UpdateSystem } from './../engine/systems/UpdateSystem.js'
import { InputController } from './../engine/controllers/InputController.js'
import { Game } from './Game.js'

import { Light } from './../engine/lights/Light.js'

import {
    Camera,
    Node,
    Transform,
} from './../engine/core.js'
import commonEventEmitter from './EventEmitter.js'


export class GameState {
    constructor(canvas, renderer, loader, stackReference) {
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.renderer = renderer;
        this.loader = loader;
        this.canvas = canvas;
        this.stackReference = stackReference;

        this.scene = this.loader.loadScene(this.loader.defaultScene);
        if (!this.scene) { throw new Error('A default scene is required'); }
    
        // Move original nodes far away
        this.loader.loadNode('Road').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('TowerPlace').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('TowerPlaceChosen').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('Ship01').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('Ship02').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('Tower').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('Laser').getComponentOfType(Transform).translation = [0, 1000, 0];

        // Light setup
        let temp;
        for (const node of this.loader.gltf.nodes) {
            if (node.name.startsWith('Light')) {
                temp = new Node();
                temp.addComponent(new Light());
                temp.addComponent(new Transform({ translation: node.translation }));
                this.scene.addChild(temp);
            }
        }

        this.game = null;
        // this.game = new Game(this.loader, this.scene);
        if(this.game === null){
            this.game = new Game(this.loader, this.scene);
            this.updateSystem = new UpdateSystem({ update: this.update, render: this.render });
            this.game.init();
        }

        this.song = null;

        try{
            this.song = new Audio("./assets/sounds/song.mp3");
            this.song.volume = 0.1;
            this.song.loop = true;
        } catch (e) {
            throw new Error("Problems at loading game song: " + e)
        }

        // Camera and turntable setup
        this.camera = this.scene.find(node => node.getComponentOfType(Camera));
        if (!this.camera) { throw new Error('A camera is required'); }

        // add controller to camera
        this.camera.addComponent(new InputController(this.game, this.camera, document.body, {
            distance: 200,
            yaw: Math.PI / 4,
            pitch: -(Math.PI / 5),
        }));

        this.updateSystem = null;
        // this.updateSystem = new UpdateSystem({ update: this.update, render: this.render });

        this.updateSystem = new UpdateSystem({ update: this.update, render: this.render });
        new ResizeSystem({ canvas: this.canvas, resize: this.resize }).start();

        commonEventEmitter.on("gameOver", (data) => {
            console.log("GOT EMITTER");
            if(data === "win"){
                this.stackReference.win();
            }
            else if(data === "lose"){
                this.stackReference.lose();
            }
        });
    }

    //init game if not yet
    //start the update and render continuously
    start(){
       this.updateSystem.start();
        this.changeMenueVisibility(document.querySelector(".game-ui"), null)

        if(this.song !== null){
            this.song.play();
        }
    }

    // Stop the update and render loop
    stop(){
        this.updateSystem.stop();
        this.changeMenueVisibility(null, document.querySelector(".game-ui"));
        
        if(this.song !== null){
            this.song.pause();
        }
    }

    update(t, dt) {

        this.game.update(t, dt);

        this.scene.traverse(node => {
            for (const component of node.components) {
                component.update?.(t, dt);
            }
        })
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize({ displaySize: { width, height } }) {
        this.camera.getComponentOfType(Camera).aspect = width / height;
    }

    //TODO this can be optimised with loop to go over all menus and only set one to visible (this can be more dynamic then)
    changeMenueVisibility(menuToShow, menuToHide){
        menuToShow?.classList.remove("invisible");
        menuToShow?.classList.add("visible");

        menuToHide?.classList.remove("visible");
        menuToHide?.classList.add("invisible");
    }
}


export class SimpleWelcomeMenuState {
    constructor(document, stackReference) {
        this.stackReference = stackReference;

        this.gameCanvas = document.querySelector(".game-canvas")
        this.overlay = document.querySelector(".overlay");
        this.container = document.querySelector(".container");

        // Menus
        this.menu = document.querySelector("#welcome-menu");
        this.howToPlayMenu = document.querySelector("#howToPlay");
        this.creditsMenu = document.querySelector("#credits");

        // Buttons
        this.playBtn = document.querySelector('#playBtn');
        this.howToBtn = document.querySelector('#howToBtn');
        this.creditsBtn = document.querySelector("#creditsBtn");
        this.creditsBtn = document.querySelector("#creditsBtn");
        this.backBtns = document.querySelectorAll(".welcome-menu .backBtn");

        // event listeners
        this.container.addEventListener("pointerdown", (event) =>{
            // prevent game to "steal" mouse event
            //https://stackoverflow.com/questions/13966734/child-element-click-event-trigger-the-parent-click-event
            event.stopPropagation();
        });

        this.playBtn.addEventListener('pointerdown', (event) => {
            try {
                this.stackReference.popState();
            } catch (error) {
                console.error("Can't pop from state stack: " + error)
            }

            this.changeMenueVisibility(this.gameCanvas, null)
            this.stackReference.pushState(this.stackReference.getGameState());
        });

        this.howToBtn.addEventListener('pointerdown', (event) => {
            this.changeMenueVisibility(this.howToPlayMenu, this.menu);
        });

        this.creditsBtn.addEventListener('pointerdown', (event) => {
            this.changeMenueVisibility(this.creditsMenu, this.menu);
        });

        this.backBtns.forEach(backBtn => {
            backBtn.addEventListener('pointerdown', (event) => {
            //TODO optimise change menu so you can only pass one menu to make it visible, other will be invisible
            this.changeMenueVisibility(this.menu, this.creditsMenu);
            this.changeMenueVisibility(null, this.howToPlayMenu);
            });
        });

        this.escKeyListener =(event) => {
            if(event.key === "Escape"){
                try {
                    this.stackReference.popState();
                } catch (error) {
                    console.error("Can't pop from state stack: " + error)
                }
                this.stackReference.pushState(this.stackReference.pauseMenu);
            }
        }
    }

    start(){
        document.body.removeEventListener("keydown", this.escKeyListener);

        this.changeMenueVisibility(this.overlay, null)
        this.changeMenueVisibility(this.menu, null)
    }

    // when spamming esc and clicking play, ships move weird
    stop(){
        this.changeMenueVisibility(null, this.overlay);
        this.changeMenueVisibility(null, this.menu);

        //probably hacky solution
        document.body.addEventListener("keydown", this.escKeyListener);

        // document.querySelector(".container").removeEventListener("pointerdown", (event) =>{
        //     // prevent game to "steal" mouse event
        //     //https://stackoverflow.com/questions/13966734/child-element-click-event-trigger-the-parent-click-event
        //     event.stopPropagation();
        // });
    }

    //TODO this can be optimised with loop to go over all menus and only set one to visible (this can be more dynamic then)
    changeMenueVisibility(menuToShow, menuToHide){
        menuToShow?.classList.remove("invisible");
        menuToShow?.classList.add("visible");

        menuToHide?.classList.remove("visible");
        menuToHide?.classList.add("invisible");
    }
}

export class SimplePauseMenuState {
    constructor(document, stackReference) {
        this.stackReference = stackReference;

        this.gameCanvas = document.querySelector(".game-canvas")
        this.overlay = document.querySelector(".overlay");
        this.container = document.querySelector(".container");

        // Menus
        this.menu = document.querySelector("#pause-menu");
        this.exitConfirmationMenu = document.querySelector(".exitConfirmation");

        // Buttons
        this.exitBtn = document.querySelector('#exitBtn');
        this.resumeBtn = document.querySelector('#resumeBtn');
        this.confirmExitBtn = document.querySelector("#confirmExitBtn");
        this.backBtns = document.querySelectorAll(".pause-menu .backBtn");

        // event listeners
        this.container.addEventListener("pointerdown", (event) =>{
            // prevent game to "steal" mouse event
            //https://stackoverflow.com/questions/13966734/child-element-click-event-trigger-the-parent-click-event
            event.stopPropagation();
        });

        this.exitBtn.addEventListener('pointerdown', (event) => {
            // this.stackReference.popState();
            // this.stackReference.pushState(this.stackReference.gs);
            this.changeMenueVisibility(this.exitConfirmationMenu, this.menu)
        });

        this.resumeBtn.addEventListener('pointerdown', (event) => {
            this.changeMenueVisibility(null, this.menu);
            this.changeMenueVisibility(null, this.overlay);

            try {
                this.stackReference.popState();
            } catch (error) {
                console.error("Can't pop from state stack: " + error);
            }

            this.stackReference.pushState(this.stackReference.gs);
        });

        this.confirmExitBtn.addEventListener('pointerdown', (event) => {
            try {
                this.stackReference.popState();
            } catch (error) {
                console.error("Can't pop state from stack: " + error);
            }

            this.changeMenueVisibility(null, this.gameCanvas);
            this.stackReference.pushState(this.stackReference.welcomeMenu);

            //this is probably not a good solution to do that here...
            // this.stackReference.gs.game = undefined;
            this.stackReference.destroyGameStateInstance();
        });

        this.backBtns.forEach(backBtn => {
            backBtn.addEventListener('pointerdown', (event) => {
            //TODO optimise change menu so you can only pass one menu to make it visible, other will be invisible
            this.changeMenueVisibility(this.menu, this.exitConfirmationMenu);
            });
        });
    }

    start(){
        this.changeMenueVisibility(this.menu, null);
        this.changeMenueVisibility(this.overlay, null);
    }

    stop(){
        this.changeMenueVisibility(null, this.overlay);
        this.changeMenueVisibility(null, this.menu);
    }

    //TODO this can be optimised with loop to go over all menus and only set one to visible (this can be more dynamic then)
    changeMenueVisibility(menuToShow, menuToHide){
        menuToShow?.classList.remove("invisible");
        menuToShow?.classList.add("visible");

        menuToHide?.classList.remove("visible");
        menuToHide?.classList.add("invisible");
    }
}

export class SimpleWinMenuState {
    constructor(document, stackReference) {
        this.stackReference = stackReference;

        this.gameCanvas = document.querySelector(".game-canvas")
        this.overlay = document.querySelector(".overlay");
        this.container = document.querySelector(".container");

        // Menus
        this.menu = document.querySelector("#win-menu");

        // Buttons
        this.confirmExitBtn = document.querySelector("#winBackToMainBtn");

        // event listeners
        this.container.addEventListener("pointerdown", (event) =>{
            // prevent game to "steal" mouse event
            //https://stackoverflow.com/questions/13966734/child-element-click-event-trigger-the-parent-click-event
            event.stopPropagation();
        });

        this.confirmExitBtn.addEventListener('pointerdown', (event) => {
            console.log("EXIT: " + this.stackReference.stateStack.length);
            try {
                // this remove the menu
                this.stackReference.popState(); 

                // this removes the game under the menu (game is seen behing the menu)
                this.stackReference.popState();

            } catch (error) {
                console.error("Can't pop state from stack: " + error);
            }

            this.changeMenueVisibility(null, this.gameCanvas);
            this.stackReference.pushState(this.stackReference.welcomeMenu);

            //this is probably not a good solution to do that here...
            // this.stackReference.gs.game = undefined;
            this.stackReference.destroyGameStateInstance();
            console.log("EXIT: " + this.stackReference.stateStack.length);
        });

    }

    start(){
        this.changeMenueVisibility(this.menu, null);
        this.changeMenueVisibility(this.overlay, null);
    }

    stop(){
        this.changeMenueVisibility(null, this.overlay);
        this.changeMenueVisibility(null, this.menu);
    }

    //TODO this can be optimised with loop to go over all menus and only set one to visible (this can be more dynamic then)
    changeMenueVisibility(menuToShow, menuToHide){
        menuToShow?.classList.remove("invisible");
        menuToShow?.classList.add("visible");

        menuToHide?.classList.remove("visible");
        menuToHide?.classList.add("invisible");
    }
}

export class SimpleLoseMenuState {
    constructor(document, stackReference) {
        this.stackReference = stackReference;

        this.gameCanvas = document.querySelector(".game-canvas")
        this.overlay = document.querySelector(".overlay");
        this.container = document.querySelector(".container");

        // Menus
        this.menu = document.querySelector("#lose-menu");

        // Buttons
        this.confirmExitBtn = document.querySelector("#loseBackToMainBtn");

        // event listeners
        this.container.addEventListener("pointerdown", (event) =>{
            // prevent game to "steal" mouse event
            //https://stackoverflow.com/questions/13966734/child-element-click-event-trigger-the-parent-click-event
            event.stopPropagation();
        });

        this.confirmExitBtn.addEventListener('pointerdown', (event) => {
            try {
                this.stackReference.popState();
            } catch (error) {
                console.error("Can't pop state from stack: " + error);
            }

            this.changeMenueVisibility(null, this.gameCanvas);
            this.stackReference.pushState(this.stackReference.welcomeMenu);

            //this is probably not a good solution to do that here...
            // this.stackReference.gs.game = undefined;
            this.stackReference.destroyGameStateInstance();
        });
    }

    start(){
        this.changeMenueVisibility(this.menu, null);
        this.changeMenueVisibility(this.overlay, null);
    }

    stop(){
        this.changeMenueVisibility(null, this.overlay);
        this.changeMenueVisibility(null, this.menu);
    }

    //TODO this can be optimised with loop to go over all menus and only set one to visible (this can be more dynamic then)
    changeMenueVisibility(menuToShow, menuToHide){
        menuToShow?.classList.remove("invisible");
        menuToShow?.classList.add("visible");

        menuToHide?.classList.remove("visible");
        menuToHide?.classList.add("invisible");
    }
}

// If you wish you can implement new (game) states, like in game menus
