import { OperandTypes, SASMInstruction } from './parser/instructionset';
import { parser, SASMProgram } from './parser/parser'

const input = 
`
       %alias yieldTime 0x5
start: LOAD RAX, 0x1, 0x2, 0x3 ; Load Temperature into RAX
       SUB RAX, RAX, 20 ; Subtract 20 from RAX
       SET 0x1, 0x0, 0x0 ; Turn off the fan
       JLZ start, RAX ; If RAX is less than 0, jump to start
       SET 0x1, 0x1, 0x0 ; Turn on the fan
       MOV [8*RAX+5], yieldTime ; Move the yield time into RAX
wait:  DEC RAX ; Decrement RAX
       YIELD ; Yield the CPU
       JLZ start, RAX ; If RAX is less than 0, jump to start
       JMP wait ; Jump to wait

`;

let program: SASMProgram = parser.parseString(input)
for (let i = 0; i < program.instructions.length; i++) {
  //@ts-ignore
    console.log(`${program.instructions[i].Label == undefined ? "\t" : program.instructions[i].Label + ":\t"} ${program.instructions[i].InstructionName} ${program.instructions[i].Operands.map((operand) => operand.type == OperandTypes.Memory ? `${operand.value.index.value}*${operand.value.scale}+${operand.value.base}` : operand.type).join(",")}`)
}