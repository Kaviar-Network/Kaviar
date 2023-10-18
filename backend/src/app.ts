import express, { NextFunction, Request, Response } from "express";

import { deposit, withdraw } from "./merkleServices";

import { MerkleTree } from "./utils/merkleTree";
import { ethers } from "ethers";
import { PoseidonHasher, poseidonHash } from "./utils/poseidon";
//@ts-ignore
import { buildPoseidon } from "circomlibjs";
export const app = express();

const HEIGHT = 20;
let poseidon: any;
let lineaTree: any;
let mantleTree: any;
let scrollTree: any;

buildPos().then(() => {
  lineaTree = new MerkleTree(HEIGHT, "test", new PoseidonHasher(poseidon));

  mantleTree = new MerkleTree(HEIGHT, "test", new PoseidonHasher(poseidon));

  scrollTree = new MerkleTree(HEIGHT, "test", new PoseidonHasher(poseidon));
});

//middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

function middleware(req: Request, res: Response, next: NextFunction) {
  next();
}

app.use(middleware);

app.get("/deposit/:commitment/:chain", async (req: Request, res: Response) => {
  let tree: any;
  try {
    const { commitment, chain } = req.params;
    console.log("commitment: ", commitment, " chain: ", chain);
    if (chain == "mantle") {
      tree = await deposit(commitment, mantleTree);
    } else if (chain == "linea") {
      tree = await deposit(commitment, lineaTree);
    } else if (chain == "scrollSepolia") {
      tree = await deposit(commitment, scrollTree);
    }
    return res.status(200).json(tree);
  } catch (error) {
    console.error("Error depositing:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while depositing" });
  }
});

app.get("/withdraw/:leafIndex/:chain", async (req: Request, res: Response) => {
  try {
    let obj: any;
    const { leafIndex: leafIndexStr, chain } = req.params;
    const leafIndex = Number(leafIndexStr);
    if (chain == "mantle") {
      obj = await withdraw(leafIndex, mantleTree);
    } else if (chain == "linea") {
      obj = await withdraw(leafIndex, lineaTree);
    } else if (chain == "scrollSepolia") {
      obj = await withdraw(leafIndex, scrollTree);
    }
    return res.status(200).json(obj);
  } catch (error) {
    console.error("Error withdrawing:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while withdrawing" });
  }
});

app.get("/leafindex/:chain", async (req: Request, res: Response) => {
  try {
    let obj: any;
    const { chain } = req.params;

    if (chain == "mantle") {
      obj = mantleTree.totalElements - 1;
    } else if (chain == "linea") {
      obj = lineaTree.totalElements - 1;
    } else if (chain == "linea") {
      obj = scrollTree.totalElements - 1;
    }
    return res.status(200).json(obj);
  } catch (error) {
    console.error("Error withdrawing:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while withdrawing" });
  }
});

// app.get("/deposit", async (req: Request, res: Response) => {
//   let result: number;
//   try{
//     // const {commitment, chain} = req.params;

//     const tree = await deposit("0x131d05841a55fe138852b423e66d766620a71c1b259254bea564839fb99e3f27",mantleTree);

//     return res.status(200).json(tree);
//   } catch(error){
//     return res.status(500).json({ error: "An error occurred while depositing" });
//   }
// });

async function buildPos() {
  poseidon = await buildPoseidon();
}

app.listen(3001, () => {
  console.log("Application listening at http://localhost:3001");
});
