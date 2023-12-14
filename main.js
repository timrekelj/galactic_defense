// NOTE: START LIVE SERVER: python -m http.server 3000

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

// TODO: render multiple nodes from one .gltf
const loaders = [];
loaders.push(new GLTFLoader());
console.log(loaders[0].gltf);
await loaders[0].load('./assets/island/floating_island.gltf');
const scene = loaders[0].loadScene(loaders[0].defaultScene);
if (!scene) { throw new Error('A default scene is required'); }

loaders.push(new GLTFLoader());
await loaders[1].load('./assets/turret/test_turret.gltf');
const turret = loaders[1].loadNode('Cube');
turret.addComponent(new Transform({ translation: [0, 10, 20] }));
scene.addChild(turret);


console.log(loaders)

const camera = scene.find(node => node.getComponentOfType(Camera));
if (!camera) { throw new Error('A camera is required'); }

camera.addComponent(new TurntableController(camera, document.body, {
    distance: 100,
}));

console.log(scene);

let temp;
for (const loader of loaders) {
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
            console.log("found point light in ", loader);
            temp = new Node();
            temp.addComponent(new Point());
            temp.addComponent(new Transform({ translation: node.translation }));
            scene.addChild(temp);
        }
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
