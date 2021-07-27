import { createMuiTheme } from '@material-ui/core/styles';
// Defines the primary and secondary colours for the site's visual identity

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#7fbabe',
      main: '#C2583E',
      dark: '#1e5d61',
      contrastText: '#F3EFD9',
    },
    secondary: {
      light: '#ffc1a9',
      main: '#107269',
      dark: '#b5614e',
      contrastText: '#F3EFD9',
    },
  },
});

export default theme;
