import { createTheme, ThemeProvider } from '@mui/material/styles';
import './globals.css' // Import global styles here if you have any

const theme = createTheme({
  palette: {
    primary: {
      main: '#202129',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
