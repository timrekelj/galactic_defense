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

// If you wish you can implement new game states like in game menus