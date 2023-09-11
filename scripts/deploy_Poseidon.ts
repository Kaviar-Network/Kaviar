import * as dotenv from "dotenv";
import { ethers } from "ethers";
//@ts-ignore
import { poseidonContract, buildPoseidon } from "circomlibjs";
<<<<<<< HEAD
import {goerliNet, mantleNet} from "../const"
=======
import {mantleNet, lineaNet} from "../const"
>>>>>>> c062cd99d9a727f80572c6d4120ddee6c74b9432

dotenv.config();
async function main() {
    //linea 0x065C6B312e3aa2b1824F2791AfD85f0D0f07f6a7
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

    
    // const verifier = await new Verifier__factory(signer).deploy();
    // await (verifier).deployed();
    // console.log(verifier.address);
    let poseidon = await buildPoseidon();
    let poseidonContract: ethers.Contract;
    poseidonContract = await getPoseidonFactory(2).connect(signer).deploy();
    await (poseidonContract).deployed();
    console.log(poseidonContract.address);


}

function getPoseidonFactory(nInputs: number) {
  const bytecode = poseidonContract.createCode(nInputs);
  const abiJson = poseidonContract.generateABI(nInputs);
  const abi = new ethers.utils.Interface(abiJson);
  return new ethers.ContractFactory(abi, bytecode);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })