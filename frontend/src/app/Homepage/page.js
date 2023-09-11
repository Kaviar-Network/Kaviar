"use client"
import Image from 'next/image'
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './page.module.css';
import { Select, MenuItem, InputLabel, FormControl, TextField, 
    Accordion, AccordionSummary, AccordionDetails, Autocomplete,
    Typography, Button, Grid, Divider, Box, Chip, Tabs, Tab, Paper, Modal, Slide,
    Stepper, Step, StepLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { styled } from '@mui/system';
import CryptoJS from 'crypto-js';
import ReactEcharts from "echarts-for-react"
// import DataEditor from "@glideapps/glide-data-grid";
import { LineChart } from '@mui/x-charts/LineChart';
import { useAccount, useConnect, useDisconnect, useContractRead,
  useContractWrite, usePrepareContractWrite
} from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import PropTypes from 'prop-types';
import coverJson from './cover.json'
import Decimal from 'decimal.js';
import { parseEther } from 'viem'
import { ethers } from "ethers";
import utils from '../methods/utils.js';
import { BigNumber } from "@ethersproject/bignumber";
import { poseidonContract, buildPoseidon } from "circomlibjs";
import {poseidonHash} from '../methods/hashing';

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
        color: 'white',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiSvgIcon-root': {
        color: 'white'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
});

const StyledChip = styled(Chip)({
    "& .MuiChip-deleteIcon": {
        color: 'white',
    },
    '&:hover .MuiChip-deleteIcon': {
        color: 'white',
    },
    "& .MuiChip-label": {
        color: 'white',
    },
});

const StyledTab = styled(Tab)({
  color: 'white',
  '&.Mui-selected': {
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
        color: 'white',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiSvgIcon-root': {
        color: 'white'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
});

const StyledDataGrid = styled(DataGrid)({
    '& .MuiDataGrid-row': {
        height: '25px',
    },
    '& .MuiDataGrid-cell': {
        padding: '0 4px',
      },
    '& .MuiDataGrid-row:hover': {
        backgroundColor: '#5b6dd5', // Change this to the color you want on hover
    },
    '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: '#8CD987 !important', // Change this to the color you want for selected rows
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
      color: "white"
    },
    "& .MuiFormLabel-root": {
      color: "white"
    }
  });

const CustomAccordion = styled(Accordion)({
    color: 'rgba(236,236,241,1)',
    background: '#843de7',
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
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const StyledPinkPaper = styled(Paper)(({ theme }) => ({
  margin: '1em',
  padding: theme.spacing(2),
  color: 'white',
  background: '#ef7f91',
  border: 0,
  borderRadius: 3,
  textAlign: 'center',
  margin: 0
}));

const StyledPurplePaper = styled(Paper)(({ theme }) => ({
  margin: '1em',
  padding: theme.spacing(2),
  color: 'white',
  background: '#7826eb',
  border: 0,
  borderRadius: 3,
  textAlign: 'center',
  margin: 0
}));

const StyledModalBox = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  background: '#000',
  padding: "1em",
  height: 110
})

const StyledModalBoxTwo = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  background: '#000',
  padding: "1em",
  // width: 500,
})

const StyledButton = styled(Button)({
  height: '70px',
  '& .MuiButton-label': {
      fontSize: '1.5rem', // Increase the font size
  }
});

const StyledPinkButton = styled(Button)({
  height: '70px',
  backgroundColor: '#ef7f91', // Set the background color to pink
  '&:hover': {
    backgroundColor: '#ef7f91', // Adjust the hover color if needed
  },
  '& .MuiButton-label': {
      fontSize: '1.5rem', // Increase the font size
  }
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
  const [depositAmount, setDepositAmount] = useState(100000000000000000);
  const [withdrawAmount, setWithdrawAmount] = useState(100000000000000000);
  const [privateNote, setPrivateNote] = useState("");
  const [leafIndex, setLeafIndex] = useState(0);


  const [depositState, setDepositState] = useState(false);

  useEffect(() => {
    // console.log('data : ', data);
    // let tempData = Number(data);
    // if (tempData % 1 !== 0) {
    //   tempData = Math.round(tempData);
    // } else {
    //   tempData = data
    // }
    // let temp = Number(BigInt(tempData)) / 100000000
    // setTokenOnePrice(parseFloat(temp))

  },[])

  // const {write} = useContractWrite({
  //   address: '0x61d2408168aC3ab91663EB945A53237109768165',
  //   abi: coverJson.abi,
  //   functionName: 'buyCover',
  //   args:[[
  //     "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", // eth address token 0
  //     "0x04b1560f4f58612a24cf13531f4706c817e8a5fe", // pool address token 1
  //     (Number(tokenTwoQty) % 1 !== 0 ? parseInt(tokenTwoQty) * Math.pow(10, 18) : tokenTwoQty * Math.pow(10, 18)),
  //     (Number(tokenOneQty) % 1 !== 0 ? parseInt(tokenOneQty) * Math.pow(10, 18) : tokenOneQty * Math.pow(10, 18)),
  //     (lowerBound * Math.pow(10, 18)),
  //     (upperBound * Math.pow(10, 18)),
  //     (validPeriod * 60 * 60 * 24),
  //     "USDC/WETH",
  //     (Number(data) % 1 !== 0 ? parseInt(data) * Math.pow(10, 18) : parseInt(data.toString())),
  //   ]],
  //   value: data ? parseEther(`${premium /(Number(BigInt(data)) / 100000000)}`): parseEther("0"),
  // });

  // const {write} = useContractWrite({
  //   address: '0x61d2408168aC3ab91663EB945A53237109768165',
  //   abi: coverJson.abi,
  //   functionName: 'buyCover',
  //   args:[[
  //     "" // commited hash
  //   ]],
  //   value: data ? parseEther(`${premium /(Number(BigInt(data)) / 100000000)}`): parseEther("0"),
  // });
  
  // console.log("cdata, isError, isLoading : ", data, isError, isLoading);

  // console.log("write : ", write);
  const { address, connector, isConnected } = useAccount()
  console.log("isConnected : ", isConnected);
  console.log("address : ", address);
  console.log("connector : ", connector);

  const downloadTxtFile = (jsonData) => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(jsonData, null, 2)], {type: 'text/plain'}); // Use null, 2 arguments to make the format pretty
    element.href = URL.createObjectURL(file);
    element.download = "myFile.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  const depositEther = async () => {
      setDepositState(true);

      console.log("BigNumber : ", BigNumber);

      const secret = BigNumber.from(ethers.randomBytes(32)).toString();
      const nullifier = BigNumber.from(ethers.randomBytes(32)).toString();
      const value = BigNumber.from(`${depositAmount}`).toHexString();

      console.log("secret : ", secret);
      console.log("nullifier : ", nullifier);
      console.log("value : ", value);
      
      const input = {
          secret: utils.BN256ToBin(secret).split(""),
          nullifier: utils.BN256ToBin(nullifier).split("")
      };

      let newPoseidon = await buildPoseidon();

      console.log("newPoseidon : ", newPoseidon);

      const hashCommitment = poseidonHash(newPoseidon, [nullifier, 0]);
      const hashNullifier = poseidonHash(newPoseidon, [nullifier, 1, leafIndex]);

      console.log("hashCommitment: ", hashCommitment);
      console.log("hashNullifier: ", hashNullifier);

      console.log("value : ", value);

      downloadTxtFile({
        hashCommitment,
        hashNullifier,
        secret,
        nullifier,
        value
      })

      // hashCommitment, value to smart contract


      // const tx = {
      //     to: onSenEtherAddress,
      //     from: address,
      //     value: value,
      //     data: onSenEtherInterface.encodeFunctionData("deposit", [commitment])
      // };

      try {
          // console.log("tx : ", tx);
          // const txHash = await window.ethereum.request({ method: "eth_sendTransaction", params: [tx] });

          // const proofElements = {
          //     nullifierHash: `${nullifierHash}`,
          //     secret: secret,
          //     nullifier: nullifier,
          //     commitment: `${commitment}`,
          //     txHash: txHash
          // };

          // console.log(proofElements);

          // updateProofElements(btoa(JSON.stringify(proofElements)));
      }catch(e){
          console.log(e);
      }

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
                  Onsens by the Garden is a Booster Pack for the Ethereum Community.
              </Typography>
              <br/><br/>
              </AccordionDetails>
            </CustomAccordion>
            <br/><br/>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center', // This will align the div horizontally center.
                alignItems: 'center', // This will align the div vertically center.
                height: '70vh' // This will take the full height of the screen.
              }}
            >
              <div style={{maxWidth: '500px', minWidth: '500px'}}> {/* This is the child div with max-width 500px */}
                <Grid 
                  container
                  spacing={3}
                >
                  <Grid item xs={6}>
                    <StyledPinkButton 
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={()=> {
                        setPageState("deposit")
                      }}
                    >Deposit</StyledPinkButton>
                  </Grid>
                  <Grid item xs={6}>
                    <StyledButton
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={()=> {
                      setPageState("withdraw")
                    }}
                    >Withdraw</StyledButton>
                  </Grid>
                  {pageState === "deposit" && <Grid item xs={12}>
                    <StyledPinkPaper>
                      <FormControl fullWidth>
                        <InputLabel sx={{color: 'white'}} id="select-from-network-label">Network From</InputLabel>
                        <StyledSelect
                          fullWidth
                          labelId="select-from-network-label"
                          id="select-from-network"
                          value={networkFrom}
                          label="Network From"
                          onChange={(e)=>{
                            setNetWorkFrom(e.target.value)
                          }}
                        >
                          <MenuItem value={"ethereum"}>Ethereum Network</MenuItem>
                          <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                          <MenuItem value={"linea"}>Linea Network</MenuItem>
                        </StyledSelect>
                      </FormControl>
                      <br/><br/>
                      <FormControl fullWidth>
                        <InputLabel sx={{color: 'white'}} id="select-to-network-label">Network To</InputLabel>
                        <StyledSelect
                          fullWidth
                          labelId="select-to-network-label"
                          id="select-to-network"
                          value={networkTo}
                          label="Network To"
                          onChange={(e)=>{
                            console.log(e.target.value);
                            setNetWorkTo(e.target.value)
                          }}
                        >
                          <MenuItem value={"ethereum"}>Ethereum Network</MenuItem>
                          <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                          <MenuItem value={"linea"}>Linea Network</MenuItem>
                        </StyledSelect>
                      </FormControl>
                      <br/><br/>
                      <FormControl fullWidth>
                        <InputLabel sx={{color: 'white'}} id="select-amount-label">Amount</InputLabel>
                        <StyledSelect
                          fullWidth
                          labelId="select-amount-label"
                          id="select-amount"
                          value={depositAmount}
                          label="Amount"
                          onChange={(e)=>{
                            setDepositAmount(e.target.value)
                          }}
                        >
                          <MenuItem value={100000000000000000}>0.1 Ether</MenuItem>
                          <MenuItem value={1000000000000000000}>1 Ether</MenuItem>
                          <MenuItem value={10000000000000000000}>10 Ether</MenuItem>
                          <MenuItem value={32000000000000000000}>32 Ether</MenuItem>
                        </StyledSelect>
                      </FormControl>
                      <br/><br/>
                      <StyledButton 
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={()=> {
                        depositEther()
                      }}
                    >Deposit Now!</StyledButton>
                    </StyledPinkPaper>
                  </Grid>}
                  {pageState === "withdraw" && <Grid item xs={12}>
                    <StyledPurplePaper>
                      <FormControl fullWidth>
                        <InputLabel sx={{color: 'white'}} id="select-from-network-label">Network From</InputLabel>
                        <StyledSelect
                          fullWidth
                          labelId="select-from-network-label"
                          id="select-from-network"
                          value={networkFrom}
                          label="Network From"
                          onChange={(e)=>{
                            setNetWorkFrom(e.target.value)
                          }}
                        >
                          <MenuItem value={"ethereum"}>Ethereum Network</MenuItem>
                          <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                          <MenuItem value={"linea"}>Linea Network</MenuItem>
                        </StyledSelect>
                      </FormControl>
                      <br/><br/>
                      <FormControl fullWidth>
                        <InputLabel sx={{color: 'white'}} id="select-to-network-label">Network To</InputLabel>
                        <StyledSelect
                          fullWidth
                          labelId="select-to-network-label"
                          id="select-to-network"
                          value={networkTo}
                          label="Network To"
                          onChange={(e)=>{
                            setNetWorkTo(e.target.value)
                          }}
                        >
                          <MenuItem value={"ethereum"}>Ethereum Network</MenuItem>
                          <MenuItem value={"mantle"}>Mantle Network</MenuItem>
                          <MenuItem value={"linea"}>Linea Network</MenuItem>
                        </StyledSelect>
                      </FormControl>
                      <br/><br/>
                      <FormControl fullWidth>
                        <InputLabel sx={{color: 'white'}} id="select-amount-label">Amount</InputLabel>
                        <StyledSelect
                          fullWidth
                          labelId="select-amount-label"
                          id="select-amount"
                          value={depositAmount}
                          label="Amount"
                          onChange={(e)=>{
                            setWithdrawAmount(e.target.value)
                          }}
                        >
                          <MenuItem value={100000000000000000}>0.1 Ether</MenuItem>
                          <MenuItem value={1000000000000000000}>1 Ether</MenuItem>
                          <MenuItem value={10000000000000000000}>10 Ether</MenuItem>
                          <MenuItem value={32000000000000000000}>32 Ether</MenuItem>
                        </StyledSelect>
                      </FormControl>
                      <br/><br/>
                      <StyledTextField
                        fullWidth
                        value={privateNote} 
                        id="private-note" 
                        label="Private Note" 
                        variant="outlined"
                        onChange={(e) => {
                          setPrivateNote(e.target.value)
                        }}
                      />
                      <br/><br/>
                      <StyledPinkButton 
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={()=> {
                        props.changeAppPage('funding')
                      }}
                    >Withdraw Now!</StyledPinkButton>
                    </StyledPurplePaper>
                  </Grid>}
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