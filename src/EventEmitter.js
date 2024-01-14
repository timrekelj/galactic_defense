class EvnetEmitter{
    constructor() {
        this.listeners = {}
    }

    //listen for new events
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        this.listeners[event].push(callback)
    }

    //triger new event
    emit(event, ...args) {
        console.log("event:");
        console.log(event);
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(...args))
        }
    }
}


//this makes sure that event emitter will be shared amongst all component that call it
const commonEventEmitter = new EvnetEmitter();

export default commonEventEmitter;