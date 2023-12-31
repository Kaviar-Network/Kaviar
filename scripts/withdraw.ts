import * as dotenv from "dotenv";
// import { ethers } from "ethers";
import {ethers} from "hardhat";
import { Contract, ContractFactory, BigNumber, BigNumberish } from "ethers";
//@ts-ignore
import { poseidonContract, buildPoseidon } from "circomlibjs";
import {ETHTornado__factory} from "../types";
import { poseidonAddr, tornado } from "../const";
// @ts-ignore
import { MerkleTree, Hasher } from "../src/merkleTree";
// @ts-ignore
import { groth16 } from "snarkjs";
import path from "path";

async function main(){
    const userOldSignerWallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("goerli");
    const userOldSigner = userOldSignerWallet.connect(provider);
    const relayerSignerWallet = new ethers.Wallet(process.env.relayerSigner ?? "");
    const relayerSigner = relayerSignerWallet.connect(provider);
    const userNewSignerWallet = new ethers.Wallet(process.env.userNewSigner ?? "");
    const userNewSigner = userNewSignerWallet.connect(provider);

    const poseidon = await buildPoseidon();
    const tornadoContract = new ETHTornado__factory(userOldSigner).attach(ethers.utils.getAddress(tornado));
    const ETH_AMOUNT = ethers.utils.parseEther("0.001");
    const HEIGHT = 20;
    console.log("pass 1");
    const tree = new MerkleTree(
        HEIGHT,
        "test",
        new PoseidonHasher(poseidon)
    );
    // need get deposit create with nullifier
    // the old root
    const nullifier = new Uint8Array([
        86, 194, 106, 82,  56,
       214,  21, 157, 77,  30,
       222,  71, 170, 62, 163
     ])
    const nullifierHash = "0x18bf66d22c4afbcdeb8ed2b6380bf684b890ede292feea2313e421c381ad8774"
    const leafIndex = 0
    const commitment = "0x2a8844508de265efc586a3314480ae15cd3cb99b94c6ad3895e034a8d2585143"
    console.log(tree);
    
    //console.log(await tree.root(), await tornadoContract.roots(0));
    await tree.insert(commitment);
    //console.log(tree.totalElements, await tornadoContract.nextIndex());
    //check the new root after deposit
   // console.log(await tree.root(), await tornadoContract.roots(1));
    

    const recipient = await userNewSigner.getAddress();
    const relayer = await relayerSigner.getAddress();
    const fee = 0;

    const { root, path_elements, path_index } = await tree.path(
         leafIndex
    );

    const witness = {
        // Public
        root,
        nullifierHash,
        recipient,
        relayer,
        fee,
        // Private (user keep)
        nullifier: BigNumber.from(nullifier).toBigInt(),
        pathElements: path_elements,
        pathIndices: path_index,
    };

    console.log(witness)
    const solProof = await prove(witness);
    console.log(solProof)

    // const txWithdraw = await tornadoContract
    // .connect(relayerSigner)
    // .withdraw(solProof, root, nullifierHash, recipient, relayer, fee);
    // const receiptWithdraw = await txWithdraw.wait();
    // console.log("Withdraw gas cost", receiptWithdraw.gasUsed.toNumber()); 

}

class PoseidonHasher implements Hasher {
    poseidon: any;

    constructor(poseidon: any) {
        this.poseidon = poseidon;
    }

    hash(left: string, right: string) {
        return poseidonHash(this.poseidon, [left, right]);
    }
}

function poseidonHash(poseidon: any, inputs: any): string {
    const hash = poseidon(inputs.map((x: any) => ethers.BigNumber.from(x).toBigInt()));
    // Make the number within the field size
    const hashStr = poseidon.F.toString(hash);
    // Make it a valid hex string
    const hashHex = ethers.BigNumber.from(hashStr).toHexString();
    // pad zero to make it 32 bytes, so that the output can be taken as a bytes32 contract argument
    const bytes32 = ethers.utils.hexZeroPad(hashHex, 32);
    return bytes32;
}

interface Proof {
    a: [BigNumberish, BigNumberish];
    b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
    c: [BigNumberish, BigNumberish];
}

async function prove(witness: any): Promise<Proof> {
    const wasmPath = path.join(__dirname, "../build/withdraw_js/withdraw.wasm");
    const zkeyPath = path.join(__dirname, "../build/circuit_final.zkey");

    const { proof } = await groth16.fullProve(witness, wasmPath, zkeyPath);
    const solProof: Proof = {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]],
        ],
        c: [proof.pi_c[0], proof.pi_c[1]],
    };
    return solProof;
}

class Deposit {
    public constructor(
        public readonly nullifier: Uint8Array,
        public poseidon: any,
        public leafIndex?: number
    ) {
        this.poseidon = poseidon;
    }
    static new(poseidon: any) {
        // random nullifier (private note)
        // here we only have private nullifier 
        const nullifier = ethers.utils.randomBytes(15);
        return new this(nullifier, poseidon);
    }
    // get hash of secret (nullifier)
    get commitment() {
        return poseidonHash(this.poseidon, [this.nullifier, 0]);
    }
    // get hash f nullifierhash (nulifier+1+index)
    get nullifierHash() {
        if (!this.leafIndex && this.leafIndex !== 0)
            throw Error("leafIndex is unset yet");
        return poseidonHash(this.poseidon, [this.nullifier, 1, this.leafIndex]);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })