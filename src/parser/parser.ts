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

class Expression {
    a : number | string | Expression;
    b : number | string | Expression;
    operation : string;
    constructor(operation : string, a: number | string | Expression, b: number | string | Expression) {
        this.operation = operation;
        this.a = a;
        this.b = b;
    }
    /**
     * evaluate the expression
     */
    public evaluate(definedVariables : Array<[string, number]>) {
        return parser.solveExpression(this, definedVariables);
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

    public static parseExpression(input : string) : Expression {
        input = input.replace(/\s/g, "");
        console.log(input)
        let expressionTokens: Array<string | Expression> = [];
        while (input.length > 0) {
            let res = input.match(/\/|\*|\+|\-|\(|\)/g);
            if (res != null) {
                let index = input.indexOf(res[0]);
                expressionTokens.push(input.slice(0, index));
                expressionTokens.push(res[0]);
                input = input.slice(index + 1);
            }
            else {
                expressionTokens.push(input);
                input = "";
            }
        }
        while (expressionTokens.indexOf("(") != -1) {
            let index = expressionTokens.indexOf("(");
            let endIndex = expressionTokens.indexOf(")", index);
            let expression = expressionTokens.slice(index + 1, endIndex);
            let tmp = this.parseExpression(expression.join(""));
            expressionTokens.splice(index, endIndex - index + 1, tmp);
        }
        expressionTokens = expressionTokens.filter((line) => {
            return line != '';
        });
        console.log(expressionTokens);
        while (expressionTokens.indexOf("*") != -1) {
            let index = expressionTokens.indexOf("*");
            let a = expressionTokens[index - 1];
            let b = expressionTokens[index + 1];
            let expression = new Expression("*", a, b);
            expressionTokens.splice(index - 1, 3, expression);
        }
        while (expressionTokens.indexOf("/") != -1) {
            let index = expressionTokens.indexOf("/");
            let a = expressionTokens[index - 1];
            let b = expressionTokens[index + 1];
            let expression = new Expression("/", a, b);
            expressionTokens.splice(index - 1, 3, expression);
        }
        while (expressionTokens.indexOf("+") != -1) {
            let index = expressionTokens.indexOf("+");
            let a = expressionTokens[index - 1];
            let b = expressionTokens[index + 1];
            let expression = new Expression("+", a, b);
            expressionTokens.splice(index - 1, 3, expression);
        }
        while (expressionTokens.indexOf("-") != -1) {
            let index = expressionTokens.indexOf("-");
            let a = expressionTokens[index - 1];
            let b = expressionTokens[index + 1];
            let expression = new Expression("-", a, b);
            expressionTokens.splice(index - 1, 3, expression);
        }
        if (expressionTokens.length == 1) {
            return expressionTokens[0] as Expression;
        } else {
            throw "Malformed expression";
        }
    }
    public static solveExpression(expression : Expression, definedVariables : Array<[string, number]>) : number {
        while (expression.a instanceof Expression || expression.b instanceof Expression) {
            if (expression.a instanceof Expression) {
                expression.a = this.solveExpression(expression.a, definedVariables);
            }
            if (expression.b instanceof Expression) {
                expression.b = this.solveExpression(expression.b, definedVariables);
            }
        }
        if (typeof expression.a == "string") {
            console.log(definedVariables)
            console.log(expression.a)
            let variable = definedVariables.find((variable) => {
                return variable[0] == expression.a;
            });
            if (variable != undefined) {
                expression.a = variable[1];
            } else {
                if (!isNaN(parseInt(expression.a))) {
                    expression.a = parseInt(expression.a);
                } else if (!isNaN(parseFloat(expression.a))) {
                    expression.a = parseFloat(expression.a);
                } else {
                    throw `Undefined variable: ${expression.a}`;
                }
            }
        }
        if (typeof expression.b == "string") {
            console.log(definedVariables)
            console.log(expression.b)
            let variable = definedVariables.find((variable) => {
                return variable[0] == expression.b;
            });
            if (variable != undefined) {
                expression.b = variable[1];
            } else {
                if (!isNaN(parseInt(expression.b))) {
                    expression.b = parseInt(expression.b);
                } else if (!isNaN(parseFloat(expression.b))) {
                    expression.b = parseFloat(expression.b);
                } else {
                    throw `Undefined variable: ${expression.a}`;
                }
            }
        }
        switch (expression.operation) {
            case "+":
                return expression.a as number + expression.b as number;
            case "-":
                return expression.a as number - expression.b as number;
            case "*":
                return expression.a as number * expression.b as number;
            case "/":
                return expression.a as number / expression.b as number;
        }
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
                    console.log(`Replacing label: ${label.value} with token: ${tokenizedlabels[labelIndex]}`);
                    parsedOperands.splice(labelIndex - ((1 < parsedOperands.length) ? 0 : 1), 1, new InstructionSet.Label(tokenizedlabels[labelIndex]));
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

    private static parseImmediateValue(operand : string) : InstructionSet.Immediate {
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
        return null;
    }

    private static parseRegister(operand : string) : InstructionSet.Register | null {
        let register = InstructionSet.ValidRegisters.RegisterList.find((register) => {
            return register.name == operand;
        });
        if (register != undefined) {
            return new InstructionSet.Register (register.name);
        } else {
            return null;
        }
    }
    private static parseOperand(operand : string, definedlabels : undefined | Array<string> ) : InstructionSet.GenericOperand | null {
        //Check if it's a register
        let register = this.parseRegister(operand);
        if (register != null) {
            return register;
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
        // Check if it's a memory reference
        let memoryReference = operand.match(/\[.*\]/);
        if (memoryReference != null) {
            let reference = memoryReference[0].replace(/[\[\]]/g, "").replace(/\s/g, "");
            if (reference.indexOf("+") == -1 && reference.indexOf("*") == -1) {
                let register = this.parseRegister(reference);
                if (register != null) {
                    return new InstructionSet.MemoryReference(new InstructionSet.Memory(0, register, 1));
                }
                let immediate = this.parseImmediateValue(reference);
                if (immediate != null) {
                    return new InstructionSet.MemoryReference(new InstructionSet.Memory(immediate.value as number, null, 0));
                }
            } else {
                let expressedReference = parser.parseExpression(reference);
                if (expressedReference.a instanceof Expression || expressedReference.b instanceof Expression) {
                    //reg*scale + offset
                    if (expressedReference.a instanceof Expression && expressedReference.b instanceof Expression) {
                        throw new ParserErrors.MalformedOperandError('\"'+operand+'\"');
                    }
                    let multExpression : Expression;
                    if (expressedReference.a instanceof Expression) {
                        //reg*scale + offset
                        if (expressedReference.a.operation == "*") {
                            multExpression = expressedReference.a;
                            if (parser.parseRegister(multExpression.a as string) != null) {
                                let offset = this.parseImmediateValue(expressedReference.b as string).value as number;
                                let scale = this.parseImmediateValue(multExpression.b as string).value as number;
                                return new InstructionSet.MemoryReference(new InstructionSet.Memory(offset, parser.parseRegister(multExpression.a as string), scale));
                            }
                            if (parser.parseRegister(multExpression.b as string) != null) {
                                let offset = this.parseImmediateValue(expressedReference.b as string).value as number;
                                let scale = this.parseImmediateValue(multExpression.a as string).value as number;
                                return new InstructionSet.MemoryReference(new InstructionSet.Memory(offset, parser.parseRegister(multExpression.b as string), scale));
                            } else {
                                throw new ParserErrors.MalformedOperandError('\"'+operand+'\"');
                            }
                        }
                    } else if (expressedReference.b instanceof Expression){
                        //offset + reg*scale
                        if (expressedReference.b.operation == "*") {
                            multExpression = expressedReference.b;
                            if (parser.parseRegister(multExpression.a as string) != null) {
                                let offset = this.parseImmediateValue(expressedReference.a as string).value as number;
                                let scale = this.parseImmediateValue(multExpression.b as string).value as number;
                                return new InstructionSet.MemoryReference(new InstructionSet.Memory(offset, parser.parseRegister(multExpression.a as string), scale));
                            }
                            if (parser.parseRegister(multExpression.b as string) != null) {
                                let offset = this.parseImmediateValue(expressedReference.a as string).value as number;
                                let scale = this.parseImmediateValue(multExpression.a as string).value as number;
                                return new InstructionSet.MemoryReference(new InstructionSet.Memory(offset, parser.parseRegister(multExpression.b as string), scale));
                            } else {
                                throw new ParserErrors.MalformedOperandError('\"'+operand+'\"');
                            }
                        } 
                    }
                }
                if (expressedReference.operation == "+") {
                    if (parser.parseRegister(expressedReference.a as string) != null) {
                        let offset = this.parseImmediateValue(expressedReference.b as string).value as number;
                        return new InstructionSet.MemoryReference(new InstructionSet.Memory(offset, parser.parseRegister(expressedReference.a as string), 1));
                    }
                    if (parser.parseRegister(expressedReference.b as string) != null) {
                        let offset = this.parseImmediateValue(expressedReference.a as string).value as number;
                        return new InstructionSet.MemoryReference(new InstructionSet.Memory(offset, parser.parseRegister(expressedReference.b as string), 1));
                    } else {
                        throw new ParserErrors.MalformedOperandError('\"'+operand+'\"');
                    }

                }
                if (expressedReference.operation == "*") {
                    //reg*scale
                    if (parser.parseRegister(expressedReference.a as string) != null) {
                        let scale = this.parseImmediateValue(expressedReference.b as string).value as number;
                        return new InstructionSet.MemoryReference(new InstructionSet.Memory(0, parser.parseRegister(expressedReference.a as string), scale));
                    }
                    if (parser.parseRegister(expressedReference.b as string) != null) {
                        let scale = this.parseImmediateValue(expressedReference.a as string).value as number;
                        return new InstructionSet.MemoryReference(new InstructionSet.Memory(0, parser.parseRegister(expressedReference.b as string), scale));
                    } else {
                        throw new ParserErrors.MalformedOperandError('\"'+operand+'\"');
                    }
                }
            }
        }
        //Check if it's a immediate
        let immediate = this.parseImmediateValue(operand);
        if (immediate != null) {
            return immediate;
        }
        throw new ParserErrors.MalformedOperandError('\"'+operand+'\"');
        return null;
    }
}

class IC10Program {
    instructions : Array<InstructionSet.IC10Instruction> = []
}

class Utility {
    public hash(data: string) : number {    
        let hash = 0xFFFFFFFF
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < 8; j++) {
                if ((hash & 1) == 1) {
                    hash = (hash >>> 1) ^ 0xEDB88320;
                } else {
                    hash = hash >>> 1;
                }
            }
        }
        hash = ~hash;
        hash = hash & 0xFFFFFFFF;
        //signed 32 bit truncation
        if (hash & 0x80000000) {
            hash = -hash + 1
        }
        return hash;
    }
}
class compiler {
    private convertMemoryRef = {
        /**
         * Converts a compact memory reference to a series of instructions
         */
        convertMemoryRef : (referenceData: InstructionSet.Register | number, memoryReference : InstructionSet.MemoryReference, isWrite : boolean) : Array<InstructionSet.IC10Instruction> => {
            let code : Array<InstructionSet.IC10Instruction> = [];
            let memory = memoryReference.value as InstructionSet.Memory;
            if (isWrite) {
                if (memory.index != null) {
                    if (memory.scale != 1) {
                        code.push(new InstructionSet.IC10Instruction("MUL", [memory.index, memory.index, new InstructionSet.Immediate(memory.scale)]));
                    }
                    if (memory.base != 0) {
                        code.push(new InstructionSet.IC10Instruction("ADD", [memory.index, memory.index, new InstructionSet.Immediate(memory.base)]));
                    }
                    code.push(new InstructionSet.IC10Instruction("POKE", [memory.index, referenceData instanceof InstructionSet.Register ? referenceData : new InstructionSet.Immediate(referenceData as number)]));
                    if (memory.scale != 1) {
                        code.push(new InstructionSet.IC10Instruction("SUB", [memory.index, memory.index, new InstructionSet.Immediate(memory.base)]));
                    }
                    if (memory.base != 0) {
                        code.push(new InstructionSet.IC10Instruction("DIV", [memory.index, memory.index, new InstructionSet.Immediate(memory.scale)]));
                    }
                } else {
                    code.push(new InstructionSet.IC10Instruction("POKE", [new InstructionSet.Immediate(memory.base), referenceData instanceof InstructionSet.Register ? referenceData : new InstructionSet.Immediate(referenceData as number)]);
                }
            } else {
                if (memory.index != null) {
                    //Increment the stack pointer to write to the correct address (PEEK or POP in IC10 is decrement then read)
                    //Basically, peek reads [SP-1] and pop reads [SP-1] then decrements SP by 
                    //It makes sense i guess?? but why not just add a instruction to read from a address instead of needing to manipulate the SP register
                    //Poke doens't have this issue (it supports being fed zero without crashing since it just writes to [RX] and doesn't mess with SP
                    //sorry for the criminal formatting
                    code.push(new InstructionSet.IC10Instruction("ADD", [new InstructionSet.Register("SP"), new InstructionSet.Register("SP"), new InstructionSet.Immediate(1)]));
                    if (memory.scale != 1)                     {code.push(new InstructionSet.IC10Instruction("MUL", [memory.index, memory.index, new InstructionSet.Immediate(memory.scale)]));} // [RX*scale]
                    if (memory.base != 0)                      {code.push(new InstructionSet.IC10Instruction("ADD", [memory.index, memory.index, new InstructionSet.Immediate(memory.base)]));}// [RX*scale+base]
                    if (memory.scale != 1 || memory.base != 0) {code.push(new InstructionSet.IC10Instruction("ADD", [new InstructionSet.Register("SP"), new InstructionSet.Register("SP"), memory.index]));                    // PEEK (dst)
                    }
                    if (!(referenceData instanceof InstructionSet.Register)) { throw new ParserErrors.MalformedOperandError("Cannot write a memory read result into an immediate!")}
                    code.push(new InstructionSet.IC10Instruction("PEEK", [referenceData instanceof InstructionSet.Register ? referenceData : new InstructionSet.Immediate(referenceData as number)]));
                    if (memory.scale != 1 || memory.base != 0) {code.push(new InstructionSet.IC10Instruction("SUB", [new InstructionSet.Register("SP"), new InstructionSet.Register("SP"), memory.index]));}
                    if (memory.base != 0)                      {code.push(new InstructionSet.IC10Instruction("SUB", [memory.index, memory.index, new InstructionSet.Immediate(memory.base)]));}
                    if (memory.scale != 1)                     {code.push(new InstructionSet.IC10Instruction("DIV", [memory.index, memory.index, new InstructionSet.Immediate(memory.scale)]));}
                    code.push(new InstructionSet.IC10Instruction("SUB", [new InstructionSet.Register("SP"), new InstructionSet.Register("SP"), new InstructionSet.Immediate(1)]));
                    } else { // [base]
                    code.push(new InstructionSet.IC10Instruction("ADD", [referenceData instanceof InstructionSet.Register ? referenceData : new InstructionSet.Immediate(1)])); // sp++ because reasons
                    code.push(new InstructionSet.IC10Instruction("ADD", [new InstructionSet.Register("SP"), new InstructionSet.Register("SP"), new InstructionSet.Immediate(memory.base)])); // sp+=base
                    if (!(referenceData instanceof InstructionSet.Register)) { throw new ParserErrors.MalformedOperandError("Cannot write a memory read result into an immediate!")} // anger
                    code.push(new InstructionSet.IC10Instruction("PEEK", [referenceData instanceof InstructionSet.Register ? referenceData : new InstructionSet.Immediate(referenceData as number)])); // PEEK (dst)
                    code.push(new InstructionSet.IC10Instruction("SUB", [new InstructionSet.Register("SP"), new InstructionSet.Register("SP"), new InstructionSet.Immediate(memory.base)])); // sp-=base
                    code.push(new InstructionSet.IC10Instruction("SUB", [referenceData instanceof InstructionSet.Register ? referenceData : new InstructionSet.Immediate(1)])); // sp--
                }
            }
            return code;
        }
    }

    private instructionConversionTable = {
        LBN: (instruction : InstructionSet.SASMInstruction) : Array<InstructionSet.IC10Instruction>  => {
            let code: Array<InstructionSet.IC10Instruction> = [];
            let operands = instruction.Operands;
            return code;    
        }
    }



    compile(program : SASMProgram) : IC10Program {
        let compiledProgram : IC10Program = new IC10Program;
        for (let i = 0; i < program.instructions.length; i++) {
            let instruction = program.instructions[i];
            let compiledInstruction = this.compileInstruction(instruction);
            compiledProgram.instructions.push(compiledInstruction);
        }
        return compiledProgram;
    }
    compileInstruction(instruction : InstructionSet.SASMInstruction) : InstructionSet.IC10Instruction {
        let compiledInstruction : InstructionSet.IC10Instruction;
        let instructionName = instruction.InstructionName;
        let instructionFunction : any | Function = this.instructionConversionTable[instructionName as keyof typeof this.instructionConversionTable];
        if (instructionFunction != undefined) {
            let label = instruction.Label;
            compiledInstruction = instructionFunction(instruction);
            if (label != undefined) {
                compiledInstruction.Label = label;
            }
        } else {
            throw new ParserErrors.MalformedInstructionError(instructionName);
        }
        return compiledInstruction;
    }
}


export { parser, SASMProgram };