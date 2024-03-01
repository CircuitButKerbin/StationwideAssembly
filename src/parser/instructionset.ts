import { MalformedInstructionError } from "./errors";

class GenericOperand {
    type: OpType;
    value: string | number | Array<number> | Memory;
    constructor (OperandType: OpType, OperandValue: string | number | Array<number> | Memory) {
        this.type = OperandType;
        this.value = OperandValue;
    }
}

class ValidRegisters {
    static readonly RegisterList: Array<{name : string, value : number}> = [
        {name: "R0", value: 0},
        {name: "R1", value: 1},
        {name: "R2", value: 2},
        {name: "R3", value: 3},
        {name: "R4", value: 3},
        {name: "R5", value: 4},
        {name: "R6", value: 5},
        {name: "R7", value: 6},
        {name: "R8", value: 7},
        {name: "R9", value: 8},
        {name: "R10", value: 10},
        {name: "R11", value: 11},
        {name: "R12", value: 12},
        {name: "R13", value: 13},
        {name: "R14", value: 14},
        {name: "R15", value: 15},
        {name: "SP", value: 16},
        {name: "RA", value: 17},
    ]
}

enum OpType {
    Register,
    Immediate,
    Memory,
    Label,
}

class Register extends GenericOperand {
    constructor (RegisterName: string) {
        super(OpType.Register, RegisterName)
    }
}

class Immediate extends GenericOperand {
    constructor (ImmediateValue: number) {
        super(OpType.Immediate, ImmediateValue.toString())
    }
}

class Label extends GenericOperand {
    constructor (LabelName: string) {
        super(OpType.Label, LabelName)
    }
}

class Memory {
    base: number;
    index: Register | null;
    scale: number;
    constructor (MemoryBase: number, MemoryIndex: Register | null, MemoryScale: number) {
        this.base = MemoryBase;
        this.index = MemoryIndex;
        this.scale = MemoryScale;
    }

}

class MemoryReference extends GenericOperand {
    constructor (MemoryReference: Memory) {
        super(OpType.Memory, MemoryReference)
    } 
}


class InstructionTemplate {
    Name: string;
    ArgCount: number;
    ValidArgTypes: Array<Array<OpType>> = [];
    constructor (InstructionName: string, ArgCount: number, ValidArgumentTypes: Array<Array<OpType>>) {
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
        new InstructionTemplate("MOV", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("ADD", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("SUB", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("MUL", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("DIV", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("AND", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("OR", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("XOR", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("NOT", 2, [[OpType.Register, OpType.Immediate, OpType.Memory],[OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JMP", 1, [[OpType.Label]]),
        new InstructionTemplate("BNE", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Label]]),
        new InstructionTemplate("BEQ", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Label]]),
        new InstructionTemplate("BGT", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Label]]),
        new InstructionTemplate("BGE", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Label]]),
        new InstructionTemplate("BLT", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Label]]),
        new InstructionTemplate("BLE", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Label]]),
        new InstructionTemplate("JAL", 1, [[OpType.Label]]),
        new InstructionTemplate("LBN", 4, [[OpType.Register], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Immediate], [OpType.Immediate, OpType.Immediate]]),
    ]
}

/***
 * Internally, IC10 uses a string to specify what logic type to read in the l dx, *var* instruction
 * This limits the ability to dynamically read different values from a device in the same instruction
 * requiring the user to write multiple instructions to read different values from the same device, instead of being able to iterate over a list of device attributes
 * In theory, we could initalize a jumptable with all the different possible read instructions, but this would consume a hefty chunk of our avaliable instruction space
 * So here we handle these as enums for ease of handling (instead of creating an operand type specifically for this, which would require a lot of refactoring)
 * Before compiling to the final IC10 instruction set, we will convert these enums to their string representations
 * This is why the load instructions have these variables set as an Immediate only, instead of Immediate | Register
 */
class IC10Statics {
    static readonly DeviceAttributes : Array<[string, number]>= [
        ["Temperature", 0x1],
        ["Pressure", 0x2],
        ["Setting", 0x3], 
    ]
}
//#TODO: Add all SASM instructions
class ValidSASMInstructions {
    static readonly InstructionList: Array<any> = [
        new InstructionTemplate("MOV", 2, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("ADD", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("SUB", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("MUL", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("DIV", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("AND", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("OR", 3,  [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("XOR", 3, [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("NOT", 2, [[OpType.Register, OpType.Immediate, OpType.Memory],[OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JMP", 1, [[OpType.Label]]),
        new InstructionTemplate("JE", 3,  [[OpType.Register, OpType.Immediate, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JNE", 3, [[OpType.Register, OpType.Immediate, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JG", 3,  [[OpType.Register, OpType.Immediate, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JGE", 3, [[OpType.Register, OpType.Immediate, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),    
        new InstructionTemplate("JL", 3,  [[OpType.Register, OpType.Immediate, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JLE", 3, [[OpType.Register, OpType.Immediate, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JZ", 2,  [[OpType.Register, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JNZ", 2, [[OpType.Register, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JGZ", 2, [[OpType.Register, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("JLZ", 2, [[OpType.Register, OpType.Label], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("CALL", 1,[[OpType.Label]]),
        new InstructionTemplate("RET", 0, []),
        new InstructionTemplate("PUSH", 1,[[OpType.Register]]),
        new InstructionTemplate("POP", 1, [[OpType.Register]]),
        new InstructionTemplate("PEEK", 1,[[OpType.Register]]),
        new InstructionTemplate("YIELD",0,[]),
        //load batch named
        new InstructionTemplate("LBN", 4, [[OpType.Register], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Immediate], [OpType.Immediate]]),
        //load batch
        new InstructionTemplate("LB", 3, [[OpType.Register], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Immediate], [OpType.Immediate]]),
        new InstructionTemplate("SET", 3 , [[OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory], [OpType.Register, OpType.Immediate, OpType.Memory]]),
        new InstructionTemplate("DEC", 1, [[OpType.Register]]),
        new InstructionTemplate("INC", 1, [[OpType.Register]]),
    ]
}


class IC10Instruction {
    InstructionName: string;
    Operands: Array<GenericOperand>;
    Label: string;
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
            if (Operands.length != ValidInstruction.ArgCount) {
                throw new MalformedInstructionError(`Instruction ${InstructionName} requires ${ValidInstruction.ArgCount} arguments!`)
            }
            this.Operands = Operands;
            this.InstructionName = InstructionName;
        }
    }
}

export { ValidRegisters, IC10Instruction, SASMInstruction, OpType as OperandTypes, Register, Immediate, Label, GenericOperand, Memory, MemoryReference }