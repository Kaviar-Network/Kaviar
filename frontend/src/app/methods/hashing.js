import { MerkleTree, Hasher } from "./merkleTree";
import { BigNumber } from "@ethersproject/bignumber";
import { isHexString } from "@ethersproject/bytes";

function hexZeroPad(value, length) {
    if (typeof value !== "string") {
      value = hexlify(value)
    } else if (!isHexString(value)) {
      logger.throwArgumentError("invalid hex string", "value", value)
    }
  
    if (value.length > 2 * length + 2) {
      logger.throwArgumentError("value out of range", "value", arguments[1])
    }
  
    while (value.length < 2 * length + 2) {
      value = "0x0" + value.substring(2)
    }
  
    return value
  }

export function poseidonHash(poseidon, inputs) {
    const hash = poseidon(inputs.map(x => BigNumber.from(x).toBigInt()));
    // Make the number within the field size
    const hashStr = poseidon.F.toString(hash);
    // Make it a valid hex string
    const hashHex = BigNumber.from(hashStr).toHexString();
    // pad zero to make it 32 bytes, so that the output can be taken as a bytes32 contract argument
    const bytes32 = hexZeroPad(hashHex, 32);
    return bytes32;
}

// class PoseidonHasher extends Hasher {
//     constructor(poseidon) {
//         this.poseidon = poseidon;
//     }

//     hash(left, right) {
//         return poseidonHash(this.poseidon, [left, right]);
//     }
// }

async function prove(witness) {
    const wasmPath = path.join(__dirname, "../build/withdraw_js/withdraw.wasm")
    const zkeyPath = path.join(__dirname, "../build/circuit_final.zkey")
  
    const { proof } = await groth16.fullProve(witness, wasmPath, zkeyPath)
    const solProof = {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ],
      c: [proof.pi_c[0], proof.pi_c[1]]
    } 
    
    return solProof
}

async function withdraw() {
    const nullifierHash = deposit.nullifierHash;
    const recipient = await userNewSigner.getAddress();
    const relayer = await relayerSigner.getAddress();
    const fee = 0;

    const { root, path_elements, path_index } = await tree.path(
        deposit.leafIndex
    );

    const witness = {
        // Public
        root,
        nullifierHash,
        recipient,
        relayer,
        fee,
        // Private (user keep)
        nullifier: BigNumber.from(deposit.nullifier).toBigInt(),
        pathElements: path_elements,
        pathIndices: path_index,
    };
    const solProof = await prove(witness);

    const txWithdraw = await tornado
        .connect(relayerSigner)
        .withdraw(solProof, root, nullifierHash, recipient, relayer, fee);
    const receiptWithdraw = await txWithdraw.wait();
}
