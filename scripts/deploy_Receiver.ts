import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Receiver__factory} from  "../types";
import {scrollNet,verifierScroll,poseidonAddrScroll} from "../const";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.scrollSigner ?? "");
    const provider = new ethers.providers.StaticJsonRpcProvider(
        scrollNet.url,
        scrollNet.chainId
      );
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
   
    const ETH_AMOUNT = ethers.utils.parseEther("0.001");
    const HEIGHT = 20;

    const reveiver = await new Receiver__factory(signer).deploy(
        scrollNet.gateway,
        scrollNet.gasservice,
        verifierScroll,
        ETH_AMOUNT,
        HEIGHT,
        poseidonAddrScroll,
    );
  
    await (reveiver).deployed();
    console.log(`Receiver contract deployed to ${reveiver.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })