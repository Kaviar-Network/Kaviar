"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styles from "./page.module.css";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Typography,
  Button,
  Grid,
  Divider,
  Box,
  Chip,
  Tabs,
  Tab,
  Paper,
  Modal,
  Slide,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import CryptoJS from "crypto-js";
import ReactEcharts from "echarts-for-react";
// import DataEditor from "@glideapps/glide-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import PropTypes from "prop-types";
import coverJson from "./cover.json";
import Decimal from "decimal.js";
import { parseEther } from "viem";
import { ethers } from "ethers";
import utils from "../methods/utils.js";
import { BigNumber } from "@ethersproject/bignumber";
import { poseidonContract, buildPoseidon } from "circomlibjs";
import { poseidonHash, PoseidonHasher } from "../methods/hashing";
import depositAbi from "./depositAbi.json";
import { MerkleTree } from "../methods/merkleTree";
// import { getProver, Groth16 } from '@railgun-community/wallet';
// const snarkjs = window.snarkjs;


// const wc = require("../circuit/witness_calculator.js");

const onSenEtherAddress = "0x06DB9c2856Eab779B2794E98c769a2e6aDA4D4b6";
const onSenEtherABI = {};
// const onSenEtherInterface = new ethers.utils.Interface([]);

const StyledSelect = styled(Select)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiFormLabel-root": {
    color: "white",
  },
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "& .MuiSvgIcon-root": {
    color: "white",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
});

const StyledChip = styled(Chip)({
  "& .MuiChip-deleteIcon": {
    color: "white",
  },
  "&:hover .MuiChip-deleteIcon": {
    color: "white",
  },
  "& .MuiChip-label": {
    color: "white",
  },
});

const StyledTab = styled(Tab)({
  color: "white",
  "&.Mui-selected": {
    // color: theme.palette.primary.main,
  },
});

const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiFormLabel-root": {
    color: "white",
  },
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "& .MuiSvgIcon-root": {
    color: "white",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
});

const StyledDataGrid = styled(DataGrid)({
  "& .MuiDataGrid-row": {
    height: "25px",
  },
  "& .MuiDataGrid-cell": {
    padding: "0 4px",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#5b6dd5", // Change this to the color you want on hover
  },
  "& .MuiDataGrid-row.Mui-selected": {
    backgroundColor: "#8CD987 !important", // Change this to the color you want for selected rows
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiFormLabel-root": {
    color: "white",
  },
});

const CustomAccordion = styled(Accordion)({
  color: "rgba(236,236,241,1)",
  background: "#843de7",
});

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const StyledPinkPaper = styled(Paper)(({ theme }) => ({
  margin: "1em",
  padding: theme.spacing(2),
  color: "white",
  background: "#ef7f91",
  border: 0,
  borderRadius: 3,
  textAlign: "center",
  margin: 0,
}));

const StyledPurplePaper = styled(Paper)(({ theme }) => ({
  margin: "1em",
  padding: theme.spacing(2),
  color: "white",
  background: "#7826eb",
  border: 0,
  borderRadius: 3,
  textAlign: "center",
  margin: 0,
}));

const StyledModalBox = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  background: "#000",
  padding: "1em",
  height: 110,
});

const StyledModalBoxTwo = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  background: "#000",
  padding: "1em",
  // width: 500,
});

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const StyledButton = styled(Button)({
  height: "70px",
  "& .MuiButton-label": {
    fontSize: "1.5rem", // Increase the font size
  },
});

const StyledPinkButton = styled(Button)({
  height: "70px",
  backgroundColor: "#ef7f91", // Set the background color to pink
  "&:hover": {
    backgroundColor: "#ef7f91", // Adjust the hover color if needed
  },
  "& .MuiButton-label": {
    fontSize: "1.5rem", // Increase the font size
  },
});

export default function Home(props) {
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  // const { data, isError, isLoading } = useContractRead({
  //   address: '0xf25a91E4042BD119Ac55830158B911eA535a27c9',
  //   abi: coverJson.abi,
  //   functionName: 'getUnitPX',
  //   args: ["0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"]
  // })

  const [pageState, setPageState] = useState("deposit");
  const [networkFrom, setNetWorkFrom] = useState("ethereum");
  const [networkTo, setNetWorkTo] = useState("mantle");
  const [depositAmount, setDepositAmount] = useState(1000000000000000);
  const [withdrawAmount, setWithdrawAmount] = useState(100000000000000000);
  const [privateNote, setPrivateNote] = useState("");
  const [globalNullifier, setGlobalNullifer] = useState("");
  const [globalNullifierHash, setGlobalNulliferHash] = useState("");
  const [leafIndex, setLeafIndex] = useState(0); // mantle: 0, linea: 0

  const [zeus, setZues] = useState(true);
  const [farawayTree, setFarawayTree] = useState(true);

  const [depositState, setDepositState] = useState(false);

  const init = async () => {
    const zeus = await buildPoseidon();
    // setZues(zeus);
    window.zeus = zeus;
    const tree = new MerkleTree(20, "test", new PoseidonHasher(zeus));
    window.tree = tree;
    // setFarawayTree(tree)
    console.log("faraway ", tree);
  };

  useEffect(() => {
    init();
    // init().then(data => setPoseidon(data));
    // console.log("merkletree");
  }, []);

  const { write } = useContractWrite({
    address: "0xA78ADcae31FE6c67f9161c269f68FD74faea23AC",
    abi: [
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "_commitment",
            type: "bytes32",
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

  // FOR WITHDRAW

  const { write: withdrawFromMantle } = useContractWrite({
    address: "0xD6dd35Aa31fF49d1620A8a91DEe0a011045b7656",
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

  const { write: withdrawFromLinea } = useContractWrite({
    address: "0x550C6A96623a310eC1c446c27abE525d30c7f780",
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


  // console.log("write : ", write);
  const { address, connector, isConnected } = useAccount();
  console.log("isConnected : ", isConnected);
  console.log("address : ", address);
  console.log("connector : ", connector);

  const downloadTxtFile = (jsonData) => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "text/plain",
    }); // Use null, 2 arguments to make the format pretty
    element.href = URL.createObjectURL(file);
    element.download = "mySecret.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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

  const a = {
    root: '0x1bdb6fdbe8e30e778194570894e4341c9e4b1c42aa27ef161814d5be735bbef4',
    nullifierHash: '0x18bf66d22c4afbcdeb8ed2b6380bf684b890ede292feea2313e421c381ad8774',
    recipient: '0xcbCe1adFbDb6b0dDaFcFaf3Bf7ea4f2781434c8D',
    relayer: '0x80cd2Bc6f7C420D3960efeb27a225f236bdD0d41',
    fee: 0,
    nullifier: 450480740928811748528077665108377251n,
    pathElements: [
      '21663839004416932945382355908790599225266501822907911457504978515578255421292',
      '0x13e37f2d6cb86c78ccc1788607c2b199788c6bb0a615a21f2e7a8e88384222f8',
      '0x217126fa352c326896e8c2803eec8fd63ad50cf65edfef27a41a9e32dc622765',
      '0x0e28a61a9b3e91007d5a9e3ada18e1b24d6d230c618388ee5df34cacd7397eee',
      '0x27953447a6979839536badc5425ed15fadb0e292e9bc36f92f0aa5cfa5013587',
      '0x194191edbfb91d10f6a7afd315f33095410c7801c47175c2df6dc2cce0e3affc',
      '0x1733dece17d71190516dbaf1927936fa643dc7079fc0cc731de9d6845a47741f',
      '0x267855a7dc75db39d81d17f95d0a7aa572bf5ae19f4db0e84221d2b2ef999219',
      '0x1184e11836b4c36ad8238a340ecc0985eeba665327e33e9b0e3641027c27620d',
      '0x0702ab83a135d7f55350ab1bfaa90babd8fc1d2b3e6a7215381a7b2213d6c5ce',
      '0x2eecc0de814cfd8c57ce882babb2e30d1da56621aef7a47f3291cffeaec26ad7',
      '0x280bc02145c155d5833585b6c7b08501055157dd30ce005319621dc462d33b47',
      '0x045132221d1fa0a7f4aed8acd2cbec1e2189b7732ccb2ec272b9c60f0d5afc5b',
      '0x27f427ccbf58a44b1270abbe4eda6ba53bd6ac4d88cf1e00a13c4371ce71d366',
      '0x1617eaae5064f26e8f8a6493ae92bfded7fde71b65df1ca6d5dcec0df70b2cef',
      '0x20c6b400d0ea1b15435703c31c31ee63ad7ba5c8da66cec2796feacea575abca',
      '0x09589ddb438723f53a8e57bdada7c5f8ed67e8fece3889a73618732965645eec',
      '0x0064b6a738a5ff537db7b220f3394f0ecbd35bfd355c5425dc1166bf3236079b',
      '0x095de56281b1d5055e897c3574ff790d5ee81dbc5df784ad2d67795e557c9e9f',
      '0x11cf2e2887aa21963a6ec14289183efe4d4c60f14ecd3d6fe0beebdf855a9b63'
    ],
    pathIndices: [
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ]
  }

  const withdrawTest = async () => {
    const results = await prove(a)
    console.log(results);
    withdrawFromMantle({
      args: [results, a.root, a.nullifierHash, a.recipient, a.relayer, a.fee]
    })
  }

  async function prove(witness) {
    const { proof } = await window.snarkjs.groth16.fullProve(witness, "withdraw.wasm", "circuit_final.zkey");
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

  async function new_tree() {
    const zeus = await buildPoseidon();
    // setZues(zeus);
    window.zeus2 = zeus;
    const tree2 = new MerkleTree(20, "test", new PoseidonHasher(zeus2));
    window.tree2 = tree2;

    const nullifier = 1257351033063638949926321903661074149n
    const nullifierHash = "0x2768b85b4e55477722d96ec06940783853f4b7b2d63eb6d3cedbd58275b7dba2"
    // const leafIndex = 0
    const commitment = "0x1b4e4d0faf36ea867b100696baa7d962175c82a4a1530903910bf368d9d2e53e"
    console.log(tree);
    
    //console.log(await tree.root(), await tornadoContract.roots(0));
    await tree2.insert(commitment);

    const { root, path_elements, path_index } = await tree2.path(
      0
    );
    
    console.log("root : ", root);
    console.log("path_elements : ", path_elements);
    console.log("path_index : ", path_index);

    const witness = {
      // Public
      root: `${root}`,
      nullifierHash: `${nullifierHash}`,
      recipient: `${address}`, // this case is myself
      relayer: `${address}`, // this case is myself
      fee: 0,
      // Private (user keep)
      nullifier: nullifier,
      pathElements: path_elements,
      pathIndices: path_index,
    };

    console.log("witness : ", witness);

    // window.global_witness = witness;
  
    const solProof = await prove(witness);

    console.log("solProof : ", solProof);
  }

  async function withdraw() {

    // const nullifierHash = privateNote;
    const recipient = address;
    const relayer = address;
    const fee = 0;

    console.log("withdrawal in progress");

    const leafResponse = await fetch(`http://localhost:3001/leafindex/${networkTo}`) // leafindex

    const leafData = await leafResponse.json()

    console.log("leafData: ", leafData);

    return
  
    const { root, path_elements, path_index } = await window.tree.path(
      leafIndex
    );

    console.log("root : ", root);
    console.log("path_elements : ", path_elements);
    console.log("path_index : ", path_index);

    console.log("globalNullifier : ", globalNullifier);
    console.log("globalNullifierHash : ", globalNullifierHash);

    console.log("globalNullifier : ", BigNumber.from(globalNullifier).toBigInt());

  
    // then call useContractWrite again 

    const response = await fetch(`http://localhost:3001/withdraw/${leafIndex}/${networkTo}`) // leafindex

    const bodyData = await response.json()

    console.log("bodyData: ", bodyData);

    const witness = {
      // Public
      root: `${bodyData.root}`,
      nullifierHash: globalNullifierHash,
      recipient: `${address}`, // this case is myself
      relayer: `${address}`, // this case is myself
      fee,
      // Private (user keep)
      nullifier: BigNumber.from(globalNullifier).toBigInt(),
      pathElements: bodyData.path_elements,
      pathIndices: bodyData.path_index,
    };

    console.log("witness : ", witness);
  
    const solProof = await prove(witness);

    console.log("solProof : ", solProof);


    if (networkFrom === "mantle") {
      withdrawFromMantle({
        args: [solProof, witness.root, witness.nullifierHash, witness.recipient, witness.relayer, witness.fee]
      })
    } else {
      withdrawFromLinea({
        args: [solProof, witness.root, witness.nullifierHash, witness.recipient, witness.relayer, witness.fee]
      })
    }
  }

  const depositEther = async () => {
    setDepositState(true);

    console.log("BigNumber : ", BigNumber);
    const nullifier = BigNumber.from(ethers.randomBytes(15)).toString();
    const value = BigNumber.from(`${depositAmount}`).toHexString();
    console.log("nullifier : ", nullifier);
    console.log("value : ", value);

    let newPoseidon = await buildPoseidon();

    console.log("newPoseidon : ", newPoseidon);

    const hashCommitment = poseidonHash(newPoseidon, [nullifier, 0]);
    const hashNullifier = poseidonHash(newPoseidon, [nullifier, 1, leafIndex]);

    console.log("hashCommitment: ", hashCommitment); // for deposit
    console.log("hashNullifier: ", hashNullifier);

    console.log("value : ", value);

    downloadTxtFile({
      hashCommitment,
      hashNullifier,
      nullifier,
      value,
    });

    setPrivateNote(hashCommitment);

    write?.({
      address: "0xA78ADcae31FE6c67f9161c269f68FD74faea23AC",
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
      args: [`${hashCommitment}`,"mantle","0xD6dd35Aa31fF49d1620A8a91DEe0a011045b7656"], // commited hash
      value: BigInt(`${2000000000000000}`),
    });

    const response = await fetch(`http://localhost:3001/deposit/${hashCommitment}/mantle`)

    const bodyData = await response.json()

    console.log("bodyData: ", bodyData);

    window.tree.insert(hashCommitment);

    setDepositState(false);
  };

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <div className={styles.homepage}>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
        >
          <Grid item>
            <CustomAccordion className={styles.accordian}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Introduction</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" gutterBottom>
                  Onsens by the Garden is a Booster Pack for the Ethereum
                  Community.
                </Typography>
                <br />
                <br />
              </AccordionDetails>
            </CustomAccordion>
            <br />
            <br />
            <div
              style={{
                display: "flex",
                justifyContent: "center", // This will align the div horizontally center.
                alignItems: "center", // This will align the div vertically center.
                height: "70vh", // This will take the full height of the screen.
              }}
            >
              <div style={{ maxWidth: "500px", minWidth: "500px" }}>
                {" "}
                {/* This is the child div with max-width 500px */}
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <StyledPinkButton
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => {
                        setPageState("deposit");
                      }}
                    >
                      Deposit
                    </StyledPinkButton>
                  </Grid>
                  <Grid item xs={6}>
                    <StyledButton
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => {
                        setPageState("withdraw");
                      }}
                    >
                      Withdraw
                    </StyledButton>
                  </Grid>
                  {pageState === "deposit" && (
                    <Grid item xs={12}>
                      <StyledPinkPaper>
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{ color: "white" }}
                            id="select-from-network-label"
                          >
                            Network From
                          </InputLabel>
                          <StyledSelect
                            fullWidth
                            labelId="select-from-network-label"
                            id="select-from-network"
                            value={networkFrom}
                            label="Network From"
                            onChange={(e) => {
                              setNetWorkFrom(e.target.value);
                            }}
                          >
                            <MenuItem value={"ethereum"}>
                              Ethereum Network
                            </MenuItem>
                            <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                            <MenuItem value={"linea"}>Linea Network</MenuItem>
                          </StyledSelect>
                        </FormControl>
                        <br />
                        <br />
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{ color: "white" }}
                            id="select-to-network-label"
                          >
                            Network To
                          </InputLabel>
                          <StyledSelect
                            fullWidth
                            labelId="select-to-network-label"
                            id="select-to-network"
                            value={networkTo}
                            label="Network To"
                            onChange={(e) => {
                              console.log(e.target.value);
                              setNetWorkTo(e.target.value);
                            }}
                          >
                            <MenuItem value={"ethereum"}>
                              Ethereum Network
                            </MenuItem>
                            <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                            <MenuItem value={"linea"}>Linea Network</MenuItem>
                          </StyledSelect>
                        </FormControl>
                        <br />
                        <br />
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{ color: "white" }}
                            id="select-amount-label"
                          >
                            Amount
                          </InputLabel>
                          <StyledSelect
                            fullWidth
                            labelId="select-amount-label"
                            id="select-amount"
                            value={depositAmount}
                            label="Amount"
                            onChange={(e) => {
                              setDepositAmount(e.target.value);
                            }}
                          >
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
                            await depositEther();
                          }}
                        >
                          Deposit Now!
                        </StyledButton>
                      </StyledPinkPaper>
                    </Grid>
                  )}
                  {pageState === "withdraw" && (
                    <Grid item xs={12}>
                      <StyledPurplePaper>
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{ color: "white" }}
                            id="select-from-network-label"
                          >
                            Network From
                          </InputLabel>
                          <StyledSelect
                            fullWidth
                            labelId="select-from-network-label"
                            id="select-from-network"
                            value={networkFrom}
                            label="Network From"
                            onChange={(e) => {
                              setNetWorkFrom(e.target.value);
                            }}
                          >
                            <MenuItem value={"ethereum"}>
                              Ethereum Network
                            </MenuItem>
                            <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                            <MenuItem value={"linea"}>Linea Network</MenuItem>
                          </StyledSelect>
                        </FormControl>
                        <br />
                        <br />
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{ color: "white" }}
                            id="select-to-network-label"
                          >
                            Network To
                          </InputLabel>
                          <StyledSelect
                            fullWidth
                            labelId="select-to-network-label"
                            id="select-to-network"
                            value={networkTo}
                            label="Network To"
                            onChange={(e) => {
                              setNetWorkTo(e.target.value);
                            }}
                          >
                            <MenuItem value={"ethereum"}>
                              Ethereum Network
                            </MenuItem>
                            <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                            <MenuItem value={"linea"}>Linea Network</MenuItem>
                          </StyledSelect>
                        </FormControl>
                        <br />
                        <br />
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{ color: "white" }}
                            id="select-amount-label"
                          >
                            Amount
                          </InputLabel>
                          <StyledSelect
                            fullWidth
                            labelId="select-amount-label"
                            id="select-amount"
                            value={depositAmount}
                            label="Amount"
                            onChange={(e) => {
                              setWithdrawAmount(e.target.value);
                            }}
                          >
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
                        {/* <StyledTextField
                        fullWidth
                        value={privateNote} 
                        id="private-note" 
                        label="Private Note" 
                        variant="outlined"
                        onChange={(e) => {
                          setPrivateNote(e.target.value)
                        }}
                      /> */}
                        <StyledPinkButton
                          component="label"
                          variant="contained"
                          href="#file-upload"
                          fullWidth
                        >
                          Upload Secret Text File
                          <VisuallyHiddenInput
                            accept=".txt"
                            type="file"
                            onChange={handleFileUpload}
                          />
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
                            // await new_tree()
                            // console.log('test withdraw');
                            // await withdrawTest()
                          }}
                        >
                          Withdraw Now!
                        </StyledPinkButton>
                      </StyledPurplePaper>
                    </Grid>
                  )}
                </Grid>
                {`${pageState}\n`}
                {`${networkFrom}\n`}
                {`${networkTo}\n`}
                {`${depositAmount}\n`}
                {`${privateNote}\n`}
              </div>
            </div>
          </Grid>
        </Grid>
        {/* write contract
                  write?.(); */}
      </div>
    </Slide>
  );
}
