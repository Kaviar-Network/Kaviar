"use client";

import {
    AppBar,
    Box,
    Container,
    Toolbar,
    Typography
} from '@mui/material';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useBalance, useAccount } from 'wagmi';

export const NavbarMain = () => {
    const { address } = useAccount();
    useBalance({ address, watch: true }); //watch for balance changes and refetch ConnectButton

    return (
        <AppBar position="static" style={{
            background: "linear-gradient(135deg, #ef7f91 00%, #843de7 70%, #8CD987 100%)",
        }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                                variant="h5"
                                noWrap
                                component="a"
                                href="/"
                                sx={{
                                    mr: 2,
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.3rem',
                                    color: 'white',
                                    textDecoration: 'none',
                                }}>
                                Kaviar
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ConnectButton />
                        </Box>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}