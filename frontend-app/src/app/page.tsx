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
    usePrepareContractWrite
} from "wagmi";
import { buildPoseidon } from "circomlibjs";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { MerkleTree } from "@/utils/merkleTree";
import { PoseidonHasher, poseidonHash } from "@/utils/poseidon";
import {
    depositCrossChainABI,
    withdrawFromMantleABI,
    withdrawFromLineaABI
} from "@/utils/abis";
import { log } from "@/utils/logger";
import {
    deposit as depositApiCall,
    leafIndex as leafIndexApiCall,
    withdraw as withdrawApiCall
} from "@/api/api";
import styles from './page.module.css';

const snarkjs = require("snarkjs");

enum TabOption {
    Deposit,
    Withdraw,
}

enum Networks {
    Ethereum = "ethereum",
    Mantle = "mantle",
    Arbitrum = "arbitrum",
    Polygon = "polygon",
    Goerly = "goerly",
}

const Home: NextPage = () => {
    const [tabOption, setTabOption] = useState<TabOption>(TabOption.Deposit);
    const [tree, setTree] = useState<MerkleTree>();
    const [networkFrom, setNetworkFrom] = useState<Networks>(Networks.Ethereum);
    const [networkTo, setNetworkTo] = useState<Networks>(Networks.Mantle);
    const [depositing, setDepositing] = useState(false);
    const [depositAmount, setDepositAmount] = useState<BigInt>();
    const [withdrawAmount, setWithdrawAmount] = useState<BigInt>();
    const [privateNote, setPrivateNote] = useState<string>();
    const [hashCommitment, setHashCommitment] = useState<string>("0x" + "0".repeat(64));
    const [globalNullifier, setGlobalNullifer] = useState<string>();
    const [globalNullifierHash, setGlobalNulliferHash] = useState<string>();
    const [leafIndex, setLeafIndex] = useState(0); // mantle: 0, linea: 0
    const [witnessProof, setWitnessProof] = useState<{ a: any[2]; b: any[2][2]; c: any[2]; }>();
    const [witness, setWitness] = useState<Witness>();

    const debouncedNetworkTo = useDebounce(networkTo);
    const debouncedHashCommitment = useDebounce(hashCommitment);
    const debouncedWitnessProof = useDebounce(witnessProof);
    const debouncedWitness = useDebounce(witness);

    const defaultAbc: { a: number[]; b: number[][]; c: number[]; } = {
        a: [0, 0], b: [[0, 0], [0, 0]], c: [0, 0]
    }
    const defaultBytes = "0".repeat(32);

    // wagmi
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

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
        const getZeusTreeWindow = async () => {
            const zeus = await buildPoseidon();
            const tree = new MerkleTree(20, "test", new PoseidonHasher(zeus));
            setTree(tree);
            console.log("tree ", tree);
        };
        getZeusTreeWindow();
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

    //pair useContractWrite with the usePrepareContractWrite hook to avoid UX pitfalls
    const { config, error, isError } = usePrepareContractWrite({
        address: '0xA78ADcae31FE6c67f9161c269f68FD74faea23AC',
        abi: depositCrossChainABI,
        functionName: 'deposit',
        args: [
            `${debouncedHashCommitment}` as `0x${string}`,
            `${debouncedNetworkTo}`,
            `${address}`
        ],
        value: BigInt(`${2000000000000000}`),
    })

    const { data, write } = useContractWrite(config);

    const deposit = async () => {
        setDepositing(true);

        const nullifier = BigNumber.from(ethers.randomBytes(15)).toString();
        const value = BigNumber.from(`${depositAmount}`).toHexString();
        console.log("nullifier : ", nullifier);
        console.log("value : ", value);

        let newPoseidon = await buildPoseidon();
        console.log("newPoseidon : ", newPoseidon);

        const hashCommitment = poseidonHash(newPoseidon, [nullifier, 0]);
        const hashNullifier = poseidonHash(newPoseidon, [nullifier, 1, leafIndex]);
        setHashCommitment(hashCommitment);
        console.log("hashCommitment: ", hashCommitment); // for deposit
        tree?.insert(hashCommitment)
        setGlobalNullifer(nullifier);
        setGlobalNulliferHash(hashNullifier);
        console.log("hashNullifier: ", hashNullifier);

        downloadTxtFile({
            hashCommitment,
            hashNullifier,
            nullifier,
            value,
        });


        write?.();

        const responseData = await depositApiCall(hashCommitment, networkTo)
        console.log("deposit data response: ", responseData);

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

    //pair useContractWrite with the usePrepareContractWrite hook to avoid UX pitfalls
    const { config: mantleConfig, error: mantleError } = usePrepareContractWrite({
        address: '0xD6dd35Aa31fF49d1620A8a91DEe0a011045b7656',
        abi: withdrawFromMantleABI,
        functionName: 'withdraw',
        args: [
            debouncedWitnessProof !== undefined ? debouncedWitnessProof : defaultAbc,
            debouncedWitness !== undefined ? debouncedWitness.root as `0x${string}` : defaultBytes as `0x${string}`,
            debouncedWitness !== undefined ? debouncedWitness.nullifierHash as `0x${string}` : defaultBytes as `0x${string}`,
            debouncedWitness !== undefined ? debouncedWitness.recipient as `0x${string}` : address as `0x${string}`,
            debouncedWitness !== undefined ? debouncedWitness.relayer as `0x${string}` : address as `0x${string}`,
            debouncedWitness !== undefined ? BigInt(debouncedWitness.fee) : BigInt(0),
        ],
        value: BigInt(`${2000000000000000}`),
    })

    const { data: mantleData, write: withdrawFromMantle } = useContractWrite(mantleConfig);

    // //pair useContractWrite with the usePrepareContractWrite hook to avoid UX pitfalls
    // const { config: lineaConfig, error: lineaError } = usePrepareContractWrite({
    //     address: '0x550C6A96623a310eC1c446c27abE525d30c7f780',
    //     abi: withdrawFromLineaABI,
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

    const withdraw = async () => {
        // const apiCallLeaf = leafIndexApiCall(networkTo);
        console.log("[withdraw]");

        const leafResponse = await fetch(`http://localhost:3001/leafindex/${networkTo}`) // leafindex
        const leafIndex = await leafResponse.json()
        console.log("leafIndex = ", leafIndex);

        interface treeElements {
            root: string
            pathElements: string[]
            pathIndex: number[]
        };
        let elements: treeElements;
        if (tree !== undefined) {
            elements = await tree.path(
                leafIndex
            );
        } else {
            log.error("merkle tree is undefined")
            return
        }

        console.log("root : ", elements.root);
        console.log("pathElements : ", elements.pathElements);
        console.log("pathIndex : ", elements.pathIndex);

        // const responseData = withdrawApiCall(leafIndex, networkTo);
        // console.log("responseData for [withdraw], ", responseData);

        const response = await fetch(`http://localhost:3001/withdraw/${leafIndex}/${networkTo}`)
        const bodyData = await response.json()
        console.log("bodyData: ", bodyData);

        const fee = 0;
        const constructedWitness: Witness = {
            // Public
            root: `${bodyData.root}`,
            nullifierHash: globalNullifierHash,
            recipient: `${address}`,
            relayer: `${address}`,
            fee,
            // Private (user keep)
            nullifier: BigNumber.from(globalNullifier).toBigInt(),
            pathElements: bodyData.path_elements,
            pathIndices: bodyData.path_index,
        };
        setWitness(witness);

        const solProof = await prove(constructedWitness);
        console.log("solProof : ", solProof);
        setWitnessProof(solProof);

        switch (networkFrom) {
            case Networks.Mantle: {
                withdrawFromMantle?.();
                break;
            }
            case Networks.Goerly: {
                // withdrawFromLinea?.();
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
                                    Kaviar allos cross-chain private transactions.
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
