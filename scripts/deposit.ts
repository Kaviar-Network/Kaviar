import * as dotenv from "dotenv";
// import { ethers } from "ethers";
import {ethers} from "hardhat";
//@ts-ignore
import { poseidonContract, buildPoseidon } from "circomlibjs";
import {ETHTornado__factory} from "../types";
import { poseidonAddr, tornado } from "../const";

dotenv.config();
async function main() {

   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("goerli");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    const [userOldSigner, relayerSigner, userNewSigner] = await ethers.getSigners();
    const poseidon = await buildPoseidon();
    const deposit = Deposit.new(poseidon);

    //setup the poseidon first
    const poseidonContract =  getPoseidonFactory(2).connect(signer).attach(ethers.utils.getAddress(poseidonAddr));
    const res = await poseidonContract["poseidon(uint256[2])"]([1, 2]);
    const res2 = poseidon([1, 2]);

    console.log(res.toString(), poseidon.F.toString(res2));
    //console.log(poseidon);
    const tornadoContract = new ETHTornado__factory(signer).attach(ethers.utils.getAddress(tornado));
    const ETH_AMOUNT = ethers.utils.parseEther("0.01");
    console.log("pass 1");
    const tx = await tornadoContract
    .connect(userOldSigner)
    .deposit(deposit.commitment, { value: ETH_AMOUNT });
    const receipt = await tx.wait();
    const events = await tornadoContract.queryFilter(
        tornadoContract.filters.Deposit(),
        receipt.blockHash
    );


    console.log(receipt);
    console.log(events);
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
    return new ethers.ContractFactory(abi, bytecode);
  }

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })


