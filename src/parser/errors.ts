enum ErrorType {
    MALIFORMED_INSTRUCTION = 'MALIFORMED_INSTRUCTION',
    UNDEFINED_ALIAS = 'UNDEFINED_ALIAS',
    UNDEFINED_EXTERNAL_CALL = 'UNDEFINED_EXTERNAL_CALL',
    UNDEFINED_LABEL = 'UNDEFINED_LABEL',
    MALIFORMED_OPERAND = 'MALIFORMED_OPERAND',
    INVALID_NUMBER_OF_OPERANDS = 'INVALID_NUMBER_OF_OPERANDS',
    OPERAND_TYPE_MISMATCH = 'OPERAND_TYPE_MISMATCH',
}

class GenericParserError extends Error {
    constructor(type: string, message: string) {
        super(message);
        this.name = (type === undefined || type == '' || !( typeof type == 'string')) ? "GenericParserError" : type;
    }
}

class MalformedInstructionError extends GenericParserError {
    constructor(message: string) {
        super(ErrorType.MALIFORMED_INSTRUCTION, message);
    }
}

class UndefinedAliasError extends GenericParserError {
    constructor(message: string) {
        super(ErrorType.UNDEFINED_ALIAS, message);
    }
}

class UndefinedExternalCallError extends GenericParserError {
    constructor(message: string) {
        super(ErrorType.UNDEFINED_EXTERNAL_CALL, message);
    }
}

class UndefinedLabelError extends GenericParserError {
    constructor(message: string) {
        super(ErrorType.UNDEFINED_LABEL, message);
    }
}

class MalformedOperandError extends GenericParserError {
    constructor(message: string) {
        super(ErrorType.MALIFORMED_OPERAND, message);
    }
}

class InvalidNumberOfOperandsError extends GenericParserError {
    constructor(message: string) {
        super(ErrorType.INVALID_NUMBER_OF_OPERANDS, message);
    }
}

class OperandTypeMismatchError extends GenericParserError {
    constructor(message: string) {
        super(ErrorType.OPERAND_TYPE_MISMATCH, message);
    }
}


export {ErrorType, GenericParserError, MalformedInstructionError, UndefinedAliasError, UndefinedExternalCallError, UndefinedLabelError, MalformedOperandError, InvalidNumberOfOperandsError, OperandTypeMismatchError}