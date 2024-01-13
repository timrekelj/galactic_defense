import {
    Transform,
} from '../engine/core.js'

import { Ship } from './Ship.js'
import { Turret } from './Turret.js'

export class Game {
    constructor(loader, scene, canvas) {
        this.click = false;
        this.click_ray = [0, 0, 0];
        this.lives = 10;
        this.score = 0;
        this.turret_price = 100;
        this.money = this.turret_price;
        this.loader = loader;
        this.scene = scene;
        this.canvas = canvas;
        this.time_since_last_spawn = 0;
        this.spawn_rate = 300;
        this.ship_counter = 0;
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

        // FIX: Place turret (this is just for testing, delete when proper turret placement is implemented)
        const temp_turret = this.loader.loadNode('Tower').clone();
        temp_turret.getComponentOfType(Transform).translation = this.level_data.tower_places[1];
        temp_turret.addComponent(new Turret(this.scene, temp_turret, this.level_data.tower_places[20]));
        this.scene.addChild(temp_turret);

        const temp_turre = this.loader.loadNode('Tower').clone();
        temp_turre.getComponentOfType(Transform).translation = this.level_data.tower_places[1];
        temp_turre.addComponent(new Turret(this.scene, temp_turre, this.level_data.tower_places[6]));
        this.scene.addChild(temp_turre);

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
            this.spawn_rate *= 0.99;
            this.spawnShip();
        }

        if (this.click) {
            this.click = false;
            this.placeTower();
        }
    }

    placeTower() {
        // TODO: check if enough money
        if (this.money < this.turret_price) {
            return;
        }
        this.money -= this.turret_price;

        // this.chooseTowerPlace(this.click_ray);
        const turret = this.loader.loadNode('Tower').clone();
        turret.getComponentOfType(Transform).translation = this.level_data.tower_places[1];
        turret.addComponent(new Turret(this.scene, turret, this.level_data.tower_places[this.chooseTowerPlace(this.click_ray)]));
        this.scene.addChild(turret);
    }

    chooseTowerPlace(raycast) {
        // TODO: collision detection for tower places with raycast
        const tower_place = this.level_data.tower_places[0];
        console.log(raycast);
        return 3;
    }

    spawnShip() {
        if (this.ship_counter < 10) {
            const ship = this.loader.loadNode('Ship01').clone();
            ship.addComponent(new Ship(100, 10, 50, 10, this.level_data.path, ship, this));
            this.scene.addChild(ship);
            this.ship_counter++;
        } else if (this.ship_counter < 15) {
            const ship = this.loader.loadNode('Ship02').clone();
            ship.addComponent(new Ship(200, 7, 100, 50, this.level_data.path, ship, this));
            this.scene.addChild(ship);
            this.ship_counter++;
        } else {
            this.ship_counter = 0;
        }
    }
}
