import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Verifier__factory} from  "../types";
<<<<<<< HEAD
import { goerliNet, mantleNet } from "../const";
=======
import { mantleNet, lineaNet, goerliNet } from "../const";

>>>>>>> c062cd99d9a727f80572c6d4120ddee6c74b9432

dotenv.config();
async function main(chain: string) {

    //linea: 0xb2ECD01D7a7f21B487695773dC03D3d88b615211
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = new ethers.providers.StaticJsonRpcProvider(
<<<<<<< HEAD
        goerliNet.url,
        goerliNet.chainId
=======
        lineaNet.url,
        lineaNet.chainId
>>>>>>> c062cd99d9a727f80572c6d4120ddee6c74b9432
      );
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    
    const verifier = await new Verifier__factory(signer).deploy();
    await (verifier).deployed();
    console.log(verifier.address);

}

main("linea").catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })