import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";

import styles from "views/Users/Styles/validatorProfile";
import Nav from "./Sections/Validator";

import { check_validators } from "utils/functions";
import Loading from "components/Loading";
import { globalAction } from "redux/actions/global_state";
import { connect } from "react-redux";
import Button from "components/CustomButtons/Button.js";

const useStyles = makeStyles((theme) => ({
  noAccess: {
    background: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    padding: theme.spacing(2),
    fontSize: theme.typography.h5,
    margin: theme.spacing(4),
    "& a": {
      color: theme.palette.error.contrastText,
      textDecoration: "underline",
    },
  },
  button: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(4),
  },
  ...styles,
}));

function ProfilePage(props) {
  const classes = useStyles();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      check_validators((error) => {
        if (error) {
          // props.dispatch(globalAction.NOTIFICATION({
          //   notification: true,
          //   notificationText: "Only valid validator can login! Please register first!",
          //   notificationType: false,
          // }))
          // props.history.push("/");
          setLoading(false);
          setAuth(false);
        } else {
          setAuth(true);
          setLoading(false);
        }
      });
    }, 0);
  }, []);
  return (
    <div>
      {loading ? (
        <Loading showButton={false} text="Checking Your Role, Please Wait." />
      ) : auth ? (
        <Nav {...props} />
      ) : (
        <GridContainer>
          <GridItem className={classes.noAccess}>
            ERROR ALERT: You don't have access to this page, please login as a
            validator user with memamask. <a>Read more about metamask</a>
          </GridItem>
          <GridItem className={classes.button}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                window.location.reload();
              }}
            >
              I'm a validator now, continue
            </Button>
          </GridItem>
        </GridContainer>
      )}
    </div>
  );
}

export default connect()(withRouter(ProfilePage));
