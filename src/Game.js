import {
    Transform,
} from '../engine/core.js'

import { Ship } from './Ship.js'

export class Game {
    constructor(loader, scene) {
        this.life = 100;
        this.loader = loader;
        this.scene = scene;
        this.time_since_last_spawn = 0;
        this.spawn_rate = 300;
    }
    
    async init() {
        // Level setup
        // Parse level data from JSON
        this.level_data = await fetch('./assets/level.json').then(response => response.json());
        console.log(this.level_data);
        const path = this.loader.loadNode('Road');
        
        // Place path tiles
        for (let i = 0; i < this.level_data.path.length; i++) {
            const temp_tile = path.clone();
            temp_tile.getComponentOfType(Transform).translation = this.level_data.path[i];
            this.scene.addChild(temp_tile);
        }

        // Place tower places
        for (let i = 0; i < this.level_data.tower_places.length; i++) {
            const temp_tower_place = this.loader.loadNode('TowerPlace').clone();
            temp_tower_place.getComponentOfType(Transform).translation = this.level_data.tower_places[i];
            this.scene.addChild(temp_tower_place);
        }

        this.spawnShip();

        // FIX: click to place tower
    }

    update(t, dt) {
        // Spawn ships at a rate that increases over time
        this.time_since_last_spawn += 100 * dt;
        if (this.time_since_last_spawn > this.spawn_rate) {
            this.time_since_last_spawn = 0;
            // this.spawn_rate *= 0.95;
            this.spawnShip(t);
        }
    }

    spawnShip(t) {
        console.log("time:", t);
        const ship = this.loader.loadNode('Ship01').clone();
        ship.addComponent(new Ship(this.level_data.path, ship));
        this.scene.addChild(ship);
    }
}
