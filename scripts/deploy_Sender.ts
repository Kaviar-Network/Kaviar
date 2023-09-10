import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Sender__factory} from  "../types";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("bsc");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    const gateway = "";
    const gasservice = "";

    const ETH_AMOUNT = ethers.utils.parseEther("0.01");
    
    const verifier = await new Sender__factory(signer).deploy(
        gateway,
        gasservice,
        ETH_AMOUNT
      );
    await (verifier).deployed();
    console.log(`SendMessage contract deployed to ${verifier.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })