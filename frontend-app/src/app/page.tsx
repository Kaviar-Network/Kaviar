'use client';

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { NextPage } from "next";
import { SelectChangeEvent } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    AccordionDetails,
    AccordionSummary,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Slide,
    Typography
} from "@mui/material";
import {
    CustomAccordion,
    StyledButton,
    StyledPinkButton,
    StyledPinkPaper,
    StyledPurplePaper,
    StyledSelect,
    VisuallyHiddenInput,
} from "./styledElements";
import {
    useAccount,
    useNetwork,
    useSwitchNetwork,
    useContractWrite,
    // usePrepareContractWrite
} from "wagmi";
import { buildPoseidon } from "circomlibjs";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { MerkleTree } from "@/utils/merkleTree";
import { PoseidonHasher, poseidonHash } from "@/utils/poseidon";
import {
    depositCrossChainABI,
    withdrawABI,
} from "@/utils/abis";
import { depositContractBnbAddress, depositContractPolygonZkAddress, withdrawContractScrollAddress } from "@/utils/addresses";
import { log } from "@/utils/logger";
// import {
//     deposit as depositApiCall,
//     leafIndex as leafIndexApiCall,
//     withdraw as withdrawApiCall
// } from "@/api/api";
import styles from './page.module.css';
import { DataSnapshot } from "firebase/database";
import { getMerkleTreePromise, writeTreeValues } from "@/firebase/methods";

const snarkjs = require("snarkjs");

enum TabOption {
    Deposit,
    Withdraw,
}

enum Networks {
    Ethereum = "ethereum",
    Mantle = "mantle",
    Polygon = "polygon",
    PolygonZkEVM = "polygonZkEVM",
    Goerly = "goerly",
    Scroll = "scroll",
    Binance = "bsc"
}

const Home: NextPage = () => {
    const [tabOption, setTabOption] = useState<TabOption>(TabOption.Deposit);
    const [tree, setTree] = useState<MerkleTree>();
    const [networkFrom, setNetworkFrom] = useState<Networks>(Networks.Binance);
    const [networkTo, setNetworkTo] = useState<Networks>(Networks.Scroll);
    const [depositing, setDepositing] = useState(false);
    const [depositAmount, setDepositAmount] = useState<BigInt>(BigInt("10000000000000000"));
    const [withdrawAmount, setWithdrawAmount] = useState<BigInt>(BigInt("10000000000000000"));
    const [privateNote, setPrivateNote] = useState<string>();
    const [hashCommitment, setHashCommitment] = useState<string>();
    const [globalNullifier, setGlobalNullifer] = useState<string>();
    const [globalNullifierHash, setGlobalNulliferHash] = useState<string>();
    const [leafIndex, setLeafIndex] = useState(0); // mantle: 0, linea: 0
    const [witnessProof, setWitnessProof] = useState<{ a: any[2]; b: any[2][2]; c: any[2]; }>();
    const [witness, setWitness] = useState<Witness>();

    // const debouncedNetworkTo = useDebounce(networkTo);
    // const debouncedHashCommitment = useDebounce(hashCommitment);
    // const debouncedWitnessProof = useDebounce(witnessProof);
    // const debouncedWitness = useDebounce(witness);
    // const debouncedDepositAmount = useDebounce(depositAmount);

    // const defaultAbc: { a: number[]; b: number[][]; c: number[]; } = {
    //     a: [0, 0], b: [[0, 0], [0, 0]], c: [0, 0]
    // }
    // const defaultBytes = "0".repeat(32);

    // wagmi
    const { address } = useAccount();
    // const { chain } = useNetwork();
    // const { switchNetwork } = useSwitchNetwork();

    interface Witness {
        // Public
        root: string
        nullifierHash?: string
        recipient: string
        relayer: string
        fee: number
        // Private (user keep)
        nullifier: bigint
        pathElements: string[]
        pathIndices: number[]
    }

    useEffect(() => {
        const setZeusTreeWindow = async () => {
            const zeus = await buildPoseidon();
            const tree = new MerkleTree(20, "test", new PoseidonHasher(zeus));
            setTree(tree);
            console.log("tree ", tree);
        };
        setZeusTreeWindow();


        // const getMerkleTree = async () => {
        //     const zeus = await buildPoseidon();
        //     const newTree = new MerkleTree(20, "test", new PoseidonHasher(zeus));

        //     getMerkleTreePromise()
        //         .then(async (snapshot: DataSnapshot) => {
        //             if (snapshot.exists()) {
        //                 console.log("found tree in database");
        //                 setTree({ ...newTree, zeroValues: snapshot.val() as string[] } as MerkleTree)
        //             } else {
        //                 console.log("no tree found in database");
        //                 writeTreeValues(newTree.zeroValues);
        //                 setTree(newTree);
        //             }
        //         })
        //         .catch((error) => {
        //             console.error(error);
        //         });
        // }
        // getMerkleTree();

    }, []);

    const downloadTxtFile = (jsonData: any) => {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(jsonData, null, 2)], {
            type: "text/plain",
        }); // Use null, 2 arguments to make the format pretty
        element.href = URL.createObjectURL(file);
        element.download = "mySecret.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        console.log("[handleFileUpload]")
        if (file) {
            const reader: FileReader = new FileReader();
            reader.onload = (e: any) => {
                try {
                    const json = JSON.parse(e.target.result);
                    console.log("JSON IN FILE IS : ", json);
                    setPrivateNote(json.hashCommitment);
                    setGlobalNullifer(json.nullifier)
                    setGlobalNulliferHash(json.hashNullifier)
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    alert("Invalid JSON content in the file.");
                }
            };
            reader.readAsText(file);
        }
    };

    // // pair useContractWrite with the usePrepareContractWrite hook to avoid UX pitfalls
    // const { config, error, isError } = usePrepareContractWrite({
    //     // address: '0xA78ADcae31FE6c67f9161c269f68FD74faea23AC',
    //     address: '0xb6c0774Ef50FD88B16DadBcC4333B43C8F771b82',
    //     abi: depositCrossChainABI,
    //     functionName: 'deposit',
    //     args: [
    //         `${debouncedHashCommitment}` as `0x${string}`,
    //         `${debouncedNetworkTo}`,
    //         `${address}`
    //     ],
    //     value: BigInt(`${debouncedDepositAmount}` + BigInt(100000000000000)),
    // })

    // const { data, write: writeDeposit } = useContractWrite(config);

    const { write: depositBnb } = useContractWrite({
        address: depositContractBnbAddress,
        abi: [
            {
                inputs: [
                    {
                        internalType: "bytes32",
                        name: "_commitment",
                        type: "bytes32",
                    },
                    {
                        internalType: "string",
                        name: "destinationChain",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "destinationAddress",
                        type: "string",
                    },
                ],
                name: "deposit",
                outputs: [],
                stateMutability: "payable",
                type: "function",
            },
        ],
        functionName: "deposit"
    });

    const { write: depositZkEVM } = useContractWrite({
        address: depositContractPolygonZkAddress,
        abi: [
            {
                inputs: [
                    {
                        internalType: "bytes32",
                        name: "_commitment",
                        type: "bytes32",
                    },
                    {
                        internalType: "string",
                        name: "destinationChain",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "destinationAddress",
                        type: "string",
                    },
                ],
                name: "deposit",
                outputs: [],
                stateMutability: "payable",
                type: "function",
            },
        ],
        functionName: "deposit",
    });

    const deposit = async () => {
        setDepositing(true);

        const nullifier = BigNumber.from(ethers.randomBytes(15)).toString();
        setGlobalNullifer(nullifier);
        console.log("[deposit] globalNullifier : ", nullifier);

        let newPoseidon = await buildPoseidon();

        const posHash = poseidonHash(newPoseidon, [nullifier, 0]);
        setHashCommitment(posHash);
        console.log("[deposit] hashCommitment: ", posHash); // for deposit

        const hashNullifier = poseidonHash(newPoseidon, [nullifier, 1, leafIndex]);

        console.log("tree before inser = ", tree);
        await tree?.insert(posHash);
        console.log("tree after insert = ", tree);

        setGlobalNulliferHash(hashNullifier);
        console.log("[deposit] globalNullifierHash after set: ", hashNullifier);

        const value = BigNumber.from(`${depositAmount}`).toHexString();
        downloadTxtFile({
            posHash,
            hashNullifier,
            nullifier,
            value,
        });

        // var total = depositAmount + BigNumber.from(200000000000000n)
        // writeDeposit?.();

        switch (networkFrom) {
            case Networks.Binance: {
                console.log("[depositBnb]");
                depositBnb?.({
                    args: [
                        `${posHash}`,
                        networkTo,
                        // scroll withdraw contract address
                        "0x70923C0e0b8521F6879224FB1682E88c04daE35c",
                    ],
                    value: BigInt(`${depositAmount}`) + BigInt("10000000000000000"),
                })
                break;
            }
            case Networks.PolygonZkEVM: {
                console.log("depositZkEVM");
                depositZkEVM?.({
                    args: [
                        `${posHash}`,
                        networkTo,
                        address,
                    ],
                    value: BigInt("2000000000000000"),
                })
                break;
            }
        }

        // const responseData = await depositApiCall(hashCommitment, networkTo);
       // const response = await fetch(`http://localhost:3001/deposit/${hashCommitment}/${networkTo}`)
        // const bodyData = await response.json()

       // response.json().then(console.log)

        setDepositing(false);
    };

    async function prove(witness: Witness) {
        const { proof } = await snarkjs.groth16.fullProve(witness, "withdraw.wasm", "circuit_final.zkey");
        const solProof = {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [
                [proof.pi_b[0][1], proof.pi_b[0][0]],
                [proof.pi_b[1][1], proof.pi_b[1][0]],
            ],
            c: [proof.pi_c[0], proof.pi_c[1]],
        };

        return solProof;
    }

    // //pair useContractWrite with the usePrepareContractWrite hook to avoid UX pitfalls
    // const { config: mantleConfig, error: mantleError } = usePrepareContractWrite({
    //     address: '0xD6dd35Aa31fF49d1620A8a91DEe0a011045b7656',
    //     abi: withdrawABI,
    //     functionName: 'withdraw',
    //     args: [
    //         debouncedWitnessProof !== undefined ? debouncedWitnessProof : defaultAbc,
    //         debouncedWitness !== undefined ? debouncedWitness.root as `0x${string}` : defaultBytes as `0x${string}`,
    //         debouncedWitness !== undefined ? debouncedWitness.nullifierHash as `0x${string}` : defaultBytes as `0x${string}`,
    //         debouncedWitness !== undefined ? debouncedWitness.recipient as `0x${string}` : address as `0x${string}`,
    //         debouncedWitness !== undefined ? debouncedWitness.relayer as `0x${string}` : address as `0x${string}`,
    //         debouncedWitness !== undefined ? BigInt(debouncedWitness.fee) : BigInt(0),
    //     ],
    //     value: BigInt(`${2000000000000000}`),
    // })

    // const { data: mantleData, write: withdrawFromMantle } = useContractWrite(mantleConfig);

    // //pair useContractWrite with the usePrepareContractWrite hook to avoid UX pitfalls
    // const { config: lineaConfig, error: lineaError } = usePrepareContractWrite({
    //     address: '0x550C6A96623a310eC1c446c27abE525d30c7f780',
    //     abi: withdrawABI,
    //     functionName: 'withdraw',
    //     args: [
    //         debouncedWitnessProof || defaultAbc,
    //         debouncedWitness?.root as `0x${string}`,
    //         debouncedWitness?.nullifierHash as `0x${string}`,
    //         debouncedWitness?.recipient as `0x${string}`,
    //         debouncedWitness?.relayer as `0x${string}`,
    //         BigInt(debouncedWitness?.fee || 0),
    //     ],
    //     value: BigInt(`${2000000000000000}`),
    // })

    // const { data: lineaData, write: withdrawFromLinea } = useContractWrite(lineaConfig);

    // pair useContractWrite with the usePrepareContractWrite hook to avoid UX pitfalls
    // const { config: scrollConfig, error: scrollError, refetch } = usePrepareContractWrite({
    //     address: '0xb6c0774ef50fd88b16dadbcc4333b43c8f771b82',
    //     abi: withdrawABI,
    //     functionName: 'withdraw',
    //     args: [
    //         debouncedWitnessProof || defaultAbc,
    //         debouncedWitness?.root as `0x${string}`,
    //         debouncedWitness?.nullifierHash as `0x${string}`,
    //         debouncedWitness?.recipient as `0x${string}`,
    //         debouncedWitness?.relayer as `0x${string}`,
    //         BigInt(debouncedWitness?.fee || 0),
    //     ],
    //     value: BigInt(`${debouncedDepositAmount}`),
    // })

    // const { data: scrollData, write: withdrawFromScroll } = useContractWrite(scrollConfig);

    const { write: withdrawFromScroll2 } = useContractWrite({
        address: withdrawContractScrollAddress,
        abi: [
            {
                inputs: [
                    {
                        components: [
                            {
                                internalType: "uint256[2]",
                                name: "a",
                                type: "uint256[2]",
                            },
                            {
                                internalType: "uint256[2][2]",
                                name: "b",
                                type: "uint256[2][2]",
                            },
                            {
                                internalType: "uint256[2]",
                                name: "c",
                                type: "uint256[2]",
                            },
                        ],
                        internalType: "struct Proof",
                        name: "_proof",
                        type: "tuple",
                    },
                    {
                        internalType: "bytes32",
                        name: "_root",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "_nullifierHash",
                        type: "bytes32",
                    },
                    {
                        internalType: "address",
                        name: "_recipient",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "_relayer",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "_fee",
                        type: "uint256",
                    },
                ],
                name: "withdraw",
                outputs: [],
                stateMutability: "payable",
                type: "function",
            }
        ],
        functionName: "withdraw",
    })


    const withdraw = async () => {
        // const apiCallLeaf = leafIndexApiCall(networkTo);
        console.log("[withdraw]");

        let leafIndex: number = 0;
        const leafResponse = await fetch(`http://localhost:3001/leafindex/${networkTo}`) // leafindex
        await leafResponse.json().then(res => {
            console.log("leafResponse res = ", leafResponse);
            leafIndex = res;
        });

        console.log("[[[]]] leafIndex = ", leafIndex);

        if (tree === undefined) {
            console.error("tree is undefined");
        }
        leafIndex = 0; //calls to backend give wrong results
        const { root, pathElements, pathIndex } = await tree!.path(
            leafIndex
        );

        console.log("root : ", root);
        console.log("pathElements : ", pathElements);
        console.log("pathIndex : ", pathIndex);

        // const responseData = withdrawApiCall(leafIndex, networkTo);

        // this calls to backend are broken
        // const response = await fetch(`http://localhost:3001/withdraw/${leafIndex}/${networkTo}`)
        // let data: any;
        // console.log("response = ", response);
        // await response.json().then(((res) => {
        //     data = res
        // }));
        // console.log("data.root : ", data.root);
        // console.log("data.pathElements : ", data.path_elements);
        // console.log("data.pathIndex : ", data.path_index);


        console.log("globalNullifier = ", globalNullifier);
        console.log("globalNullifierHash = ", globalNullifierHash);
        const fee = 0;
        const constructedWitness: Witness = {
            // Public
            // root: `${bodyData.root}`,
            root,
            nullifierHash: globalNullifierHash,
            recipient: `${address}`,
            relayer: `${address}`,
            fee,
            // Private (user keep)
            nullifier: BigNumber.from(globalNullifier).toBigInt(),
            // pathElements: bodyData.path_elements,
            pathElements: pathElements,
            // pathIndices: bodyData.path_index,
            pathIndices: pathIndex,
        };
        setWitness(witness);

        const solProof = await prove(constructedWitness);
        console.log("solProof = ", solProof);
        setWitnessProof(solProof);

        switch (networkTo) {
            case Networks.Mantle: {
                // withdrawFromMantle?.();
                break;
            }
            case Networks.Goerly: {
                // withdrawFromLinea?.();
                break;
            }
            case Networks.Scroll: {
                // withdrawFromScroll?.();
                // break;
                console.log("root = ", root);
                console.log("globalNullifierHash = ", globalNullifierHash);
                console.log("recipient and relayer = ", address);

                withdrawFromScroll2?.({
                    args: [
                        solProof,
                        constructedWitness.root,
                        constructedWitness.nullifierHash,
                        constructedWitness.recipient,
                        constructedWitness.relayer,
                        constructedWitness.fee
                    ]
                })
                break;
            }
            default: {
                log.warn("mantle and linea are the only ones configured")
                break;
            }
        }
    };

    return (
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
            <div className={styles.homepage}>
                <Grid container spacing={0} direction="column" alignItems="center">
                    <Grid item>
                        <CustomAccordion className={styles.accordian}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header">
                                <Typography>Introduction</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" gutterBottom>
                                    Kaviar allows cross-chain private transactions.
                                </Typography>
                            </AccordionDetails>
                        </CustomAccordion>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "70vh",
                            }}>
                            <div style={{ maxWidth: "500px", minWidth: "500px" }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <StyledPinkButton
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={() => {
                                                setTabOption(TabOption.Deposit);
                                            }}>
                                            Deposit
                                        </StyledPinkButton>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <StyledButton
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={() => {
                                                setTabOption(TabOption.Withdraw);
                                            }}>
                                            Withdraw
                                        </StyledButton>
                                    </Grid>
                                    {tabOption === TabOption.Deposit && (
                                        <Grid item xs={12}>
                                            <StyledPinkPaper>
                                                <FormControl fullWidth>
                                                    <InputLabel
                                                        sx={{ color: "white" }}
                                                        id="select-from-network-label">
                                                        Network From
                                                    </InputLabel>
                                                    <StyledSelect
                                                        fullWidth
                                                        labelId="select-from-network-label"
                                                        id="select-from-network"
                                                        value={networkFrom}
                                                        label="Network From"
                                                        onChange={(e: SelectChangeEvent<unknown>) => {
                                                            setNetworkFrom(e.target.value as Networks);
                                                        }}>
                                                        <MenuItem value={Networks.Ethereum}>Ethereum Network</MenuItem>
                                                        <MenuItem value={Networks.Mantle}>Mantle Network</MenuItem>
                                                        <MenuItem value={Networks.Goerly}>Linea Network</MenuItem>
                                                        <MenuItem value={Networks.Polygon}>Polygon Network</MenuItem>
                                                        <MenuItem value={Networks.PolygonZkEVM}>Polygon ZkEVM Network</MenuItem>
                                                        <MenuItem value={Networks.Scroll}>Scroll Network</MenuItem>
                                                        <MenuItem value={Networks.Binance}>Binance Network</MenuItem>
                                                    </StyledSelect>
                                                </FormControl>
                                                <br />
                                                <br />
                                                <FormControl fullWidth>
                                                    <InputLabel
                                                        sx={{ color: "white" }}
                                                        id="select-to-network-label">
                                                        Network To
                                                    </InputLabel>
                                                    <StyledSelect
                                                        fullWidth
                                                        labelId="select-to-network-label"
                                                        id="select-to-network"
                                                        value={networkTo}
                                                        label="Network To"
                                                        onChange={(e: SelectChangeEvent<unknown>) => {
                                                            console.log("network to ", e.target.value);
                                                            setNetworkTo(e.target.value as Networks);
                                                        }}>
                                                        <MenuItem value={Networks.Ethereum}>Ethereum Network</MenuItem>
                                                        <MenuItem value={Networks.Mantle}>Mantle Network</MenuItem>
                                                        <MenuItem value={Networks.Goerly}>Linea Network</MenuItem>
                                                        <MenuItem value={Networks.Polygon}>Polygon Network</MenuItem>
                                                        <MenuItem value={Networks.PolygonZkEVM}>Polygon ZkEVM Network</MenuItem>
                                                        <MenuItem value={Networks.Scroll}>Scroll Network</MenuItem>
                                                        <MenuItem value={Networks.Binance}>Binance Network</MenuItem>
                                                    </StyledSelect>
                                                </FormControl>
                                                <br />
                                                <br />
                                                <FormControl fullWidth>
                                                    <InputLabel
                                                        sx={{ color: "white" }}
                                                        id="select-amount-label">
                                                        Amount
                                                    </InputLabel>
                                                    <StyledSelect
                                                        fullWidth
                                                        labelId="select-amount-label"
                                                        id="select-amount"
                                                        value={depositAmount ?? ""}
                                                        defaultValue={""}
                                                        label="Amount"
                                                        onChange={(e: SelectChangeEvent<unknown>) => {
                                                            console.log("depositing amount = ", e.target.value)
                                                            setDepositAmount(e.target.value as BigInt);
                                                        }}>
                                                        <MenuItem value={1000000000000000}>
                                                            0.001 Ether
                                                        </MenuItem>
                                                        <MenuItem value={100000000000000000}>
                                                            0.1 Ether
                                                        </MenuItem>
                                                        <MenuItem value={1000000000000000000}>
                                                            1 Ether
                                                        </MenuItem>
                                                        <MenuItem value={10000000000000000000}>
                                                            10 Ether
                                                        </MenuItem>
                                                        <MenuItem value={32000000000000000000}>
                                                            32 Ether
                                                        </MenuItem>
                                                    </StyledSelect>
                                                </FormControl>
                                                <br />
                                                <br />
                                                <StyledButton
                                                    fullWidth
                                                    variant="contained"
                                                    size="large"
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        await deposit();
                                                    }}>
                                                    Deposit Now!
                                                </StyledButton>
                                            </StyledPinkPaper>
                                        </Grid>
                                    )}
                                    {tabOption === TabOption.Withdraw && (
                                        <Grid item xs={12}>
                                            <StyledPurplePaper>
                                                <FormControl fullWidth>
                                                    <InputLabel
                                                        sx={{ color: "white" }}
                                                        id="select-from-network-label">
                                                        Network From
                                                    </InputLabel>
                                                    <StyledSelect
                                                        fullWidth
                                                        labelId="select-from-network-label"
                                                        id="select-from-network"
                                                        value={networkFrom}
                                                        label="Network From"
                                                        onChange={(e: SelectChangeEvent<unknown>) => {
                                                            setNetworkFrom(e.target.value as Networks);
                                                        }}>
                                                        <MenuItem value={Networks.Ethereum}>Ethereum Network</MenuItem>
                                                        <MenuItem value={Networks.Mantle}>Mantle Network</MenuItem>
                                                        <MenuItem value={Networks.Goerly}>Linea Network</MenuItem>
                                                        <MenuItem value={Networks.Polygon}>Polygon Network</MenuItem>
                                                        <MenuItem value={Networks.PolygonZkEVM}>Polygon ZkEVM Network</MenuItem>
                                                        <MenuItem value={Networks.Scroll}>Scroll Network</MenuItem>
                                                        <MenuItem value={Networks.Binance}>Binance Network</MenuItem>
                                                    </StyledSelect>
                                                </FormControl>
                                                <br />
                                                <br />
                                                <FormControl fullWidth>
                                                    <InputLabel
                                                        sx={{ color: "white" }}
                                                        id="select-to-network-label">
                                                        Network To
                                                    </InputLabel>
                                                    <StyledSelect
                                                        fullWidth
                                                        labelId="select-to-network-label"
                                                        id="select-to-network"
                                                        value={networkTo}
                                                        label="Network To"
                                                        onChange={(e: SelectChangeEvent<unknown>) => {
                                                            setNetworkTo(e.target.value as Networks);
                                                        }}>
                                                        <MenuItem value={Networks.Ethereum}>Ethereum Network</MenuItem>
                                                        <MenuItem value={Networks.Mantle}>Mantle Network</MenuItem>
                                                        <MenuItem value={Networks.Goerly}>Linea Network</MenuItem>
                                                        <MenuItem value={Networks.Polygon}>Polygon Network</MenuItem>
                                                        <MenuItem value={Networks.PolygonZkEVM}>Polygon ZkEVM Network</MenuItem>
                                                        <MenuItem value={Networks.Scroll}>Scroll Network</MenuItem>
                                                        <MenuItem value={Networks.Binance}>Binance Network</MenuItem>
                                                    </StyledSelect>
                                                </FormControl>
                                                <br />
                                                <br />
                                                <FormControl fullWidth>
                                                    <InputLabel
                                                        sx={{ color: "white" }}
                                                        id="select-amount-label">
                                                        Amount
                                                    </InputLabel>
                                                    <StyledSelect
                                                        fullWidth
                                                        labelId="select-amount-label"
                                                        id="select-amount"
                                                        value={depositAmount}
                                                        defaultValue={""}
                                                        label="Amount"
                                                        onChange={(e: any) => {
                                                            setWithdrawAmount(e.target.value);
                                                        }}>
                                                        <MenuItem value={1000000000000000}>
                                                            0.001 Ether
                                                        </MenuItem>
                                                        <MenuItem value={100000000000000000}>
                                                            0.1 Ether
                                                        </MenuItem>
                                                        <MenuItem value={1000000000000000000}>
                                                            1 Ether
                                                        </MenuItem>
                                                        <MenuItem value={10000000000000000000}>
                                                            10 Ether
                                                        </MenuItem>
                                                        <MenuItem value={32000000000000000000}>
                                                            32 Ether
                                                        </MenuItem>
                                                    </StyledSelect>
                                                </FormControl>
                                                <br />
                                                <br />
                                                <StyledPinkButton
                                                    variant="contained"
                                                    href="#file-upload"
                                                    fullWidth>
                                                    Upload Secret Text File
                                                    <VisuallyHiddenInput
                                                        accept=".txt"
                                                        type="file"
                                                        onChange={handleFileUpload} />
                                                </StyledPinkButton>
                                                <br />
                                                <br />
                                                <StyledPinkButton
                                                    fullWidth
                                                    variant="contained"
                                                    size="large"
                                                    onClick={async (e) => {
                                                        e.preventDefault()
                                                        await withdraw()
                                                    }}>
                                                    Withdraw Now!
                                                </StyledPinkButton>
                                            </StyledPurplePaper>
                                        </Grid>
                                    )}
                                </Grid>
                                {`${tabOption}\n`}
                                {`${networkFrom}\n`}
                                {`${networkTo}\n`}
                                {`${depositAmount}\n`}
                                {`${privateNote}\n`}
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </Slide >
    );
};

export default Home;
