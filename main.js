// NOTE: START LIVE SERVER: python -m http.server 3000

import { GLTFLoader } from './engine/loaders/GLTFLoader.js'
import { Renderer } from './engine/renderers/Renderer.js'

import { StateManager } from './src/StateManager.js'

//this needs to be first otherwise renderer.initialise prevents this to be triggered
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("page is fully loaded");
    document.querySelector('.loader-container').remove();
  });

const canvas = document.querySelector('canvas');

const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('./assets/models/world.gltf');

// //store state of curently active state (game or some menue (welcome/pause...))
const stackManager = new StateManager(canvas, renderer, loader, document);
stackManager.initialize();

