import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js'
import { LitRenderer } from './common/engine/renderers/LitRenderer.js'
import { ResizeSystem } from './common/engine/systems/ResizeSystem.js'
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js'
import { TurntableController } from './common/engine/controllers/TurntableController.js'
import { RotateAnimator } from './common/engine/animators/RotateAnimator.js'
import { Light } from './light.js'

import {
    Camera,
    Node,
    Transform,
    Model
} from './common/engine/core.js'

const canvas = document.querySelector('canvas')

// Setup renderer
const renderer = new LitRenderer(canvas)
await renderer.initialize()

// GLTF loader
const gltfloader = new GLTFLoader()
await gltfloader.load('./common/models/rocks/rocks.gltf')

// Setup camera
const scene = gltfloader.loadScene(gltfloader.defaultScene)
const camera = scene.find(node => node.getComponentOfType(Camera))
camera.addComponent(new TurntableController(camera, document.body, {
    distance: 20
}))

// Setup model
const model = gltfloader.loadNode('Geometry')
// model.addComponent(new RotateAnimator(model, {
//     startRotation: [0, 0, 0, 1],
//     endRotation: [0, 0, 1, 0],
//     duration: 5,
//     loop: true
// }))

// Create the light
const light = new Node()
light.addComponent(new Transform({
    translation: [0, 2, 0]
}))
light.addComponent(new Light())
scene.addChild(light)

function update(t, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.()
        }
    })
}

function render() {
    renderer.render(scene, camera)
}

function resize({ displaySize: { width, height } }) {
    camera.getComponentOfType(Camera).aspect = width / height
}

new UpdateSystem({ update, render }).start()
new ResizeSystem({ canvas, resize }).start()