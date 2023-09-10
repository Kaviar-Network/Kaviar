import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Verifier__factory} from  "../types";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("goerli");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    
    const verifier = await new Verifier__factory(signer).deploy();
    await (verifier).deployed();
    console.log(verifier.address);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })