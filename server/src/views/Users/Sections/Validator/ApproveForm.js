import React, { useState } from "react";
import { makeStyles, withTheme } from "@material-ui/core/styles";
import CustomInput from "components/CustomInput/CustomInput.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import Danger from "components/Typography/Danger.js";
import Success from "components/Typography/Success.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import Check from "@material-ui/icons/Check";
import Warning from "@material-ui/icons/Warning";

import { approveAge, approveDegree, approveLicense } from "utils/functions";
import { globalAction } from "redux/actions/global_state";
import { connect } from "react-redux";
import { TYPE } from "utils/enum";

const useStyles = makeStyles((theme) => ({
  container: {
    width: 400,
    margin: "0 auto",
  },
  row: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    width: "100%",
    fontSize: "14px",
  },
  submitButton: {
    marginTop: "36px",
    width: "100%",
    float: "right",
  },
  title: {
    marginBottom: theme.spacing(6),
  },
  notification: {
    marginTop: theme.spacing(4),
  },
}));

function Form(props) {
  const classes = useStyles();
  const { setStep, step, exist, client, type, value } = props;
  const [approval, setApproval] = useState(value.approval || "");

  function handleBack() {
    setStep(step - 2);
  }
  function handleSubmit() {
    if (approval.trim() && client.trim()) {
      setStep(step + 1);
      try {
        switch (+type) {
          case TYPE.AGE:
            approveAge(client, approval, (error) => {
              if (error) {
                props.dispatch(
                  globalAction.NOTIFICATION({
                    notification: true,
                    notificationText: error.message,
                    notificationType: false,
                  })
                );
                setStep(step);
              } else {
                setStep(step + 2);
              }
            });
            break;
          case TYPE.DEGREE:
            approveDegree(client, approval, exist.index, (error) => {
              if (error) {
                console.log("approveDegree", client, approval, exist.index);
                props.dispatch(
                  globalAction.NOTIFICATION({
                    notification: true,
                    notificationText: error.message,
                    notificationType: false,
                  })
                );
                setStep(step);
              } else {
                setStep(step + 2);
              }
            });
            break;
          case TYPE.LICENSE:
            approveLicense(client, approval, exist.index, (error) => {
              if (error) {
                props.dispatch(
                  globalAction.NOTIFICATION({
                    notification: true,
                    notificationText: error.message,
                    notificationType: false,
                  })
                );
                setStep(step);
              } else {
                setStep(step + 2);
              }
            });
            break;

          default:
            break;
        }
      } catch (error) {
        setStep(step);
        console.log("ApproveForm", error);
        props.dispatch(
          globalAction.NOTIFICATION({
            notification: true,
            notificationText:
              "Something Wrong with the contract, please try again.",
            notificationType: false,
          })
        );
      }
    }
  }
  function handleChange(e) {
    setApproval(e.target.value);
  }
  return (
    <div>
      {exist.exist ? (
        <GridContainer direction="column" alignItems="center">
          <GridItem className={classes.notification}>
            <SnackbarContent
              message={
                <span>
                  <b>SUCCESS:</b> Information Has Been Proved by the Smart
                  Contract.
                </span>
              }
              close
              color="success"
              icon={Check}
            />
          </GridItem>
          <h3 className={classes.title}>Input Encrypted Approve</h3>
          <GridItem xs={12} sm={12} md={12} lg={6}>
            <GridItem xs={12} sm={12} md={12} lg={12} className={classes.row}>
              <CustomInput
                labelText="Encrypted Approval"
                id="float"
                formControlProps={{
                  fullWidth: true,
                }}
                inputProps={{
                  name: "approval",
                  value: approval,
                  onChange: handleChange,
                }}
              />
            </GridItem>
          </GridItem>
        </GridContainer>
      ) : (
        <GridContainer direction="column" alignItems="center">
          <GridItem className={classes.notification}>
            <SnackbarContent
              message={
                <span>
                  <b>ERROR:</b> Information Cann't be Proved. Please Try Again.
                </span>
              }
              close
              color="danger"
              icon={Warning}
            />
          </GridItem>
          <h3 className={classes.title}>
            Ooops! Information Cann't be Proved.
          </h3>
        </GridContainer>
      )}

      <GridContainer justify="space-around">
        <GridItem xs={12} sm={12} md={2} lg={2}>
          <Button className={classes.submitButton} onClick={handleBack}>
            Back
          </Button>
        </GridItem>
        {exist.exist ? (
          <GridItem xs={12} sm={12} md={2} lg={2}>
            <Button
              color="primary"
              className={classes.submitButton}
              onClick={handleSubmit}
            >
              Next
            </Button>
          </GridItem>
        ) : (
          ""
        )}
      </GridContainer>
    </div>
  );
}

export default connect()(withTheme(Form));
