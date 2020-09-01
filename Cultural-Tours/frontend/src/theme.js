import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#7fbabe',
      main: '#4f8a8b',
      dark: '#1e5d61',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffc1a9',
      main: '#ea907a',
      dark: '#b5614e',
      contrastText: '#000',
    },
  },
});

export default theme;
