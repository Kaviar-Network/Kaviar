import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Receiver__factory} from  "../types";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("goerli");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

  
    const verifierContract = "0x";
    const  poseidonContract = "0x";

    const gateway = "";
    const gasservice = "";
    const ETH_AMOUNT = ethers.utils.parseEther("0.01");
    const HEIGHT = 20;

    const reveiver = await new Receiver__factory(signer).deploy(
        gateway,
        gasservice,
        verifierContract,
        ETH_AMOUNT,
        HEIGHT,
        poseidonContract
    );
  
    await (reveiver).deployed();
    console.log(`SendMessage contract deployed to ${reveiver.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })