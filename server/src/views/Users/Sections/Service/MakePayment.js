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
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { FormControl } from "@material-ui/core";

import {
  payForAgeConfirmation,
  payForDegreeConfirmation,
  payForLicenseConfirmation,
} from "utils/functions";
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
  const { setStep, step, result, client, type } = props;
  const [price, setPrice] = useState(result.price || "");

  function handleBack() {
    setStep(step - 2);
  }

  function handleSubmit() {
    if (price && client.trim()) {
      setStep(step + 1);
      try {
        switch (+type) {
          case TYPE.AGE:
            payForAgeConfirmation(price, client, (error) => {
              if (error) {
                props.dispatch(
                  globalAction.NOTIFICATION({
                    notification: true,
                    notificationText: "Error",
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
            payForDegreeConfirmation(price, client, result.index, (error) => {
              if (error) {
                props.dispatch(
                  globalAction.NOTIFICATION({
                    notification: true,
                    notificationText: "Error",
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
            payForLicenseConfirmation(price, client, result.index, (error) => {
              if (error) {
                props.dispatch(
                  globalAction.NOTIFICATION({
                    notification: true,
                    notificationText: "Error",
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
    setPrice(e.target.value);
  }
  return (
    <div>
      <GridContainer direction="column" alignItems="center">
        <GridItem className={classes.notification}>
          <SnackbarContent
            message={
              <span>
                <b>INFO:</b>{" "}
                {result.confirmed
                  ? "Approval CONFIRMED"
                  : "Approval NOT CONFIRMED"}
              </span>
            }
            close
            color="info"
            icon={Check}
          />
        </GridItem>
        <h3 className={classes.title}>Make Payment</h3>
        <GridItem xs={12} sm={12} md={12} lg={6}>
          <GridItem xs={12} sm={12} md={12} lg={12} className={classes.row}>
            <CustomInput
              labelText="Amount (Wei)"
              id="float"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                name: "price",
                value: price,
                onChange: handleChange,
                disabled: true,
                style: {
                  opacity: 0.5,
                },
              }}
            />
          </GridItem>
        </GridItem>
      </GridContainer>

      <GridContainer justify="space-around">
        <GridItem xs={12} sm={12} md={2} lg={2}>
          <Button className={classes.submitButton} onClick={handleBack}>
            Back
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={2} lg={2}>
          <Button
            color="primary"
            className={classes.submitButton}
            onClick={handleSubmit}
          >
            Next
          </Button>
        </GridItem>
      </GridContainer>
    </div>
  );
}

export default connect()(withTheme(Form));
