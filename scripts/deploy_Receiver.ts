import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Receiver__factory} from  "../types";
import {verifier, poseidonAddr, mantleNet} from "../const";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = new ethers.providers.StaticJsonRpcProvider(
        mantleNet.url,
        mantleNet.chainId
      );
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

  

   
    const ETH_AMOUNT = ethers.utils.parseEther("0.001");
    const HEIGHT = 20;

    const reveiver = await new Receiver__factory(signer).deploy(
        mantleNet.gateway,
        mantleNet.gasservice,
        verifier,
        ETH_AMOUNT,
        HEIGHT,
        poseidonAddr
    );
  
    await (reveiver).deployed();
    console.log(`Receiver contract deployed to ${reveiver.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })