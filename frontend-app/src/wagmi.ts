import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig } from "wagmi";
import {
  arbitrum,
  polygon,
  goerli,
  mantleTestnet,
  scrollSepolia,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const walletConnectProjectId = "31b7a6907dcc1be39c4d4ca7e4ed20b1";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrum, polygon, goerli, mantleTestnet, scrollSepolia],
  [publicProvider()]
);

const { chains: rainbowChains } = configureChains(
  [arbitrum, polygon, goerli, mantleTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Kaviar",
  chains,
  projectId: walletConnectProjectId,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains, rainbowChains };
