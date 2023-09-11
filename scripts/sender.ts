import * as dotenv from "dotenv";
// import { ethers } from "ethers";
import {ethers} from "hardhat";
//@ts-ignore
import {poseidonContract, buildPoseidon } from "circomlibjs";
import {Sender__factory} from "../types";
import { sender,receiver, mantleNet, bscNet, lineaNet, receiverLinea} from "../const";

dotenv.config();
async function main() {

   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "")
    const provider = new ethers.providers.StaticJsonRpcProvider(
        bscNet.url,
        bscNet.chainId
      );
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

    const poseidon = await buildPoseidon();
    const deposit = Deposit.new(poseidon);

    
    const senderContract = await new Sender__factory(signer).attach(ethers.utils.getAddress(sender));
    console.log("signer:", signer)
    // console.log("Sender:", senderContract)
    const ETH_AMOUNT = ethers.utils.parseEther("0.001");
    const AXELAR_GAS = ethers.utils.parseEther("0.005");
    const TOTAL_VALUE = ethers.utils.parseEther("0.006");
    console.log("pass 1");
    const tx = await senderContract
    .connect(signer)
    .deposit(deposit.commitment, lineaNet.name, receiverLinea, { value: TOTAL_VALUE, gasLimit:1000000 });
    const receipt = await tx.wait();
    const events = await senderContract.queryFilter(
        senderContract.filters.Deposit(),
        receipt.blockHash
    );

    console.log("nullifier: ", deposit.nullifier)
  
    console.log(receipt);
    console.log(events);
    // deposit.leafIndex = events[0].args.leafIndex;
    // console.log("nullifierHash: ", deposit.nullifierHash)
    // console.log("Deposit gas cost", receipt.gasUsed.toNumber());
 
  
    // console.log("leafIndex: ",deposit.leafIndex)
    // console.log("commitment: ",deposit.commitment)
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


