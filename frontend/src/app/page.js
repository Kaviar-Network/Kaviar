"use client"
import React, { useEffect } from 'react';
import Image from 'next/image'
import styles from './page.module.css'
import ResponsiveAppBar from './AppBar/page'
import Homepage from './Homepage/page'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Slide } from '@mui/material';
// Import the functions you need from the SDKs you need
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, polygon, goerli } from 'wagmi/chains'

const chains = [arbitrum, polygon, goerli]
const projectId = '31b7a6907dcc1be39c4d4ca7e4ed20b1'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

const theme = createTheme({
  palette: {
    primary: {
      main: '#843de7',  // Change this to the grey color you want
    }, //8CD987
  },
});

export default function Home() {
  
  let app;
  let analytics;

  const [appPage, setAppPage] = React.useState("home");

  const changeAppPage = (page) => {
    setAppPage(page)
  }

  return (
    <ThemeProvider theme={theme}>
    <main className={styles.main}>
    <WagmiConfig config={wagmiConfig}>
      <ResponsiveAppBar changeAppPage={changeAppPage}/>
      <div className={styles.content}>
        {appPage === "home" && <Homepage changeAppPage={changeAppPage}/>}
      </div>
    </WagmiConfig>
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </main>
    </ThemeProvider>
  )
}
