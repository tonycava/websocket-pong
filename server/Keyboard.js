export class Keyboard {
    static getAxis(keys) {

        if (keys["ArrowUp"]) return -1;
        if (keys["ArrowDown"]) return 1;
        return 0;
    }
}