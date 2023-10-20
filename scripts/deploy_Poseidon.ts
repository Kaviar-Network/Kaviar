import * as dotenv from "dotenv";
import { ethers } from "ethers";
//@ts-ignore
import { poseidonContract, buildPoseidon } from "circomlibjs";
import { scrollNet, lineaNet, polygonZkEVM} from "../const"

dotenv.config();
async function main() {
    //linea 0x065C6B312e3aa2b1824F2791AfD85f0D0f07f6a7
    const wallet = new ethers.Wallet(process.env.polygonSigner ?? "");
    const provider = new ethers.providers.StaticJsonRpcProvider(
      polygonZkEVM.url,
      polygonZkEVM.chainId
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