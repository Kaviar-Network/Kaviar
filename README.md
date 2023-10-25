# KeptSecret

## Kaviar: Cross-Chain Compliant Currency-Mixer

Our Team members:  
  [Vincent](https://github.com/KunPengRen) - Twitter (@darmonren), Email (dcsrenk@nus.edu.sg)

  [Ramon](https://github.com/reymom) - Email (ramon_gs95@hotmail.com)
  
  [Bob](https://github.com/wubozhi)  - Email (bozhi001@e.ntu.edu.sg)



We create a cross-chain compliant privacy bridge based on the paper [Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364) by Buterin et al. 2023.

Specifically we

- Use Poseidon Hash for tree hashing, nullifier hashing, and commitment construction

```
commitment = PoseidonHash(nullifier, 0)
nullifierHash = PoseidonHash(nullifier, 1, leafIndex)
```

- Use [Privacy Pools](https://github.com/ameensol/privacy-pools) to block blacklisted actors from using the protocol.

- Use [Axelar](https://github.com/axelarnetwork/axelar-core) to transfer commitment data between two chains.

- The living demo is at [here](http://13.229.84.66:3000/), we now support privacy transfer assets from Polygon zkEVM to scroll testnet.

## For ETH Hong Kong Hackathon
During this Hackathon, we improve our platform to support the Scroll and Polygon zkEVM. <br>
Test case transaction below:  <br>
Cross-chain sender at Polygon zkEVM: https://testnet-zkevm.polygonscan.com/tx/0xfbf70bb619940bb0faf4a7080c2beb4d5efd0f2da5b7a3c5b80d47925525e172 <br>
Axelar Scan for cross-chain data transfer: https://testnet.axelarscan.io/gmp/0xfbf70bb619940bb0faf4a7080c2beb4d5efd0f2da5b7a3c5b80d47925525e172 <br>
Cross-chain receiver at Scroll: https://sepolia.scrollscan.com/tx/0x792ef14703c9d7405ee44df142f85585a6a9adee27fdc8b710d121ecb245b961

## Workflow
[![Kaviar](./video/workflow.png)]()
## Build

First, you must have the Circom 2 compiler installed. See [Installation
instructions](https://docs.circom.io/getting-started/installation/) for details.

The build step compiles the circuit, does an untrusted setup, generates a verifier contract, and compiles all the contracts. It could take a while at the setup step.

```
npm install
npm run build
```

## Run
```
# run frontend-app
cd frontend && npm install && npm run dev

# run backend
cd backend && yarn install && yarn run dev
```
## Won prizes

**Congratulations to our team for clinching the 1st Prize for both Axelar Track #1 and Mantle Track #4 in the Ethereum Singapore 2023 Hackathon, Thanks to all the team members and sponsors. (Only one team won two first prizes)**  

## Post contributors
[Mohak](https://github.com/mnm458) - Twitter (@spartablock), Email (mohaknainmalhotra@gmail.com) 
[Arindam](https://github.com/Arindam2407) - Email (as3316@cam.ac.uk) 
[Kenneth](https://github.com/DarkArtistry) - Twitter (@KernelKennethG), Email (zhenhao.goh@comp.nus.edu.sg)
