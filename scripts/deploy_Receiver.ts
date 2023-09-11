import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Receiver__factory} from  "../types";
import {verifier, poseidonAddr} from "../const";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("goerli");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

  

    const gateway = "0xe432150cce91c13a887f7D836923d5597adD8E31";
    const gasservice = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";
    const ETH_AMOUNT = ethers.utils.parseEther("0.01");
    const HEIGHT = 20;

    const reveiver = await new Receiver__factory(signer).deploy(
        gateway,
        gasservice,
        verifier,
        ETH_AMOUNT,
        HEIGHT,
        poseidon
    );
  
    await (reveiver).deployed();
    console.log(`Receiver contract deployed to ${reveiver.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })