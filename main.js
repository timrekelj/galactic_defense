// NOTE: START LIVE SERVER: python -m http.server 3000

import { GLTFLoader } from './engine/loaders/GLTFLoader.js'
import { Renderer } from './engine/renderers/Renderer.js'
import { ResizeSystem } from './engine/systems/ResizeSystem.js'
import { UpdateSystem } from './engine/systems/UpdateSystem.js'
import { TurntableController } from './engine/controllers/TurntableController.js'
import { Game } from './src/Game.js'

import { Light } from './engine/lights/Light.js'

import {
    Camera,
    Node,
    Transform,
    Model
} from './engine/core.js'

const canvas = document.querySelector('canvas');

const renderer = new Renderer(canvas);
await renderer.initialize();

let loader = new GLTFLoader();
await loader.load('./assets/models/world.gltf');

const scene = loader.loadScene(loader.defaultScene);
if (!scene) { throw new Error('A default scene is required'); }

// Move original nodes far away
loader.loadNode('Road').getComponentOfType(Transform).translation = [0, 1000, 0];
loader.loadNode('TowerPlace').getComponentOfType(Transform).translation = [0, 1000, 0];
loader.loadNode('Ship01').getComponentOfType(Transform).translation = [0, 1000, 0];
loader.loadNode('Ship02').getComponentOfType(Transform).translation = [0, 1000, 0];
loader.loadNode('Tower').getComponentOfType(Transform).translation = [0, 1000, 0];

// Camera and turntable setup
const camera = scene.find(node => node.getComponentOfType(Camera));
if (!camera) { throw new Error('A camera is required'); }

// TODO: fix turntable controller (limit rotation and zoom, maybe fix some bugs)
camera.addComponent(new TurntableController(camera, document.body, {
    distance: 300,
    yaw: Math.PI / 2,
    pitch: -(Math.PI / 2),
}));

// Light setup
// TODO: if there is time, add support for multiple lights (first for Point light, then for Spot and Sun light)
let temp;
for (const node of loader.gltf.nodes) {
    if (node.name.startsWith('Point') || node.name.startsWith('Spot') || node.name.startsWith('Sun')) {
        temp = new Node();
        temp.addComponent(new Light());
        temp.addComponent(new Transform({ translation: node.translation }));
        scene.addChild(temp);
    }
}

const game = new Game(loader, scene);
game.init();

function update(t, dt) {

    game.update(t, dt);

    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(t, dt);
        }
    })
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height } }) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new UpdateSystem({ update, render }).start();
new ResizeSystem({ canvas, resize }).start();

document.querySelector('.loader-container').remove();
