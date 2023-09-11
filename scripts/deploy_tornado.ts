import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ ETHTornado__factory} from  "../types";
import {tornado_verifier, tornado_poseidonAddr, goerliNet} from "../const";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = new ethers.providers.StaticJsonRpcProvider(
        goerliNet.url,
        goerliNet.chainId
      );
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

    const ETH_AMOUNT = ethers.utils.parseEther("0.001");
    const HEIGHT = 20;

    const tornado = await new ETHTornado__factory(signer).deploy(
        tornado_verifier,
        ETH_AMOUNT,
        HEIGHT,
        tornado_poseidonAddr
    );
    await (tornado).deployed();
    console.log(tornado.address);


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })

