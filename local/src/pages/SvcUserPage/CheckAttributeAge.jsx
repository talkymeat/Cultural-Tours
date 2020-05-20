/**
 * Author: JIN XIAO & DAVE COCHRAN
 * Email: xiaojin971212@gmail.com
 * Email: dcochra2@inf.ed.ac.uk
 */
import React from "react";
import Input from "@material-ui/core/Input";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import Upload from "../../components/Upload";

export default function AgeNode(props) {
  const {
    theme,
    classes,
    age,
    handleChange,
    handleFileUpload,
    proofOfAgeOriginalValue,
    ageRandomValue,
    proofOfAgeRandomValue,
    canEdit,
    validatorAddress,
    clientAddress,
    signatureRandomValue,
    approval,
  } = props;
  // DC@20-04-23: Typo - "Pleace" >> "Please"
  return (
    <React.Fragment>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="svc-user-age">Age</InputLabel>
        <Input
          value={age}
          onChange={handleChange}
          inputProps={{
            name: "age",
            id: "svc-user-age",
            placeholder: "Please Input Age, Range from 18 to 100",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="svc-user-age">Random Value of Age</InputLabel>
        <Input
          value={ageRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "ageRandomValue",
            id: "svc-user-age-random",
            placeholder: "Please Input Random Value of Age",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <Typography
          variant="caption"
          style={{
            marginBottom: theme.spacing(1),
            marginTop: theme.spacing(2),
          }}
        >
          Upload Proof of Age
        </Typography>

        {canEdit ? (
          <Chip
            label={
              proofOfAgeOriginalValue.length && proofOfAgeOriginalValue[0].name
            }
            className={classes.chip}
            variant="outlined"
            color="default"
          />
        ) : (
          <Upload
            handleFileUpload={(files) => {
              handleFileUpload(
                "proofOfAge",
                files.map((file) => file.file)
              );
            }}
            files={proofOfAgeOriginalValue}
          />
        )}
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="svc-user-age">
          Proof of Age's Random Value
        </InputLabel>
        <Input
          value={proofOfAgeRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "proofOfAgeRandomValue",
            id: "validator-proof-of-age-random",
            placeholder: "Please Input Random Value of Proof of Age",
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
