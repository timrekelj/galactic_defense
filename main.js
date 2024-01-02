// NOTE: START LIVE SERVER: python -m http.server 3000

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js'
import { Renderer } from './common/engine/renderers/Renderer.js'
import { ResizeSystem } from './common/engine/systems/ResizeSystem.js'
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js'
import { TurntableController } from './common/engine/controllers/TurntableController.js'

import { Light } from './common/engine/lights/Light.js'

import {
    Camera,
    Node,
    Transform,
    Model
} from './common/engine/core.js'

const canvas = document.querySelector('canvas');

const renderer = new Renderer(canvas);
await renderer.initialize();

let loader = new GLTFLoader();
await loader.load('./assets/island/world.gltf');

const scene = loader.loadScene(loader.defaultScene);
if (!scene) { throw new Error('A default scene is required'); }

const camera = scene.find(node => node.getComponentOfType(Camera));
if (!camera) { throw new Error('A camera is required'); }

const model = await loader.loadNode('Ship01');

const model2 = model.clone();
model2.addComponent(new Transform());
model2.getComponentOfType(Transform).translation = [0, 10, 0];

scene.addChild(model2);

camera.addComponent(new TurntableController(camera, document.body, {
    distance: 100,
    yaw: Math.PI / 6,
    pitch: -(Math.PI / 6),
}));

let temp;
for (const node of loader.gltf.nodes) {
    if (node.name.startsWith('Point') || node.name.startsWith('Spot') || node.name.startsWith('Sun')) {
        temp = new Node();
        temp.addComponent(new Light());
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
