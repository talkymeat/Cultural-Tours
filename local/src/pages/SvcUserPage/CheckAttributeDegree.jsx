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
import TextField from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import Upload from "../../components/Upload";

export default function DegreeNode(props) {
  const {
    theme,
    classes,
    degree,
    degreeDescription,
    handleChange,
    handleFileUpload,
    proofOfDegreeOriginalValue,
    degreeRandomValue,
    degreeDescriptionRandomValue,
    proofOfDegreeRandomValue,
    canEdit,
    validatorAddress,
    signatureRandomValue,
    approval,
    clientAddress,
  } = props;
  // DC@20-04-23: Typo - "Pleace" >> "Please"
  return (
    <React.Fragment>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-degree">Degree</InputLabel>
        <Input
          value={degree}
          onChange={handleChange}
          inputProps={{
            name: "degree",
            id: "validator-degree",
            placeholder: "Please Input Degree",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-degree">
          Random Value of Degree
        </InputLabel>
        <Input
          value={degreeRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "degreeRandomValue",
            id: "validator-degree-random",
            placeholder: "Please Input Random Value of Degree",
          }}
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        {/* <InputLabel htmlFor="validator-degree">Degree Description</InputLabel> */}
        <TextField
          label="Degree Description"
          value={degreeDescription}
          onChange={handleChange}
          name="degreeDescription"
          placeholder="Please Input Degree Description"
          multiline
          rows="6"
          rowsMax="6"
          disabled={canEdit}
        />
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-degree">
          Random Value of Degree Description
        </InputLabel>
        <Input
          value={degreeDescriptionRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "degreeDescriptionRandomValue",
            id: "validator-degree-description-random",
            placeholder: "Please Input Random Value of Degree Description",
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
          Upload Proof of Degree:
        </Typography>
        {canEdit ? (
          <Chip
            label={
              proofOfDegreeOriginalValue.length &&
              proofOfDegreeOriginalValue[0].name
            }
            className={classes.chip}
            variant="outlined"
            color="default"
          />
        ) : (
          <Upload
            handleFileUpload={(files) => {
              handleFileUpload(
                "proofOfDegree",
                files.map((file) => file.file)
              );
            }}
            files={proofOfDegreeOriginalValue}
          />
        )}
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="validator-proof-of-degree">
          Proof of Degree's Random Value
        </InputLabel>
        <Input
          value={proofOfDegreeRandomValue}
          onChange={handleChange}
          inputProps={{
            name: "proofOfDegreeRandomValue",
            id: "validator-proof-of-degree-random",
            placeholder: "Please Input Proof of Degree's Random Value",
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
