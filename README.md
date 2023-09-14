# KeptSecret

## Kaviar: Cross-Chain Compliant Currency-Mixer

## Demo Video


[![Kaviar](./video/page.png)](https://youtu.be/2emMlyGkbdo)


### Ethereum Singapore 2023 Hackathon
We create a cross-chain compliant currency-mixer based on the paper [Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364) by Buterin et al. 2023.

Specifically we

- Use Poseidon Hash for tree hashing, nullifier hashing, and commitment construction

```
commitment = PoseidonHash(nullifier, 0)
nullifierHash = PoseidonHash(nullifier, 1, leafIndex)
```

- Use [Privacy Pools](https://github.com/ameensol/privacy-pools) to block blacklisted actors from using the protocol.

- Use [Axelar](https://github.com/axelarnetwork/axelar-core) to bridge assets between two chains.

## Workflow
[![Kaviar](./video/workflow.png)]()
## Build

First, you must have the Circom 2 compiler installed. See [installation
instructions](https://docs.circom.io/getting-started/installation/) for details.

The build step compiles the circuit, does untrusted setup, generates verifier contract, and compiles all the contracts. It could take a while at the setup step.

```
npm install
npm run build
```

## Run
```
# run frontend
cd frontend && npm install && npm run dev

# run backend
cd backend && yarn install && yarn run dev
```
## Credits

This project has won the 1st prize for "Best infrastructure & Tooling Project" by Mantle Network and "Best DApp Using Axelar To Enable Cross-Chain Contract Interaction Via Axelar's General Message Passing" By Axelar @ the Ethereum Singapore Conference/Hackathon 2023, registered under the team name KeptSecret. The KeptSecret members are:

Ren Kun Peng, Vincent - PhD Candidate @ NUS Comp Sci, Twitter (@darmonren), GitHub (KunPengRen), Email (dcsrenk@nus.edu.sg)
Kenneth Goh - Masters Candidate @ NUS Comp Sci, Twitter (@KernelKennethG), GitHub (DarkArtistry), Email (zhenhao.goh@comp.nus.edu.sg)
Ramon Marc Garcia Seuma - Freelance Full Stack Developer, Twitter (@spartablock), GitHub (reymom), Email (ramon_gs95@hotmail.com)
Mohak Malhotra - Freelance Full Stack Developer, Twitter (@spartablock), GitHub (mnm458), Email (mohaknainmalhotra@gmail.com)
Arindam Singh - Undergraduate @ Columbia University Law & Economics, Email (as3316@cam.ac.uk)