export class Timer {
    constructor() {
        this.startTime = 0;
        this.endTime = 0;
    }
    start() {
        this.startTime = performance.now();
    }
    stop() {
        this.endTime = performance.now();
        return Math.round(this.endTime - this.startTime);
    }
    reset() {
        this.startTime = 0;
        this.endTime = 0;
    }
}
