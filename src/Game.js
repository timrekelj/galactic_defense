import {
    Transform,
} from '../engine/core.js'

import { Ship } from './Ship.js'
import { Turret } from './Turret.js'

export class Game {
    constructor(loader, scene) {
        this.lives = 10;
        this.score = 0;
        this.money = 100;
        this.loader = loader;
        this.scene = scene;
        this.time_since_last_spawn = 0;
        this.spawn_rate = 300;
    }
    
    async init() {
        // Level setup
        // Parse level data from JSON
        this.level_data = await fetch('./assets/level.json').then(response => response.json());
        const path = this.loader.loadNode('Road');
        
        // Place path tiles
        for (let i = 0; i < this.level_data.path.length; i++) {
            const temp_tile = path.clone();
            temp_tile.getComponentOfType(Transform).translation = [this.level_data.path[i][0], 1, this.level_data.path[i][2]];
            this.scene.addChild(temp_tile);
        }

        // Place tower places
        for (let i = 0; i < this.level_data.tower_places.length; i++) {
            const temp_tower_place = this.loader.loadNode('TowerPlace').clone();
            temp_tower_place.getComponentOfType(Transform).translation = this.level_data.tower_places[i];
            this.scene.addChild(temp_tower_place);
        }

        // Place turret (this is just for testing)
        // TODO: click to place tower
        const temp_turret = this.loader.loadNode('Tower').clone();
        temp_turret.getComponentOfType(Transform).translation = this.level_data.tower_places[1];
        temp_turret.addComponent(new Turret(this.scene, temp_turret, this.level_data.tower_places[20]));
        this.scene.addChild(temp_turret);

        this.spawnShip();
    }

    update(t, dt) {
        // UI update
        document.querySelector('.time_number').innerHTML = Math.floor(t) + ' s';
        document.querySelector('.score_number').innerHTML = this.score;
        document.querySelector('.lives_number').innerHTML = this.lives;
        document.querySelector('.money_number').innerHTML = this.money;

        // Spawn ships at a rate that increases over time
        this.time_since_last_spawn += 100 * dt;
        if (this.time_since_last_spawn > this.spawn_rate) {
            this.time_since_last_spawn = 0;
            // this.spawn_rate *= 0.95;
            // this.spawnShip(t);
        }
    }

    spawnShip(t) {
        const ship = this.loader.loadNode('Ship01').clone();
        ship.addComponent(new Ship(this.level_data.path, ship, this));
        this.scene.addChild(ship);
    }
}
