import React from "react";
import logo from "assets/img/animation.gif";
import { makeStyles, withTheme } from "@material-ui/core/styles";
import Button from "components/CustomButtons/Button.js";

const useStyles = makeStyles((theme) => ({
  ErrorContainer: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: "64px",
  },
  pannel: {
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.error.main,
    boxShadow: theme.shadows[1],
    color: theme.palette.error.contrastText,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    "& a": {
      color: "#fff",
      textDecoration: "underline",
    },
  },
  button: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(1),
  },
}));

function ErrorPage() {
  const classes = useStyles();

  return (
    <div className={classes.ErrorContainer}>
      <div className={classes.wrap}>
        <h4>PIMS &nbsp; | &nbsp;Blockchain Lab</h4>
        <div className={classes.pannel}>
          <img src={logo} alt="" className={classes.logo} />
          <h4>
            Sorry, Please open PIMS with Chrome, and install Metamask extension.
            :)
          </h4>
          <a href="">About PIMS</a>
        </div>
        <div className={classes.button}>
          <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn">
            <Button color="primary" variant="outlined">
              Install Metamask for Chrome
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default withTheme(ErrorPage);
