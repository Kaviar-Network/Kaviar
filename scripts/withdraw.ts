import * as dotenv from "dotenv";
// import { ethers } from "ethers";
import {ethers} from "hardhat";
//@ts-ignore
import { poseidonContract, buildPoseidon } from "circomlibjs";
import {ETHTornado__factory} from "../types";
import { poseidonAddr, tornado } from "../const";
import { MerkleTree, Hasher } from "../src/merkleTree";


async function main(){
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("goerli");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    const [userOldSigner, relayerSigner, userNewSigner] = await ethers.getSigners();
    const poseidon = await buildPoseidon();
    const tornadoContract = new ETHTornado__factory(signer).attach(ethers.utils.getAddress(tornado));
    const ETH_AMOUNT = ethers.utils.parseEther("0.01");
    const HEIGHT = 20;
    console.log("pass 1");
    const tree = new MerkleTree(
        HEIGHT,
        "test",
        new PoseidonHasher(poseidon)
    );
    // the old root
    console.log(tree);
   

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

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })