"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import * as React from "react";
import { WagmiConfig } from "wagmi";
import { wagmiConfig, rainbowChains } from "../wagmi";

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={rainbowChains}>
                {mounted && children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}