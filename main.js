// NOTE: START LIVE SERVER: python -m http.server 3000

import { GLTFLoader } from './engine/loaders/GLTFLoader.js'
import { Renderer } from './engine/renderers/Renderer.js'

import { GameState } from './src/States.js'
import { StateManager } from './src/StackManager.js'

const canvas = document.querySelector('canvas');

const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load('./assets/models/world.gltf');

//store state of curently active state (game or some menue (welcome/pause...))
const stackManager = new StateManager();

//initialise game and push it on top of the stack
const gs = new GameState(canvas, renderer, loader); //TODO also stop resizing
stackManager.pushState(gs);


document.querySelector('.loader-container').remove();
