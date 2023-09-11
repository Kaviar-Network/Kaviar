import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Sender__factory} from  "../types";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "")
    const url = "https://bsc-testnet.publicnode.com"
    const provider = new ethers.providers.StaticJsonRpcProvider(
        url,
        97
      );
  //  const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545", {name: "bsc", chainId: 97})
    const signer = wallet.connect(provider);
    // const balanceBN = await signer.getBalance();
    // const balance = Number(ethers.utils.formatEther(balanceBN));
    // console.log(`Wallet balance ${balance}`);
    const gateway = "0x4D147dCb984e6affEEC47e44293DA442580A3Ec0";
    const gasservice = "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6";

    const ETH_AMOUNT = ethers.utils.parseEther("0.001");
    
    
    const verifier = await new Sender__factory(signer).deploy(
        gateway,
        gasservice,
        ETH_AMOUNT
      );
    await (verifier).deployed();
    console.log(`Sender contract deployed to ${verifier.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })