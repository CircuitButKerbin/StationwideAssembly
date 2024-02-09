import { MalformedInstructionError } from "./errors";

class GenericOperand {
    type: OperandTypes;
    value: string | number | Array<number>;
    constructor (OperandType: OperandTypes, OperandValue: string | number | Array<number>) {
        this.type = OperandType;
        this.value = OperandValue;
    }
}

class ValidRegisters {
    static readonly RegisterList: Array<{name : string, value : number}> = [
        {name: "RAX", value: 0},
        {name: "RBX", value: 1},
        {name: "RCX", value: 2},
        {name: "RDX", value: 3},
        {name: "R4", value: 4},
        {name: "R5", value: 5},
        {name: "R6", value: 6},
        {name: "R7", value: 7},
        {name: "R8", value: 8},
        {name: "R9", value: 9},
        {name: "R10", value: 10},
        {name: "R11", value: 11},
        {name: "R12", value: 12},
        {name: "R13", value: 13},
        {name: "R14", value: 14},
        {name: "RSP", value: 15},
        {name: "RRA", value: 16},
    ]
}

enum OperandTypes {
    Register,
    Immediate,
    Memory,
    Label,
}

class Register extends GenericOperand {
    constructor (RegisterName: string) {
        super(OperandTypes.Register, RegisterName)
    }
}

class Immediate extends GenericOperand {
    constructor (ImmediateValue: number) {
        super(OperandTypes.Immediate, ImmediateValue.toString())
    }
}

class Label extends GenericOperand {
    constructor (LabelName: string) {
        super(OperandTypes.Label, LabelName)
    }
}

class InstructionTemplate {
    Name: string;
    ArgCount: number;
    ValidArgTypes: Array<Array<OperandTypes>> = [];
    constructor (InstructionName: string, ArgCount: number, ValidArgumentTypes: Array<Array<OperandTypes>>) {
        this.Name = InstructionName
        if (ArgCount != ValidArgumentTypes.length) {
            throw `ValidArgumentTypes must include all arguments!\n ArgCount: ${ArgCount}\n ValidArgumentTypes: ${ValidArgumentTypes}\nInstructionName: ${InstructionName}`
        }
    }
}

//#TODO: Add all IC10 instructions

class ValidIC10Instructions {
    static readonly StationeersVersion = "#Temp" // Last stationeers version this was updated at
    static readonly InstructionList: Array<any> = [
        new InstructionTemplate("MOV", 2, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("ADD", 2, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
    ]
}

//#TODO: Add all SASM instructions

class ValidSASMInstructions {
    static readonly InstructionList: Array<any> = [
        new InstructionTemplate("MOV", 2, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("ADD", 3, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("SUB", 3, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("MUL", 3, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("DIV", 3, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("AND", 3, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("OR", 3, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("XOR", 3, [[OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("NOT", 2, [[OperandTypes.Register, OperandTypes.Immediate],[OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("JMP", 1, [[OperandTypes.Label]]),
        new InstructionTemplate("JE", 3, [[OperandTypes.Register, OperandTypes.Immediate, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("JNE", 3, [[OperandTypes.Register, OperandTypes.Immediate, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("JG", 3, [[OperandTypes.Register, OperandTypes.Immediate, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("JGE", 3, [[OperandTypes.Register, OperandTypes.Immediate, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),    
        new InstructionTemplate("JL", 3, [[OperandTypes.Register, OperandTypes.Immediate, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("JLE", 3, [[OperandTypes.Register, OperandTypes.Immediate, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("JZ", 2, [[OperandTypes.Register, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("JNZ", 2, [[OperandTypes.Register, OperandTypes.Label], [OperandTypes.Register, OperandTypes.Immediate]]),
        new InstructionTemplate("CALL", 1, [[OperandTypes.Label]]),
        new InstructionTemplate("RET", 0, []),
        new InstructionTemplate("PUSH", 1, [[OperandTypes.Register]]),
        new InstructionTemplate("POP", 1, [[OperandTypes.Register]]),
        new InstructionTemplate("PEEK", 1, [[OperandTypes.Register]]),
        new InstructionTemplate("YIELD", 0, []),

    ]
}



class IC10Instruction {
    private Operands: Array<GenericOperand>;
    constructor (InstructionName: string, Operands: Array<GenericOperand>) {
        //Validate Instruction
        let ValidInstruction = ValidIC10Instructions.InstructionList.find((Instruction) => {
            return Instruction.Name == InstructionName
        });
        if (ValidInstruction === undefined) {
            throw new MalformedInstructionError(`Instruction ${InstructionName} is not a valid IC10 instruction!`)
        }
    }
}

class SASMInstruction {
    InstructionName: string;
    Label: string;
    Operands: Array<GenericOperand>;
    constructor (InstructionName: string, Operands: Array<GenericOperand>) {
        //Validate Instruction
        let ValidInstruction = ValidSASMInstructions.InstructionList.find((Instruction) => {
            return Instruction.Name == InstructionName
        });
        if (ValidInstruction === undefined) {
            throw new MalformedInstructionError(`Instruction ${InstructionName} is not a valid SASM instruction!`)
        } else {
            this.Operands = Operands;
            this.InstructionName = InstructionName;
        }
    }
}

export { ValidRegisters, IC10Instruction, SASMInstruction, OperandTypes, Register, Immediate, Label, GenericOperand }