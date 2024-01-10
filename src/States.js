import { ResizeSystem } from './../engine/systems/ResizeSystem.js'
import { UpdateSystem } from './../engine/systems/UpdateSystem.js'
import { TurntableController } from './../engine/controllers/TurntableController.js'
import { Game } from './Game.js'

import { Light } from './../engine/lights/Light.js'

import {
    Camera,
    Node,
    Transform,
    Model
} from './../engine/core.js'


export class GameState {
    constructor(canvas, renderer, loader) {
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.renderer = renderer;
        this.loader = loader;
        this.canvas = canvas;

        this.scene = this.loader.loadScene(this.loader.defaultScene);
        if (!this.scene) { throw new Error('A default scene is required'); }
    
        // Move original nodes far away
        this.loader.loadNode('Road').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('TowerPlace').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('Ship01').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('Ship02').getComponentOfType(Transform).translation = [0, 1000, 0];
        this.loader.loadNode('Tower').getComponentOfType(Transform).translation = [0, 1000, 0];

        // Camera and turntable setup
        this.camera = this.scene.find(node => node.getComponentOfType(Camera));
        if (!this.camera) { throw new Error('A camera is required'); }

        // TODO: fix turntable controller (limit rotation and zoom, maybe fix some bugs)
        this.camera.addComponent(new TurntableController(this.camera, document.body, {
            distance: 300,
            yaw: Math.PI / 2,
            pitch: -(Math.PI / 2),
        }));

        // Light setup
        // TODO: if there is time, add support for multiple lights (first for Point light, then for Spot and Sun light)
        let temp;
        for (const node of this.loader.gltf.nodes) {
            if (node.name.startsWith('Point') || node.name.startsWith('Spot') || node.name.startsWith('Sun')) {
                temp = new Node();
                temp.addComponent(new Light());
                temp.addComponent(new Transform({ translation: node.translation }));
                this.scene.addChild(temp);
            }
        }

        this.game = new Game(this.loader, this.scene);

        this.updateSystem = new UpdateSystem({ update: this.update, render: this.render });
        new ResizeSystem({ canvas: this.canvas, resize: this.resize }).start();
    }

    // init game, then start the update and render continuously
    start(){
        this.game.init();
        this.updateSystem.start();
    }

    // Stop the update and render loop
    stop(){
        this.updateSystem.stop();
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
}


export class SimpleWelcomeMenuState {
    constructor(document, stackReference) {
        this.stackReference = stackReference;

        this.overlay = document.querySelector(".overlay");
        this.container = document.querySelector(".container");

        // Menus
        this.menu = document.querySelector(".menu");
        this.howToPlayMenu = document.querySelector("#howToPlay");
        this.creditsMenu = document.querySelector("#credits");

        // Buttons
        this.playBtn = document.querySelector('#playBtn');
        this.howToBtn = document.querySelector('#howToBtn');
        this.creditsBtn = document.querySelector("#creditsBtn");
        this.creditsBtn = document.querySelector("#creditsBtn");
        this.backBtns = document.querySelectorAll(".backBtn");

        // event listeners
        this.container.addEventListener("pointerdown", (event) =>{
            // prevent game to "steal" mouse event
            //https://stackoverflow.com/questions/13966734/child-element-click-event-trigger-the-parent-click-event
            event.stopPropagation();
        });

        this.playBtn.addEventListener('pointerdown', (event) => {
            this.stackReference.popState();
            this.stackReference.pushState(this.stackReference.gs);
        });

        this.howToBtn.addEventListener('pointerdown', (event) => {
            console.log("howTo");
            this.changeMenueVisibility(this.howToPlayMenu, this.menu);
        });

        this.creditsBtn.addEventListener('pointerdown', (event) => {
            console.log("credits");
            this.changeMenueVisibility(this.creditsMenu, this.menu);
        });

        this.backBtns.forEach(backBtn => {
            backBtn.addEventListener('pointerdown', (event) => {
            console.log("Go back");
            //TODO optimise change menu so you can only pass one menu to make it visible, other will be invisible
            this.changeMenueVisibility(this.menu, this.creditsMenu);
            this.changeMenueVisibility(null, this.howToPlayMenu);
            });
        });

        this.escKeyListener =(event) => {
            console.log("key pressed");
            if(event.key === "Escape"){
                this.stackReference.popState();
                this.stackReference.pushState(this.stackReference.welcomeMenu);
            }
        }
    }

    start(){
        console.log("Simple menu started");

        document.body.removeEventListener("keydown", this.escKeyListener);
        console.log("key listener removed");

        this.changeMenueVisibility(this.overlay, null)
        this.changeMenueVisibility(this.menu, null)
    }

    // when spamming esc and clicking play, ships move weird
    stop(){
        console.log("simple menu stopped");
        this.changeMenueVisibility(null, this.overlay);

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


    }

    start(){

    }

    stop(){

    }
}
// If you wish you can implement new (game) states, like in game menus