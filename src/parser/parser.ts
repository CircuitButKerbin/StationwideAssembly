import * as InstructionSet from "./instructionset";
import * as ParserErrors from "./errors";

class parser {
    /**
     * Returns a GenericOperand object from a string
     * @param operandString Operand string to parse
     */
    public parseOperandString(operandString: string): InstructionSet.GenericOperand {
        let str = operandString.trim();
        let operand: InstructionSet.GenericOperand;
        if (str.indexOf('[') != -1) {
            // Memory operand
            let memoryIndex: string | Array<string> = str.substring(str.indexOf('[') + 1, str.indexOf(']') - 1);
            if (str.indexOf('+') != -1) {
                // Memory operand with offset
                memoryIndex = memoryIndex.split('+');
                if (memoryIndex.length > 2) {
                    throw new ParserErrors.MalformedOperandError("Memory operand with offset has more than 2 parts");
                } else {
                    operand = new InstructionSet.Memory([memoryIndex[0], memoryIndex[1]]);
                }
            }
        }
    }

    public parseInstructionString(instructionString: str): SASMInstruction {

    }
}