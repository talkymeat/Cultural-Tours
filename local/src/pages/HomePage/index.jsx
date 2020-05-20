/**
 * Author: JIN XIAO
 * Email: xiaojin971212@gmail.com
 */
import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import CssBaseLine from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import HttpsIcon from "@material-ui/icons/Https";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";

import OrbBackground from "../../components/OrbBackground";
import Logo from "../../assets/logo_placeholder.png";
import theme from "../../theme";

const styles = {
  root: {
    color: "#fff",
    position: "relative",
  },
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  validatorButton: {
    marginLeft: "20px",
    color: "#fff",
  },
  svcUserButton: {
    color: "mediumseagreen",
  },
  OrbBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
  },
  // '@global': {
  //     body: {
  //         background: '#000'
  //     }
  // },
  buttonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    "& a": {
      textDecoration: "none",
    },
  },
  logoContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
  logo: {
    height: "150px",
  },
  card: {
    backgroundColor: "#fff",
    color: theme.palette.primary.main,
    width: "200px",
    "&:nth-child(2)": {
      marginLeft: theme.spacing(4),
      color: theme.palette.secondary.main,
    },
    "&:nth-child(3)": {
      marginLeft: theme.spacing(4),
      color: "mediumseagreen",
    },
  },
};

const svcStyle = {
  backgroundColor: "mediumseagreen",
  color: "white",
};

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (this.props.location.state) {
      this.state.log = this.props.location.state.log || [];
    } else {
      this.state.log = [];
    }
  }

  componentDidMount() {
    // console.log(this.props)
  }
  render() {
    const { classes } = this.props;
    var { log } = this.state;
    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <div className={classes.logoContainer}>
              <img className={classes.logo} src={Logo} alt="Logo" />
            </div>
            <div className={classes.buttonContainer}>
              <Card className={classes.card} variant="outlined">
                <CardContent>
                  <Typography className={classes.title} gutterBottom>
                    For Encryption:
                  </Typography>
                  <Typography variant="h5">
                    CLIENT
                    <br />
                    <br />
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link
                    to={{ pathname: "/client", state: { log: log } }}
                    id="clientpage"
                  >
                    <Button
                      startIcon={<HttpsIcon />}
                      size="medium"
                      variant="contained"
                      color="primary"
                    >
                      START HERE
                    </Button>
                  </Link>
                </CardActions>
              </Card>
              &nbsp;
              <Card className={classes.card} variant="outlined">
                <CardContent>
                  <Typography className={classes.title} gutterBottom>
                    For Validation:
                  </Typography>
                  <Typography variant="h5">
                    VALIDATOR
                    <br />
                    <br />
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link
                    to={{ pathname: "/validator", state: { log: log } }}
                    id="validatorpage"
                  >
                    <Button
                      startIcon={<VerifiedUserIcon />}
                      size="medium"
                      variant="contained"
                      color="secondary"
                    >
                      START HERE
                    </Button>
                  </Link>
                </CardActions>
              </Card>
              &nbsp;
              <Card
                className={classes.card}
                variant="outlined"
                style={{ marginLeft: theme.spacing(4) }}
              >
                <CardContent>
                  <Typography className={classes.title} gutterBottom>
                    For Confirmation:
                  </Typography>
                  <Typography variant="h5">
                    SERVICE USER
                    <br />
                    <br />
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link
                    to={{ pathname: "/svcuser", state: { log: log } }}
                    id="svcuserpage"
                  >
                    <Button
                      startIcon={<VerifiedUserIcon />}
                      size="medium"
                      variant="contained"
                      style={svcStyle}
                    >
                      START HERE
                    </Button>
                  </Link>
                </CardActions>
              </Card>
            </div>
          </Box>
        </Container>
        <div className={classes.OrbBackground}>
          <OrbBackground />
        </div>
      </React.Fragment>
    );
  }
}

export default withTheme(withStyles(styles)(HomePage));
