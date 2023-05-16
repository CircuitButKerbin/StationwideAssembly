import { MalformedInstructionError } from "./errors";

class GenericOperand {
    type: OperandTypes;
    value: string | number | Array<number>;
    constructor (OperandType: OperandTypes, OperandValue: string | number | Array<number>) {
        this.type = OperandType;
        this.value = OperandValue;
    }
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

class Memory extends GenericOperand {
    constructor (MemoryAddress: number | Array<number>) {
        super(OperandTypes.Memory, MemoryAddress)
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
            throw "ValidArgumetnTypes must include all arguments!"
        }
    }
}

//#TODO: Add all IC10 instructions

class ValidIC10Instructions {
    static readonly StationeersVersion = "#Temp" // Last stationeers version this was updated at
    static readonly InstructionList: Array<any> = [
        new InstructionTemplate("MOV", 2, [[OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate]]),
        new InstructionTemplate("ADD", 2, [[OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate]]),
    ]
}

//#TODO: Add all SASM instructions

class ValidSASMInstructions {
    static readonly InstructionList: Array<any> = [
        new InstructionTemplate("MOV", 2, [[OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate]]),
        new InstructionTemplate("ADD", 2, [[OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate], [OperandTypes.Register, OperandTypes.Memory, OperandTypes.Immediate]]),
    ]
}



class IC10Instruction {
    private Operands: Array<GenericOperand>;
    constructor (InstructionName: string, Operands: Array<GenericOperand>) {s
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
    private Operands: Array<GenericOperand>;
    constructor (InstructionName: string, Operands: Array<GenericOperand>) {
        //Validate Instruction
        let ValidInstruction = ValidSASMInstructions.InstructionList.find((Instruction) => {
            return Instruction.Name == InstructionName
        });
        if (ValidInstruction === undefined) {
            throw new MalformedInstructionError(`Instruction ${InstructionName} is not a valid SASM instruction!`)
        }
    }
}

export { IC10Instruction, SASMInstruction, OperandTypes, Register, Immediate, Memory, Label, GenericOperand }