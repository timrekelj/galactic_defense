export class Turret {
    constructor(path, parent) {
        this.rotation_speed = 10;
        this.parent = parent;
        this.parent.getComponentOfType(Transform).translation = [...this.path[0]];
    }

    update(t, dt) {
        this.rotate(dt);
    }

    rotate(dt) {

    }
}
