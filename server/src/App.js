import React, { useEffect } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import { createBrowserHistory } from "history";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
// pages for this product
import Components from "views/Components/Components.js";
import LandingPage from "views/LandingPage/LandingPage.js";
import ProfilePage from "views/ProfilePage/ProfilePage.js";
import LoginPage from "views/LoginPage/LoginPage.js";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { globalAction } from "redux/actions/global_state";
import {
  get_client_list,
  get_validator_list,
  get_admin_list,
} from "utils/functions";
import * as USERACTION from "redux/actions/user_list";
import { DOMAIN, CONTRACT_ADDRESS } from "config";
import UserPage from "views/Users";
import Web3 from "web3";
import { abi } from "utils/abi";
import theme from "./theme";
import ErrorPage from "components/Error";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

var hist = createBrowserHistory();
let isMetamask = true;
try {
  var web3 = window.web3;
  if (typeof web3 !== "undefined") {
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log(DOMAIN); // was http://localhost:8545
    web3 = new Web3(new Web3.providers.HttpProvider(DOMAIN));
  }

  // Check if Metamask has been Enjected
  if (window.web3.currentProvider.isMetaMask) {
    console.log("eth", window.web3.currentProvider.isMetaMask);
    console.log("MetaMask has been injected", window.ethereum.enable());
  } else {
    console.log("MetaMask has not been injected");
  }
  var ins = web3.eth.contract(abi);

  window.myContract = ins.at(CONTRACT_ADDRESS); // keyaddress
  console.log("CONTRACT_ADDRESS ->", CONTRACT_ADDRESS);

  setInterval(function() {
    if (web3.eth.accounts[0]) {
      if (web3.eth.accounts[0] !== window.account) {
        window.account = web3.eth.accounts[0];
        web3.eth.defaultAccount = web3.eth.accounts[0];
      }
    }
  }, 100);
} catch (error) {
  isMetamask = false;
  console.log("error", error);
}
function App(props) {
  const { dispatch } = props;
  useEffect(() => {
    console.log("now", +new Date());
    setTimeout(() => {
      get_client_list((error, res) => {
        if (error) {
          dispatch(
            globalAction.NOTIFICATION({
              notification: true,
              notificationText: error.message,
              notificationType: false,
            })
          );
        } else {
          dispatch(USERACTION.SET_CLIENT(res));
        }
      });
      get_validator_list((error, res) => {
        if (error) {
          dispatch(
            globalAction.NOTIFICATION({
              notification: true,
              notificationText: error.message,
              notificationType: false,
            })
          );
        } else {
          dispatch(USERACTION.SET_VALIDATOR(res));
        }
      });
      get_admin_list((error, res) => {
        if (error) {
          dispatch(
            globalAction.NOTIFICATION({
              notification: true,
              notificationText: error.message,
              notificationType: false,
            })
          );
        } else {
          dispatch(USERACTION.SET_ADMIN(res));
        }
      });
    }, 101);
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Router history={hist}>
        <Switch>
          <Route path="/user/:role" component={UserPage} />
          {/* <Route path="/service" component={ServicePage} /> */}
          <Route path="/com" component={Components} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/login-page" component={LoginPage} />
          <Route path="/" component={LandingPage} />
        </Switch>
      </Router>
      {/* <Backdrop open={props.backdrop} style={{ zIndex: 999999 }}>
        <CircularProgress color="inherit" />
      </Backdrop> */}
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={props.notification}
        autoHideDuration={6000}
        onClose={() => {
          props.dispatch(globalAction.NOTIFICATION_CLOSE);
        }}
      >
        <Alert severity={props.notificationType ? "success" : "error"}>
          {props.notificationText}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
const mapStateToProps = (state) => ({
  backdrop: state.global.backdropOpen,
  notification: state.global.notification,
  notificationText: state.global.notificationText,
  notificationType: state.global.notificationType,
});

const Home = isMetamask ? connect(mapStateToProps)(App) : ErrorPage;

export default Home;
