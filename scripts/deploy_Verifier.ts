import * as dotenv from "dotenv";
import { ethers } from "ethers";
import{ Verifier__factory} from  "../types";
import {  mantleNet, scrollNet, polygonZkEVM } from "../const";



dotenv.config();
async function main(chain: string) {

    //linea: 0xb2ECD01D7a7f21B487695773dC03D3d88b615211
   
    const wallet = new ethers.Wallet(process.env.polygonSigner ?? "");
    const provider = new ethers.providers.StaticJsonRpcProvider(
      polygonZkEVM.url,
      polygonZkEVM.chainId
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