/**
 * Author: JIN XIAO & DAVE COCHRAN
 * Email: xiaojin971212@gmail.com
 * Email: dcochra2@inf.ed.ac.uk
 */
import "date-fns";
import React from "react";
import Input from "@material-ui/core/Input";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import Chip from "@material-ui/core/Chip";
import Upload from "../../components/Upload";

export default function LicenseNode(props) {
  const {
    theme,
    classes,
    license,
    licenseDescription,
    licenseExpireDate,
    handleChange,
    handleFileUpload,
    handleDateChange,
    canEdit,
    proofOfLicenseOriginalValue,
    licenseRandomValue,
    licenseDescriptionRandomValue,
    licenseExpireDateRandomValue,
    proofOfLicenseRandomValue,
    validatorAddress,
    signatureRandomValue,
    approval,
    clientAddress,
  } = props;
  // DC@20-04-23: Typo - "Pleace" >> "Please"
  return (
    <React.Fragment>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-license">License</InputLabel>
        <Input
          value={license}
          onChange={handleChange}
          inputProps={{
            name: "license",
            id: "validator-license",
            placeholder: "Please Input License",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-proof-of-license">
          Random Value of License
        </InputLabel>
        <Input
          value={licenseRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "licenseRandomValue",
            id: "validator-license-random",
            placeholder: "Please   Input Random Value of License",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            margin="none"
            id="license-expire-date"
            label="License Expire Date"
            format="MM/dd/yyyy"
            value={licenseExpireDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
            disabled={canEdit}
          />
        </MuiPickersUtilsProvider>
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-proof-of-license">
          Random Value of License Expire Date
        </InputLabel>
        <Input
          value={licenseExpireDateRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "licenseExpireDateRandomValue",
            id: "validator-license-expire-date-random",
            placeholder: "Please Input Random Value of License Expire Date",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <TextField
          label="License Description"
          value={licenseDescription}
          onChange={handleChange}
          name="licenseDescription"
          placeholder="Please Input License Description"
          multiline
          //   variant="outlined"
          rows="6"
          rowsMax="6"
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-proof-of-license">
          Random Value of License Description
        </InputLabel>
        <Input
          value={licenseDescriptionRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "licenseDescriptionRandomValue",
            id: "validator-license-description-random",
            placeholder: "Please Input Random Value of License Description",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <Typography
          variant="caption"
          style={{
            marginBottom: theme.spacing(1),
          }}
        >
          Upload Proof of License:
        </Typography>
        {canEdit ? (
          <Chip
            label={
              proofOfLicenseOriginalValue.length &&
              proofOfLicenseOriginalValue[0].name
            }
            className={classes.chip}
            variant="outlined"
            color="default"
          />
        ) : (
          <Upload
            handleFileUpload={(files) => {
              handleFileUpload(
                "proofOfLicense",
                files.map((file) => file.file)
              );
            }}
            files={proofOfLicenseOriginalValue}
          />
        )}
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-proof-of-license">
          Proof of License's Random Value
        </InputLabel>
        <Input
          value={proofOfLicenseRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "proofOfLicenseRandomValue",
            id: "validator-proof-of-license-random",
            placeholder: "Please Input Proof of License's Random Value",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="svc-user-age">Validator Address</InputLabel>
        <Input
          value={validatorAddress}
          onChange={handleChange}
          inputProps={{
            name: "validatorAddress",
            id: "svc-user-validator-address",
            placeholder: "Please Input Validator Address",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="svc-user-age">Client Address</InputLabel>
        <Input
          value={clientAddress}
          onChange={handleChange}
          inputProps={{
            name: "clientAddress",
            id: "svc-user-client-address",
            placeholder: "Please Input Client Address",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="svc-user-age">
          Validator's signed approval
        </InputLabel>
        <Input
          value={approval}
          onChange={handleChange}
          inputProps={{
            name: "approval",
            id: "svc-user-validator-approval",
            placeholder: "Please Input Validator's Signed Approval",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="svc-user-age">
          Validator Signature Random Value
        </InputLabel>
        <Input
          value={signatureRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "signatureRandomValue",
            id: "svc-user-validator-random-value",
            placeholder: "Please Input Validator's Signed Approval",
          }}
          disabled={canEdit}
        />
      </FormControl>
    </React.Fragment>
  );
}
