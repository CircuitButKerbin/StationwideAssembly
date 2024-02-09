import * as InstructionSet from "./instructionset";
import * as ParserErrors from "./errors";
import { Label } from "./instructionset";
import { GenericOperand } from "./instructionset";

class pesudoProgram {
    definedlabels : Array<string> = []
    instructions : Array<pesudoInstruction> = []
}
class pesudoInstruction {
    label : null | string = null;
    instruction : null | string = null;
    operands : Array<string> = []
    constructor(label : null | string, instruction : null | string, operands : Array<string>) {
        this.label = label;
        this.instruction = instruction;
        this.operands = operands;
    }
}

class SASMProgram {
    instructions : Array<InstructionSet.SASMInstruction> = []
    labelTokens : Array<string> = []
}

class CompilerDirective {
    name : string = ""
    value : any;
    constructor(name : string, value : any) {
        this.name = name;
        this.value = value;
    }
}

class parser {
    /**
     * Take in an string to pre-process before parsing
     * @param input 
     */
    public static parseString(input : string) : SASMProgram {
        return this.parsePreProcessedString(this.preProcessString(input));
    }

    private static preProcessString(input : string) : pesudoProgram {
        /**Split into an iterable*/
        let inputArray = input.split("\n");
        /**Remove empty strings */
        inputArray = inputArray.filter((line) => {
            return line != "";
        });
        /**Remove comments*/
        inputArray = inputArray.map((line) => {
            return line.split(";")[0];
        });
        /**Remove empty lines*/
        inputArray = inputArray.filter((line) => {
            return line != "";
        });
        /**Remove leading and trailing whitespace*/
        inputArray = inputArray.map((line) => {
            return line.trim();
        });
        /**Remove whitespace, commas between operands and instructions and replace with \0 */
        inputArray = inputArray.map((line) => {
            return line.replace(/(,|\s)+/g, "\0");
        });
        /**Look for any compiler directives (a line starting with %)*/
        let directiveArray = inputArray.map((line) => {
            return line.match(/^%/);
        });
        /**Remove null values in directiveArray*/
        directiveArray = directiveArray.filter((line) => {
            return line != null;
        });
        /**Format the directives*/
        let directives : Array<CompilerDirective> = []
        for (let i = 0; i < directiveArray.length; i++) {
            let tmp = directiveArray[i].input.split('\0')
            directives.push(new CompilerDirective(tmp[0].replace("%", ""), tmp.splice(1)));
        }
        /**find any alias directives, and replace any references to it with it's value*/
        let aliasDirective = directives.find((directive) => {
            return directive.name == "alias";
        });
        if (aliasDirective != undefined) {
            for (let i = 0; i < inputArray.length; i++) {
                if (inputArray[i].indexOf(aliasDirective.value[0]) != -1) {
                    inputArray[i] = inputArray[i].replace(aliasDirective.value[0], aliasDirective.value[1]);
                }
            }
        }
        console.log(inputArray);
        /**Remove compiler directives */
        inputArray = inputArray.filter((line) => {
            return line.indexOf('%') == -1;
        });
        /**Remove empty lines*/
        inputArray = inputArray.filter((line) => {
            return line != "";
        });
        
        let processedinput : pesudoProgram = new pesudoProgram
        for (let i = 0; i < inputArray.length; i++) {
            //check if their is a label
            let label : null | string = null;
            let instruction : null | string = null;
            if (inputArray[i].indexOf(':') != -1) {
                label = inputArray[i].split(":")[0];
                processedinput.definedlabels.push(label);
                instruction = inputArray[i].split(":")[1].trim();
            } else {
                label = null
                instruction = inputArray[i];
            }
            //remove any '' from the array
            let instructionArray = instruction.split("\0").filter((line) => {
                return line != "";
            });
            if (instructionArray.length == 1) {
                processedinput.instructions.push(new pesudoInstruction(label, instructionArray[0], []));
            } else {
                processedinput.instructions.push(new pesudoInstruction(label, instructionArray[0], instructionArray.slice(1)));
            }
        }
        return processedinput;
    }

    private static parsePreProcessedString(input : pesudoProgram) : SASMProgram {
        let DefinedLabels = input.definedlabels;
        //Convert labels to smaller tokens
        let labelTokens : Array<string> = [];
        let labelTokenIndex = 0;
        for (let i = 0; i < DefinedLabels.length; i++) {
            labelTokenIndex++;
            //convert the tokenindex to base36
            let base36Token = labelTokenIndex.toString(36);
            labelTokens.push('_' + base36Token);
        }
        let proccessedLines : Array<InstructionSet.SASMInstruction>= [];
        let instructions : Array<pesudoInstruction> = input.instructions;
        
        for (let i = 0; i < instructions.length; i++) {
            let tokenizedLabel : null | string;
            let parsedInstruction : InstructionSet.SASMInstruction = null;
            if (instructions[i] != null) {
                if (instructions[i].instruction != null) {
                    parsedInstruction = this.parsePesudoInstruction(instructions[i], DefinedLabels, labelTokens);
                }
                if (instructions[i].label != null) {
                    //@ts-ignore
                    let indexer : string = instructions[i].label != null ? instructions[i].label : "null";
                    tokenizedLabel = labelTokens[DefinedLabels.indexOf(indexer)];
                    parsedInstruction.Label = tokenizedLabel;
                }

            }
            proccessedLines.push(parsedInstruction);
        }
        let parsedProgram : SASMProgram = new SASMProgram;
        parsedProgram.instructions = proccessedLines;
        parsedProgram.labelTokens = labelTokens;
        return parsedProgram;
    }

    private static parsePesudoInstruction(instruction : pesudoInstruction , definedlabels : Array<string>, tokenizedlabels : Array<string>) {
        console.log(`Parsing instruction: ${instruction.instruction} with operands: ${instruction.operands}`)
        let parsedOperands: Array<InstructionSet.GenericOperand> = [];
        for (let i = 0; i < instruction.operands.length; i++) {
            let operand = this.parseOperand(instruction.operands[i], definedlabels);
            console.log(`Parsed operand: ${operand.type} with value: ${operand.value}`)
            console.log(operand)
            if (operand != null) {
                parsedOperands.push(operand);
            } else {
                throw new ParserErrors.MalformedOperandError('\"' + instruction.operands[i] + '\"');
            }
        }
        if (parsedOperands.find((operand) => {
            return operand instanceof InstructionSet.Label;
        }) != null ) {
            //covert the label to a tokenized label
            let label = parsedOperands.find((operand) => {
                return operand instanceof InstructionSet.Label;
            });
            if (label != null) {
                let labelIndex = definedlabels.indexOf(label.value.toString());
                if (labelIndex != -1) {
                    parsedOperands.splice(labelIndex, 1, new InstructionSet.Label(tokenizedlabels[labelIndex]));
                } else {
                    throw new ParserErrors.UndefinedLabelError(label.value.toString());
                }
            }
        }
        if (instruction.instruction != null) {
            return new InstructionSet.SASMInstruction(instruction.instruction, parsedOperands);
        } else {
            throw new ParserErrors.MalformedInstructionError("null instruction type");
        }
    }
    private static parseOperand(operand : string, definedlabels : undefined | Array<string> ) : InstructionSet.GenericOperand | null {
        //Check if it's a register
        let register = InstructionSet.ValidRegisters.RegisterList.find((register) => {
            return register.name == operand;
        });
        if (register != undefined) {
            return new InstructionSet.Register (register.name);
        }
        //Check if it's a label
        if (definedlabels != undefined) {
            let label = definedlabels.find((label) => {
                return label == operand;
            });
            if (label != undefined) {
                return new InstructionSet.Label(label);
            }
        }
        //Check if it's a immediate
        let validPrefixes = ["0x", "0b", "0o", "0d"];
        let prefix : RegExpMatchArray | null | string = operand.match(/0x|0b|0o|0d/);

        if (prefix != null && prefix != undefined) {
            //See what base it 
            prefix = prefix[0];
            let base = 0;
            switch (prefix) {
                case "0x":
                    base = 16;
                case "0b":
                    base = 2;
                case "0o":
                    base = 8;
                case "0d":
                    base = 10;
            }
            //Remove the prefix and any underscores
            operand = operand.replace(prefix, "").replace(/_/g, "");
            //Check if it's a valid number
            return new InstructionSet.Immediate (parseInt(operand, base));   
        } else {
            //Assume it's decimal or float
            if ((null != operand.match(/\./)) || (null != operand.match(/e/)) || (null != operand.match(/E/))) {
                return new InstructionSet.Immediate (parseFloat(operand));
            } else if (!isNaN(parseInt(operand))) {
                return new InstructionSet.Immediate (parseInt(operand));
            }
        }
        throw new ParserErrors.MalformedOperandError('\"'+operand+'\"');
        return null;
    }
}
export { parser, SASMProgram };