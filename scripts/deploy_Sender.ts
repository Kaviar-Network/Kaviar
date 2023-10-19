import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { Sender__factory } from "../types";
import { polygonNet,bscNet } from "../const";

dotenv.config();
async function main() {
  const wallet = new ethers.Wallet(process.env.bscSigner ?? "");
  const provider = new ethers.providers.StaticJsonRpcProvider(
    bscNet.url,
    bscNet.chainId
  );
  //  const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545", {name: "bsc", chainId: 97})
  const signer = wallet.connect(provider);
  // const balanceBN = await signer.getBalance();
  // const balance = Number(ethers.utils.formatEther(balanceBN));
  // console.log(`Wallet balance ${balance}`);

  const ETH_AMOUNT = ethers.utils.parseEther("0.001");
  const AXELAR_GAS = ethers.utils.parseEther("0.01");
  const TOTAL_VALUE = ethers.utils.parseEther("0.011");

  const verifier = await new Sender__factory(signer).deploy(
    bscNet.gateway,
    bscNet.gasservice,
    ETH_AMOUNT,
    AXELAR_GAS
  );
  await verifier.deployed();
  console.log(`Sender contract deployed to ${verifier.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
