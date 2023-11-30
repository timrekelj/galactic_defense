//? START LIVE SERVER: python -m http.server 3000

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js'
import { LitRenderer } from './common/engine/renderers/LitRenderer.js'
import { UnlitRenderer } from './common/engine/renderers/UnlitRenderer.js'
import { ResizeSystem } from './common/engine/systems/ResizeSystem.js'
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js'
import { TurntableController } from './common/engine/controllers/TurntableController.js'
import { Light } from './light.js'

import {
    Camera,
    Node,
    Transform,
    Model
} from './common/engine/core.js'

const canvas = document.querySelector('canvas');

const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('./assets/environment/floating_island.gltf');

const scene = loader.loadScene(loader.defaultScene);
if (!scene) { throw new Error('A default scene is required'); }

const camera = scene.find(node => node.getComponentOfType(Camera));
if (!camera) { throw new Error('A camera is required'); }

camera.addComponent(new TurntableController(camera, document.body, {
    distance: 20
}));

const light = new Node();
light.addComponent(new Transform({ translation: [0, 2, 0] }));
light.addComponent(new Light());
scene.addChild(light);


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
