import {
    Transform,
    Primitive,
    Mesh,
    Model,
} from '../engine/core.js'

import { Ship } from './Ship.js'
import { Turret } from './Turret.js'

export class Game {
    constructor(loader, scene, canvas) {
        this.lives = 10;
        this.score = 0;
        this.chosen_tower_place = 0;
        this.turret_price = 100;
        this.money = this.turret_price;
        this.loader = loader;
        this.scene = scene;
        this.canvas = canvas;
        this.time_since_last_spawn = 0;
        this.spawn_rate = 300;
        this.ship_counter = 0;
        this.placed_towers = [];

        // controls
        this.enter_pressed = false;
        this.left_pressed = false;
        this.right_pressed = false;
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
        this.tower_places = [];
        for (let i = 0; i < this.level_data.tower_places.length; i++) {
            const temp_tower_place = this.loader.loadNode('TowerPlace').clone();
            temp_tower_place.getComponentOfType(Transform).translation = this.level_data.tower_places[i];
            this.scene.addChild(temp_tower_place);
            this.tower_places.push(temp_tower_place);
        }

        this.spawnShip();
    }

    update(t, dt) {
        // UI update
        document.querySelector('.time_number').innerHTML = Math.floor(t) + ' s';
        document.querySelector('.score_number').innerHTML = this.score;
        document.querySelector('.lives_number').innerHTML = this.lives;
        document.querySelector('.money_number').innerHTML = this.money;

        // controls
        if (this.enter_pressed) {
            this.placeTower();

            // move chosen tower place to the next open place
            while (this.placed_towers.includes(this.chosen_tower_place)) {
                this.chosen_tower_place++;
            }

            this.enter_pressed = false;
        } else if (this.left_pressed) {
            if (this.chosen_tower_place != 0) {
                this.chosen_tower_place--;

                // skip over placed towers
                while (this.placed_towers.includes(this.chosen_tower_place)) {
                    this.chosen_tower_place--;
                }
            }
            this.left_pressed = false;
        } else if (this.right_pressed) {
            if (this.chosen_tower_place != this.level_data.tower_places.length - 1) {
                this.chosen_tower_place++;

                // skip over placed towers
                while (this.placed_towers.includes(this.chosen_tower_place)) { 
                    this.chosen_tower_place++;
                }
            }
            this.right_pressed = false;
        }

        // Spawn ships at a rate that increases over time
        this.time_since_last_spawn += 100 * dt;
        if (this.time_since_last_spawn > this.spawn_rate) {
            this.time_since_last_spawn = 0;
            this.spawn_rate *= 0.99;
            this.spawnShip();
        }

        if (this.placed_towers.length == this.level_data.tower_places.length) {
            console.log('You win!');
            this.loader.loadNode('TowerPlaceChosen').destroy();
            // TODO: show win screen
            return;
        }

        // FIX: this is only for testing
        const turret = this.loader.loadNode('Tower').clone();
        turret.getComponentOfType(Transform).translation = this.level_data.tower_places[1];
        turret.addComponent(new Turret(this.scene, turret, this.level_data.tower_places[5], this.loader));
        this.scene.addChild(turret);

        this.chosenPlace();
    }

    chosenPlace() {
        // move chosen tower place to the chosen place
        const temp_tower_place_chosen = this.loader.loadNode('TowerPlaceChosen');
        temp_tower_place_chosen.getComponentOfType(Transform).translation = this.level_data.tower_places[this.chosen_tower_place];
        temp_tower_place_chosen.getComponentOfType(Transform).translation[1] = 1;
    }

    placeTower() {
        // if (this.money < this.turret_price) {
        //     return;
        // }
        // this.money -= this.turret_price;

        this.placed_towers.push(this.chosen_tower_place);

        // this.chooseTowerPlace(this.click_ray);
        const turret = this.loader.loadNode('Tower').clone();
        turret.getComponentOfType(Transform).translation = this.level_data.tower_places[1];
        turret.addComponent(new Turret(this.scene, turret, this.level_data.tower_places[this.chosen_tower_place], this.loader));
        this.scene.addChild(turret);
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
