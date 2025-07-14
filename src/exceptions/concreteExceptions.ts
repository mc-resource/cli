export class ConcreteFileNotFoundException extends Error {
    name = 'ConcreteFileNotFoundException';
    message =
        'Cannot find concrete.json file on the current path. are you sure mcr is initialized for the directory? (mcr init)';
    constructor() {
        super();
        Object.setPrototypeOf(this, ConcreteFileNotFoundException.prototype);
    }
}
export class ConcreteFileAlreadyExistsException extends Error {
    name = 'ConcreteFileAlreadyExistsException';
    message =
        'concrete.json file already exists in the current directory. for overwriting it, use the --force flag.';
    constructor() {
        super();
        Object.setPrototypeOf(this, ConcreteFileAlreadyExistsException.prototype);
    }
}
export class InvalidConcreteFileException extends Error {
    name = 'InvalidConcreteFileException';
    message =
        'Cannot parse concrete.json file. please check concrete.json file for any syntax/structure mistakes.';
    constructor() {
        super();
        Object.setPrototypeOf(this, InvalidConcreteFileException.prototype);
    }
}
