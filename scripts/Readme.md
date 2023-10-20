# Deploy Poseidon

npx hardhat run scripts/deploy_Poseidon.ts
0x9d77bbf021c153a91116E3088ec92c606dB23FAc
0x9025e74D23384f664CfEB07F1d8ABd19570758B5 (Polygon zkEVM)

# Deploy Verifier

npx hardhat run scripts/deploy_Verifier.ts
0x28ac354197B3bA5f626cCb5fb2573D430855d9Fb
0xfa29381958DD8a2dD86246FC0Ab2932972640580 (Polygon zkEVM)

# Deploy Receiver

npx hardhat run scripts/deploy_Receiver.ts
0x3c7E87e06C2Ef82A65731d85e005919897DF3518
0x574F9863e69a9944421Cb39F6abA3AdE6c6741aF (Scroll new)

# Deploy Sender

npx hardhat run scripts/deploy_Sender.ts
0x9025e74D23384f664CfEB07F1d8ABd19570758B5 (Polygon Mumbai)
0x602475C17C020FE3AF7294eC4aCF68f93198332c (Polygon zkEVM)
0x0123140C6eaf01c1A7BD9Fb16714090C1A22A4BE (polygon zkEVM new)

## test sender

## at BSC

```
npx hardhat run scripts/sender.ts
# you would see a nullifier and comment output in terminal
tx hash https://testnet.bscscan.com/tx/0x4f1f5d2eb6b71c72bec6d6bb12f3de8d618839bad912c45d68626666680c3704#eventlog
nullifier:  Uint8Array(15) [
   36, 122,  94, 210, 155,
  215, 120, 154,  68, 223,
   87, 221, 170,  61,  77
]
commitment:  0x1dc9bbb3194eddda4e23238467e0d47f9599851aef5446935619caf6c9984b3d

```

## check your tx is confirmed at axelar scan by send sender tx hash

https://testnet.axelarscan.io/gmp/
//tx hash https://testnet.axelarscan.io/gmp/0xf46c09b61efce78579828345f552361be0e39ab3a6415b3eed4c13a4012b1d57:10

## at scroll

```
# copy previous output of nullifier and comment to the receiver.ts
npx hardhat run scripts/receiver.ts
//tx hash https://sepolia.scrollscan.com/tx/0x18ea4d807f48f1ec53e24347b244f357c8d0cdd651af8187d73fef9b8a67f776
```
