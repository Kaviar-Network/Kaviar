import { assert, expect } from "chai";
import { ETHTornado__factory, Verifier__factory, ETHTornado } from "../types/";

import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber, BigNumberish } from "ethers";
// @ts-ignore
import { poseidonContract, buildPoseidon } from "circomlibjs";
// @ts-ignore
import { MerkleTree, Hasher } from "../src/merkleTree";
// @ts-ignore
import { groth16 } from "snarkjs";
import path from "path";

const ETH_AMOUNT = ethers.utils.parseEther("0.01");
const HEIGHT = 20;

function poseidonHash(poseidon: any, inputs: BigNumberish[]): string {
    const hash = poseidon(inputs.map((x) => BigNumber.from(x).toBigInt()));
    // Make the number within the field size
    const hashStr = poseidon.F.toString(hash);
    // Make it a valid hex string
    const hashHex = BigNumber.from(hashStr).toHexString();
    // pad zero to make it 32 bytes, so that the output can be taken as a bytes32 contract argument
    const bytes32 = ethers.utils.hexZeroPad(hashHex, 32);
    return bytes32;
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

class Deposit {
    private constructor(
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

function getPoseidonFactory(nInputs: number) {
    const bytecode = poseidonContract.createCode(nInputs);
    const abiJson = poseidonContract.generateABI(nInputs);
    const abi = new ethers.utils.Interface(abiJson);
    return new ContractFactory(abi, bytecode);
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

describe("ETHTornado", function () {
    let tornado: ETHTornado;
    let poseidon: any;
    let poseidonContract: Contract;

    before(async () => {
        // local poseidon
        poseidon = await buildPoseidon();
    });

    beforeEach(async function () {
        const [signer] = await ethers.getSigners();
        const verifier = await new Verifier__factory(signer).deploy();
        poseidonContract = await getPoseidonFactory(2).connect(signer).deploy();
        tornado = await new ETHTornado__factory(signer).deploy(
            verifier.address,
            ETH_AMOUNT,
            HEIGHT,
            poseidonContract.address
        );
        console.log("Verifier Address:", verifier.address, "Poseidon Address:", poseidonContract.address);
    });

    // it("generates same poseidon hash", async function () {
    //     // deploy poseidonContract and upload two leaves
    //     const res = await poseidonContract["poseidon(uint256[2])"]([1, 2]);
    //     const res2 = poseidon([1, 2]);

    //     assert.equal(res.toString(), poseidon.F.toString(res2));
    //     console.log(poseidon);
    // }).timeout(500000);

    it("deposit and withdraw", async function () {
        const [userOldSigner, relayerSigner, userNewSigner] =
            await ethers.getSigners();
        const deposit = Deposit.new(poseidon);
        //deposit 
        //parameters: nullifier hash and amount
        const tx = await tornado
            .connect(userOldSigner)
            .deposit(deposit.commitment, { value: ETH_AMOUNT });
        const receipt = await tx.wait();
        const events = await tornado.queryFilter(
            tornado.filters.Deposit(),
            receipt.blockHash
        );
        assert.equal(events[0].args.commitment, deposit.commitment);
        console.log("Deposit gas cost", receipt.gasUsed.toNumber());
        // leafIndex return from event
        deposit.leafIndex = events[0].args.leafIndex;
        
        // construct local merkletree
        const tree = new MerkleTree(
            HEIGHT,
            "test",
            new PoseidonHasher(poseidon)
        );
        // the old root
        console.log(tree)
        assert.equal(await tree.root(), await tornado.roots(0));
        await tree.insert(deposit.commitment);
        assert.equal(tree.totalElements, await tornado.nextIndex());
        // check the new root after deposit
        assert.equal(await tree.root(), await tornado.roots(1));

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
        console.log("Withdraw gas cost", receiptWithdraw.gasUsed.toNumber());
        // second deposit 
        // const deposit2 = Deposit.new(poseidon);
        // const tx2 = await tornado
        //     .connect(userOldSigner)
        //     .deposit(deposit.commitment, { value: ETH_AMOUNT });
        // const receipt2 = await tx2.wait();
        // const events2 = await tornado.queryFilter(
        //     tornado.filters.Deposit(),
        //     receipt2.blockHash
        // );
        // assert.equal(events2[0].args.commitment, deposit2.commitment);
        // console.log("Deposit gas cost", receipt2.gasUsed.toNumber());
        // // leafIndex return from event
        // deposit2.leafIndex = events2[0].args.leafIndex;
        // await tree.insert(deposit2.commitment);
        // assert.equal(await tree.root(), await tornado.roots(2));

    }).timeout(500000);

    // it("prevent a user withdrawing twice", async function () {
    //     const [userOldSigner, relayerSigner, userNewSigner] =
    //         await ethers.getSigners();
    //     const deposit = Deposit.new(poseidon);
    //     const tx = await tornado
    //         .connect(userOldSigner)
    //         .deposit(deposit.commitment, { value: ETH_AMOUNT });
    //     const receipt = await tx.wait();
    //     const events = await tornado.queryFilter(
    //         tornado.filters.Deposit(),
    //         receipt.blockHash
    //     );
    //     deposit.leafIndex = events[0].args.leafIndex;

    //     const tree = new MerkleTree(
    //         HEIGHT,
    //         "test",
    //         new PoseidonHasher(poseidon)
    //     );
    //     await tree.insert(deposit.commitment);

    //     const nullifierHash = deposit.nullifierHash;
    //     const recipient = await userNewSigner.getAddress();
    //     const relayer = await relayerSigner.getAddress();
    //     const fee = 0;

    //     const { root, path_elements, path_index } = await tree.path(
    //         deposit.leafIndex
    //     );

    //     const witness = {
    //         // Public
    //         root,
    //         nullifierHash,
    //         recipient,
    //         relayer,
    //         fee,
    //         // Private
    //         nullifier: BigNumber.from(deposit.nullifier).toBigInt(),
    //         pathElements: path_elements,
    //         pathIndices: path_index,
    //     };

    //     const solProof = await prove(witness);

    //     // First withdraw
    //     await tornado
    //         .connect(relayerSigner)
    //         .withdraw(solProof, root, nullifierHash, recipient, relayer, fee);

    //     // Second withdraw
    //     await tornado
    //         .connect(relayerSigner)
    //         .withdraw(solProof, root, nullifierHash, recipient, relayer, fee)
    //         .then(
    //             () => {
    //                 assert.fail("Expect tx to fail");
    //             },
    //             (error) => {
    //                 expect(error.message).to.have.string(
    //                     "The note has been already spent"
    //                 );
    //             }
    //         );
    // }).timeout(500000);
    // it("prevent a user withdrawing from a non-existent root", async function () {
    //     const [honestUser, relayerSigner, attacker] = await ethers.getSigners();

    //     // An honest user makes a deposit
    //     // the point here is just to top up some balance in the tornado contract
    //     const depositHonest = Deposit.new(poseidon);
    //     const tx = await tornado
    //         .connect(honestUser)
    //         .deposit(depositHonest.commitment, { value: ETH_AMOUNT });
    //     const receipt = await tx.wait();
    //     const events = await tornado.queryFilter(
    //         tornado.filters.Deposit(),
    //         receipt.blockHash
    //     );
    //     depositHonest.leafIndex = events[0].args.leafIndex;

    //     // The attacker never made a deposit on chain
    //     const depositAttacker = Deposit.new(poseidon);
    //     depositAttacker.leafIndex = 1;

    //     // The attacker constructed a tree which includes their deposit
    //     const tree = new MerkleTree(
    //         HEIGHT,
    //         "test",
    //         new PoseidonHasher(poseidon)
    //     );
    //     await tree.insert(depositHonest.commitment);
    //     await tree.insert(depositAttacker.commitment);

    //     const nullifierHash = depositAttacker.nullifierHash;
    //     const recipient = await attacker.getAddress();
    //     const relayer = await relayerSigner.getAddress();
    //     const fee = 0;

    //     // Attacker construct the proof
    //     const { root, path_elements, path_index } = await tree.path(
    //         depositAttacker.leafIndex
    //     );

    //     const witness = {
    //         // Public
    //         root,
    //         nullifierHash,
    //         recipient,
    //         relayer,
    //         fee,
    //         // Private
    //         nullifier: BigNumber.from(depositAttacker.nullifier).toBigInt(),
    //         pathElements: path_elements,
    //         pathIndices: path_index,
    //     };

    //     const solProof = await prove(witness);

    //     await tornado
    //         .connect(relayerSigner)
    //         .withdraw(solProof, root, nullifierHash, recipient, relayer, fee)
    //         .then(
    //             () => {
    //                 assert.fail("Expect tx to fail");
    //             },
    //             (error) => {
    //                 expect(error.message).to.have.string(
    //                     "Cannot find your merkle root"
    //                 );
    //             }
    //         );
    // }).timeout(500000);
});
