/*
* This is an implementation of a calculator using recusrive zkSNARks.
*/
import { Int64, ZkProgram, Struct} from "o1js";

export class NumbersToSum extends Struct({
  first: Int64,
  second: Int64,
}){};

/*
* Verifiably sum two numbers.
*/
function addBase(numbers: NumbersToSum): Int64 {

  const first: Int64 = numbers.first;
  const second: Int64 = numbers.second;

  return first.add(second);
}

export const BaseCalculatorCircuit = ZkProgram({
  name: "Base Calculator Circuit",
  publicInput: NumbersToSum,
  publicOutput: Int64,

  methods: {
    add: {
      privateInputs: [],
      method: addBase,
    },
  },
});

export class BaseCalculatorCircuitProof extends ZkProgram.Proof(BaseCalculatorCircuit) {}


function addRecursive(number: Int64, sumProof: BaseCalculatorCircuitProof): Int64 {
  // 1. Verify that the proof is valid
  sumProof.verify();

  // 2. Extract the public output from the proof. The public output is the sum of of two numbers.
  const sum: Int64 = sumProof.publicOutput; 

  return number.add(sum);
}

export const RecursiveCalculatorCircuit = ZkProgram({
  name: "Recursive Calculator Circuit",
  publicInput: Int64,
  publicOutput: Int64,

  methods: {
    add: {
      privateInputs: [BaseCalculatorCircuitProof],
      method: addRecursive,
    },
  },
});

export class RecursiveCalculatorCircuitProof extends ZkProgram.Proof(RecursiveCalculatorCircuit) {}


// USAGE Below

// 1. Compile both ZK Applications / ZK Circuits

console.log("Compiling Base Calculator ZK Applications / ZK Circuit...");
const baseCalculatorCircuitVerificationKey = await BaseCalculatorCircuit.compile();

console.log("Compiling Recursive Calculator ZK Applications / ZK Circuit...");
const recursiveCalculatorCircuitVerificationKey = await RecursiveCalculatorCircuit.compile();


// 2. Create a proof for the base sum
const numbersToSum = new NumbersToSum({
  first: Int64.from(10),
  second: Int64.from(20),
});


console.log("Creating a proof for the base sum...");
const sumProof: BaseCalculatorCircuitProof = await BaseCalculatorCircuit.add(numbersToSum);

// verify to ensure that the proof is valid
sumProof.verify();

const numbersInSum: NumbersToSum = sumProof.publicInput;
const resultOfSum: Int64 = sumProof.publicOutput;

console.log(`The result of ${numbersInSum.first} + ${numbersInSum.second} = ${resultOfSum}`);

// 3. Create a recursive sum proof

const numberToSum: Int64 = Int64.from(100);
const recursiveSumProof: RecursiveCalculatorCircuitProof = await RecursiveCalculatorCircuit.add(numberToSum, sumProof);

// verify to ensure that the proof is valid
recursiveSumProof.verify();

const resultOfRecursiveSum: Int64 = recursiveSumProof.publicOutput;

console.log(`The result of the recursive sum is ${resultOfRecursiveSum}`);