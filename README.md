# KeptSecret

## Kaviar: Cross-Chain Compliant Currency-Mixer



Our Team members:  
  [Vincent](https://github.com/KunPengRen) - Twitter (@darmonren), Email (dcsrenk@nus.edu.sg)

  [Kenneth](https://github.com/DarkArtistry) - Twitter (@KernelKennethG), Email (zhenhao.goh@comp.nus.edu.sg)

  [Ramon](https://github.com/reymom) - Email (ramon_gs95@hotmail.com)



We create a cross-chain compliant currency-mixer based on the paper [Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364) by Buterin et al. 2023.

Specifically we

- Use Poseidon Hash for tree hashing, nullifier hashing, and commitment construction

```
commitment = PoseidonHash(nullifier, 0)
nullifierHash = PoseidonHash(nullifier, 1, leafIndex)
```

- Use [Privacy Pools](https://github.com/ameensol/privacy-pools) to block blacklisted actors from using the protocol.

- Use [Axelar](https://github.com/axelarnetwork/axelar-core) to transfer commitment data between two chains.

- The living demo is at [here](), we now support privacy transfer assets from Polygon zkEVM to scroll testnet.

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
