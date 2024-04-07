import { OperandTypes, SASMInstruction } from './parser/instructionset';
import { parser, SASMProgram } from './parser/parser'

const input = 
`
       %alias yieldTime 0x5
start: LBN R0, 0x1, 0x2, 0x3 ; Load Temperature into R0
       SUB R0, R0, 20 ; Subtract 20 from R0
       SET 0x1, 0x0, 0x0 ; Turn off the fan
       JLZ start, R0 ; If R0 is less than 0, jump to start
       SET 0x1, 0x1, 0x0 ; Turn on the fan
       MOV [8*R0+5], yieldTime ; Move the yield time into R0
wait:  DEC R0 ; Decrement R0
       YIELD ; Yield the CPU
       JLZ start, R0 ; If R0 is less than 0, jump to start
       JMP wait ; Jump to wait

`;

let program: SASMProgram = parser.parseString(input)
console.log(program)
/**
for (let i = 0; i < program.instructions.length; i++) {
  //@ts-ignore
    console.log(`${program.instructions[i].Label == undefined ? "\t" : program.instructions[i].Label + ":\t"} ${program.instructions[i].InstructionName} ${program.instructions[i].Operands.map((operand) => operand.type == OperandTypes.Memory ? `${operand.value.index.value}*${operand.value.scale}+${operand.value.base}` : operand.type).join(",")}`)
}
*/