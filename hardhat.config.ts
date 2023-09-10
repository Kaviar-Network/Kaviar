import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/types";
import dotenv from 'dotenv';
dotenv.config();
const INFURA_URL = "https://eth-goerli.g.alchemy.com/v2/wQZhZrGooqQlJMi44xtV3WQEAlhY8Ycz";
const userOldSigner = process.env.userOldSigner;
const relayerSigner = process.env.relayerSigner;
const userNewSigner = process.env.userNewSigner;

const config: HardhatUserConfig = {
    networks: {
        hardhat:{},
        goerli: {
          url: INFURA_URL,
          accounts: [`${userOldSigner}`, `0x${relayerSigner}`, `0x${userNewSigner}`],
          gas:10000000,
          timeout: 60000
        },
        bsc: {
          url: "https://data-seed-prebsc-1-s1.binance.org:8545",
          chainId: 97,
          accounts: [`${userOldSigner}`, `0x${relayerSigner}`, `0x${userNewSigner}`],
          gas:10000000,
          timeout: 60000
        },
      },
      solidity: {
        compilers: [
          {
            version: "0.8.9"
          },
          {
            version: "0.8.0"
          }
        ]
      },
};

export default config;
