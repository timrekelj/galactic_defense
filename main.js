//?: START LIVE SERVER: python -m http.server 3000
// TODO: skybox

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js'
import { Renderer } from './common/engine/renderers/Renderer.js'
import { ResizeSystem } from './common/engine/systems/ResizeSystem.js'
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js'
import { TurntableController } from './common/engine/controllers/TurntableController.js'

import { Spot } from './common/engine/lights/Spot.js'
import { Sun } from './common/engine/lights/Sun.js'
import { Point } from './common/engine/lights/Point.js'

import {
    Camera,
    Node,
    Transform,
    Model
} from './common/engine/core.js'

const canvas = document.querySelector('canvas');

const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
console.log(loader)

// TODO: render multiple nodes from one .gltf
await loader.load('./assets/island/floating_island.gltf');

const scene = loader.loadScene(loader.defaultScene);
if (!scene) { throw new Error('A default scene is required'); }

const camera = scene.find(node => node.getComponentOfType(Camera));
if (!camera) { throw new Error('A camera is required'); }

camera.addComponent(new TurntableController(camera, document.body, {
    distance: 100,
}));

let temp;
for (const node of loader.gltf.nodes) {
    if (node.name.startsWith('Spot')) {
        temp = new Node();
        temp.addComponent(new Spot());
        temp.addComponent(new Transform({ translation: node.translation }));
        scene.addChild(temp);
    } else if (node.name.startsWith('Sun')) {
        temp = new Node();
        temp.addComponent(new Sun());
        temp.addComponent(new Transform({ translation: node.translation }));
        scene.addChild(temp);
    } else if (node.name.startsWith('Point')) {
        temp = new Node();
        temp.addComponent(new Point());
        temp.addComponent(new Transform({ translation: node.translation }));
        scene.addChild(temp);
    }
}

function update(t, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.();
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
