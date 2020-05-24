import React, { useState, useEffect } from "react";
import { makeStyles, withTheme } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import styles from "views/Users/Styles/adminProfile";
import Tabs from "./Sections/Navigations";
import { check_organization } from "utils/functions";
import Loading from "components/Loading";
import { globalAction } from "redux/actions/global_state";
import { connect } from "react-redux";
import Button from "components/CustomButtons/Button.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";

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

function AdminProfile(props) {
  const classes = useStyles();
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      check_organization((error) => {
        if (error) {
          // props.dispatch(globalAction.NOTIFICATION({
          //   notification: true,
          //   notificationText: "Only valid owner can login! Please register first!",
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
    <div className={classes.container}>
      {loading ? (
        <Loading showButton={false} text="Checking Your Role, Please Wait." />
      ) : auth ? (
        <Tabs {...props} />
      ) : (
        <GridContainer>
          <GridItem className={classes.noAccess}>
            ERROR ALERT: You don't have access to this page, please login as a
            admin/owner with memamask. <a>Read more about metamask</a>
          </GridItem>
          <GridItem className={classes.button}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                window.location.reload();
              }}
            >
              I'm the admin/owner now, continue
            </Button>
          </GridItem>
        </GridContainer>
      )}
    </div>
  );
}

export default connect()(withRouter(AdminProfile));
