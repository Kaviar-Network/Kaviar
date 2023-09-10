import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();
async function main() {
   
    const wallet = new ethers.Wallet(process.env.userOldSigner ?? "");
    const provider = ethers.providers.getDefaultProvider("goerli");
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);

    // address gateway_,
    // address gasReceiver_,
    // IVerifier _verifier,
    // uint256 _denomination,
    // uint32 _merkleTreeHeight,
    // address _hasher

    const gateway = "0x";
    const gasReceiver = "0x";
    const verifierContract = "0x";
    const denomination = ethers.BigNumber.from("10");
    const merkleHeight = ethers.BigNumber.from("5");
    const hasher = "0x";

    const receiverFactory = new ethers.ContractFactory(
        receiverJSON.abi,
        receiverJSON.bytecode,
        signer
    );
    const receiverContract = receiverFactory.deploy();
    (await receiverContract).deployed();

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })