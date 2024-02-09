import { SASMInstruction } from './parser/instructionset';
import { parser, SASMProgram } from './parser/parser'

const input = 
`
       %alias iterations 6
start: MOV    RAX, 0x1 ; comment test
       MOV    RCX, RAX
loop:  MOV    RAX, RDX
       MOV    RBX, RDX
       MOV    RDX, RAX
       JMP    loop
`;
let program: SASMProgram = parser.parseString(input)
for (let i = 0; i < program.instructions.length; i++) {
    console.log(`${program.instructions[i].Label == undefined ? "\t" : program.instructions[i].Label + ":"} ${program.instructions[i].InstructionName} ${program.instructions[i].Operands.map((operand) => operand.value).join(",")}`)
}