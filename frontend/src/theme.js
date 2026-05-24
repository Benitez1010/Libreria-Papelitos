import { createTheme } from "@mui/material/styles";

const COLOR_VERDE_MARCA = "#0f4d2e";
const COLOR_VERDE_FONDO = "#9bc3a8";
const COLOR_CREMA = "#eaf1ec";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: COLOR_VERDE_MARCA,
      dark: "#0b3a23",
      light: "#2f6f4d",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#4ade80",
    },
    background: {
      default: COLOR_CREMA,
      paper: "#ffffff",
    },
    error: {
      main: "#b91c1c",
    },
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800 },
    h4: { fontWeight: 800, letterSpacing: 1 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
        fullWidth: true,
      },
    },
  },
});

export const COLORES_MARCA = {
  verdeMarca: COLOR_VERDE_MARCA,
  verdeFondo: COLOR_VERDE_FONDO,
  crema: COLOR_CREMA,
};

export default theme;
