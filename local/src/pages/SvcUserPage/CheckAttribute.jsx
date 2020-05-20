/**
 * Author: JIN XIAO & DAVE COCHRAN
 * Email: xiaojin971212@gmail.com
 * Email: dcochra2@inf.ed.ac.uk
 */
import React, { Component } from "react";
import { styled, makeStyles, withTheme } from "@material-ui/core/styles";
import CssBaseLine from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Divider from "@material-ui/core/Divider";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { LooksOne, LooksTwo, Attachment } from "@material-ui/icons";
import * as Utilities from "../../utilities";
import Notification from "../../components/Notification";
import moment from "moment";
import Zip from "jszip";
import Upload from "../../components/Upload";
import Chip from "@material-ui/core/Chip";

import AgeNode from "./CheckAttributeAge";
import DegreeNode from "./CheckAttributeDegree";
import LicenseNode from "./CheckAttributeLicense";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  instruction: {
    marginBottom: theme.spacing(3),
    textAlign: "left",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  backButton: {
    marginRight: theme.spacing(4),
  },
  stepButtons: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(4),
  },
  form: {
    width: "100%",
    marginBottom: theme.spacing(4),
  },
  formControl: {
    width: "60%",
    marginBottom: theme.spacing(4),
  },
  divider: {
    width: "100%",
    borderTop: "1px dashed",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    marginLeft: 0,
    marginRight: 0,
  },
  dropzone: {
    border: "1px dashed #ddd",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    background: "#fefefe",
    "& p": {
      color: "#666",
      fontSize: 16,
    },
    "& svg": {
      color: theme.palette.primary.light,
    },
    "& img": {
      maxHeight: "100px",
    },
    "& + .MuiGrid-container": {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
  },
  dropzoneError: {
    border: `1px dashed ${theme.palette.warning.main}`,
  },
}));

const StepButton = styled(Button)(({ theme }) => ({
  minWidth: "120px",
}));

function SelectTypePageWrapper(props) {
  const classes = useStyles();
  return <SelectTypePage classes={classes} {...props} />;
}

class SelectTypePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 0,
      age: "",
      ageRandomValue: "",
      proofOfAge: null,
      proofOfAgeRandomValue: "",
      proofOfAgeOriginalValue: [],
      notificationOpen: false,
      degree: "",
      degreeRandomValue: "",
      degreeDescription: "",
      degreeDescriptionRandomValue: "",
      proofOfDegree: null,
      proofOfDegreeRandomValue: "",
      proofOfDegreeOriginalValue: [],
      license: "",
      licenseRandomValue: "",
      licenseDescription: "",
      licenseDescriptionRandomValue: "",
      licenseExpireDate: null,
      licenseExpireDateRandomValue: "",
      proofOfLicense: null,
      proofOfLicenseRandomValue: "",
      proofOfLicenseOriginalValue: [],
      notificationMessage: "Please Fill the Information.",
      configurated: false,
      clientFile: [],
      validatorFile: [],
      validatorAddress: "",
      clientAddress: "",
      approval: "",
      signatureRandomValue: "",
      publicKey: [],
      mode: 0, // 0: configuration file, 1: input manually
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      [`${e.target.name}Dirty`]: true,
    });
  };

  handleFocus = () => {
    this.setState({
      seedDirty: true,
    });
  };

  handleGenerateDialogClose = () => {
    this.setState({
      generateDialogStatus: false,
    });
  };

  handleFileUpload = (key, files, compare = false) => {
    let value = "";
    if (files.length > 0) {
      Utilities.hashFile(files[0], (result) => {
        value = result;
        var otherKey;
        if (compare) {
          if (key === "validatorFile") {
            otherKey = "clientFile";
          } else if (key === "clientFile") {
            otherKey = "validatorFile";
          } else {
            otherKey = key;
          }
        }
        if (compare && this.state[otherKey]) {
          if (this.state[otherKey] !== value) {
            this.setState({
              notificationOpen: true,
              notificationMessage:
                "This file contains values that disagree with previously uploaded values.",
            });
          }
        } else {
          this.setState({
            [key]: value,
            [key + "OriginalValue"]: files,
          });
        }
      });
    } else {
      this.setState({
        [key]: "",
        [key + "OriginalValue"]: [],
      });
    }
  };

  handleClose = () => {
    this.setState({
      notificationOpen: false,
    });
  };

  handleDateChange = (date) => {
    this.setState({
      licenseExpireDate: moment(new Date(date).valueOf()).format("YYYY-MM-DD"),
    });
  };

  handleSubmit = () => {
    const {
      age,
      ageRandomValue,
      proofOfAgeOriginalValue,
      proofOfAgeRandomValue,
      proofOfAge,
      degree,
      proofOfDegree,
      degreeRandomValue,
      degreeDescription,
      degreeDescriptionRandomValue,
      proofOfDegreeRandomValue,
      proofOfDegreeOriginalValue,
      license,
      proofOfLicense,
      licenseRandomValue,
      licenseDescription,
      licenseDescriptionRandomValue,
      licenseExpireDate,
      licenseExpireDateRandomValue,
      proofOfLicenseOriginalValue,
      proofOfLicenseRandomValue,
      validatorAddress,
      signatureRandomValue,
      approval,
      type,
      clientAddress,
      publicKey,
    } = this.state;
    var { log } = this.props;
    const { handleNext, updateValueEntry } = this.props;
    let valueKey = "";
    let isPassvalidation = false;
    let values = {};
    switch (type) {
      case 0:
        valueKey = "age";
        values = {
          age,
          ageRandomValue,
          proofOfAge,
          proofOfAgeOriginalValue,
          proofOfAgeRandomValue,
          validatorAddress,
          clientAddress,
          signatureRandomValue,
          approval,
        };
        break;
      case 1:
        valueKey = "degree";
        values = {
          degree,
          degreeRandomValue,
          degreeDescription,
          proofOfDegree,
          degreeDescriptionRandomValue,
          proofOfDegreeRandomValue,
          proofOfDegreeOriginalValue,
          validatorAddress,
          signatureRandomValue,
          clientAddress,
          approval,
        };
        break;
      case 2:
        valueKey = "license";
        values = {
          license,
          licenseRandomValue,
          licenseDescription,
          licenseDescriptionRandomValue,
          licenseExpireDate,
          licenseExpireDateRandomValue,
          proofOfLicense,
          proofOfLicenseOriginalValue,
          proofOfLicenseRandomValue,
          validatorAddress,
          signatureRandomValue,
          approval,
          clientAddress,
        };
        break;

      default:
        break;
    }
    console.log("sesese", values);
    isPassvalidation = Object.keys(values).every((k) => {
      if (!!values[k]) {
        return values[k].length > 0;
      } else {
        return false;
      }
    });

    if (!isPassvalidation) {
      this.setState({
        notificationOpen: true,
      });
    } else {
      handleNext();
      updateValueEntry(valueKey, values);
      updateValueEntry("key", valueKey);
      updateValueEntry("publicKey", publicKey);
      const date_time = Utilities.timeAndDate();
      updateValueEntry("currentDate", date_time[0]);
      updateValueEntry("currentTime", date_time[1]);
    }
  };

  handleKeyFileUpload = (key, files) => {
    console.log(files);
    this.setState({
      [key]: files,
    });
  };

  renderContent = (type) => {
    const { classes, theme } = this.props;
    const {
      age,
      ageRandomValue,
      proofOfAgeOriginalValue,
      proofOfAgeRandomValue,
      degree,
      degreeRandomValue,
      degreeDescription,
      degreeDescriptionRandomValue,
      proofOfDegreeRandomValue,
      proofOfDegreeOriginalValue,
      license,
      licenseRandomValue,
      licenseDescription,
      licenseDescriptionRandomValue,
      licenseExpireDate,
      licenseExpireDateRandomValue,
      proofOfLicenseOriginalValue,
      proofOfLicenseRandomValue,
      configurated,
      validatorAddress,
      signatureRandomValue,
      approval,
      clientAddress,
    } = this.state;
    switch (type) {
      case 0:
        return (
          <AgeNode
            theme={theme}
            classes={classes}
            age={age}
            proofOfAgeOriginalValue={proofOfAgeOriginalValue}
            proofOfAgeRandomValue={proofOfAgeRandomValue}
            ageRandomValue={ageRandomValue}
            validatorAddress={validatorAddress}
            approval={approval}
            signatureRandomValue={signatureRandomValue}
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
            canEdit={configurated}
            clientAddress={clientAddress}
          />
        );

      case 1:
        return (
          <DegreeNode
            theme={theme}
            classes={classes}
            degree={degree}
            degreeDescriptionRandomValue={degreeDescriptionRandomValue}
            proofOfDegreeOriginalValue={proofOfDegreeOriginalValue}
            degreeDescription={degreeDescription}
            validatorAddress={validatorAddress}
            approval={approval}
            signatureRandomValue={signatureRandomValue}
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
            canEdit={configurated}
            degreeRandomValue={degreeRandomValue}
            proofOfDegreeRandomValue={proofOfDegreeRandomValue}
            clientAddress={clientAddress}
          />
        );

      case 2:
        return (
          <LicenseNode
            theme={theme}
            classes={classes}
            license={license}
            canEdit={configurated}
            licenseDescription={licenseDescription}
            licenseExpireDate={licenseExpireDate}
            proofOfLicenseOriginalValue={proofOfLicenseOriginalValue}
            validatorAddress={validatorAddress}
            approval={approval}
            signatureRandomValue={signatureRandomValue}
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
            handleDateChange={this.handleDateChange}
            licenseRandomValue={licenseRandomValue}
            licenseDescriptionRandomValue={licenseDescriptionRandomValue}
            licenseExpireDateRandomValue={licenseExpireDateRandomValue}
            proofOfLicenseRandomValue={proofOfLicenseRandomValue}
            clientAddress={clientAddress}
          />
        );

      default:
        return "";
    }
  };

  // TODO: re-merge this and handleValidatorFileUpload
  handleClientFileUpload = (file) => {
    this.setState({
      clientFile: file,
    });
    if (file.length > 0) {
      const zip = new Zip();
      const that = this;
      let valueObj = {};
      zip
        .loadAsync(file[0])
        .then(function (zipF) {
          const files = Object.keys(zipF.files).map((item) => item.toString());
          if (!files.includes("encryption_result.txt")) {
            throw Error;
          }
          for (let index = 0; index < files.length; index++) {
            if (files[index] === "encryption_result.txt") {
              zipF
                .file("encryption_result.txt")
                .async("string")
                .then((result) => {
                  valueObj.valueString = result;
                  const state = that.formatValue(valueObj);
                  that.setState({
                    ...state,
                    configurated: true,
                    mode: 1,
                  });
                });
            }
            if (files[index].includes("Original")) {
              zipF
                .file(files[index])
                .async("blob")
                .then((result) => {
                  result.lastModifiedDate = new Date();
                  valueObj.file = new File([result], files[index]);
                  that.formatValue(valueObj, true);
                  that.setState({
                    configurated: true,
                    mode: 1,
                  });
                });
            }
          }
        })
        .catch((err) => {
          that.setState({
            clientFile: [],
            notificationOpen: true,
            notificationMessage: "Invalid Client File.",
          });
        });
    } else {
      this.setState({
        configurated: false,
      });
    }
  };

  handleValidatorFileUpload = (file) => {
    this.setState({
      validatorFile: file,
    });
    if (file.length > 0) {
      const zip = new Zip();
      const that = this;
      let valueObj = {};
      zip
        .loadAsync(file[0])
        .then(function (zipF) {
          const files = Object.keys(zipF.files).map((item) => item.toString());
          if (!files.includes("result.txt")) {
            throw Error;
          }
          for (let index = 0; index < files.length; index++) {
            if (files[index] === "publicKey.txt") {
              zipF
                .file("publicKey.txt")
                .async("string")
                .then((string) => {
                  that.setState({
                    publicKey: [
                      new File([string], "publicKey.txt", {
                        type: "text/plain;charset=utf-8",
                      }),
                    ],
                  });
                });
            }
            if (files[index] === "result.txt") {
              zipF
                .file("result.txt")
                .async("string")
                .then((result) => {
                  valueObj.valueString = result;
                  const state = that.formatValue(valueObj, false, true);
                  that.setState({
                    ...state,
                    configurated: true,
                    mode: 1,
                  });
                });
            }
            if (files[index].includes("Original")) {
              zipF
                .file(files[index])
                .async("blob")
                .then((result) => {
                  result.lastModifiedDate = new Date();
                  valueObj.file = new File([result], files[index]);
                  that.formatValue(valueObj, true, true);
                  that.setState({
                    configurated: true,
                    mode: 1,
                  });
                });
            }
          }
        })
        .catch((err) => {
          that.setState({
            validatorFile: [],
            notificationOpen: true,
            notificationMessage: "Invalid Validator File.",
          });
        });
    } else {
      this.setState({
        configurated: false,
      });
    }
  };

  handleChangeMode = () => {
    this.setState({
      mode: 1,
    });
  };

  formatValue = (valueObj, file = false, validator = false) => {
    const value = JSON.parse(valueObj.valueString);
    let res = {};
    let val = validator ? "_val" : "";
    switch (value.key + val) {
      case "age":
        res = {
          type: 0,
          age: value.age.age,
          clientAddress: value.age.clientAddress,
          ageRandomValue: value.age.ageResult.randomValue,
          proofOfAgeRandomValue: value.age.proofOfAgeResult.randomValue,
        };
        res = this.compare_vals(res);
        if (file) {
          this.handleFileUpload("proofOfAge", [valueObj.file]);
        }
        break;
      case "age_val":
        res = {
          type: 0,
          age: value.age.age,
          ageRandomValue: value.age.ageRandomValue,
          proofOfAgeRandomValue: value.age.proofOfAgeRandomValue,
          validatorAddress: value.seedAndSign.validatorAddress,
          signatureRandomValue: value.signatureRandomValue,
          approval: value.approve,
        };
        // this.props.valueEntry.seedAndSign.approval =
        //   value.encryptedApproval.sig;
        res = this.compare_vals(res);
        if (file) {
          this.handleFileUpload("proofOfAge", [valueObj.file]);
        }
        break;
      case "degree":
        res = {
          type: 1,
          degree: value.degree.degree,
          clientAddress: value.degree.clientAddress,
          degreeRandomValue: value.degree.degreeResult.randomValue,
          degreeDescription: value.degree.degreeDescription,
          degreeDescriptionRandomValue:
            value.degree.degreeDescriptionResult.randomValue,
          proofOfDegreeRandomValue:
            value.degree.proofOfDegreeResult.randomValue,
        };
        res = this.compare_vals(res);
        if (file) {
          this.handleFileUpload("proofOfDegree", [valueObj.file]);
        }
        break;
      case "degree_val":
        res = {
          type: 1,
          degree: value.degree.degree,
          degreeRandomValue: value.degree.degreeRandomValue,
          degreeDescription: value.degree.degreeDescription,
          degreeDescriptionRandomValue:
            value.degree.degreeDescriptionRandomValue,
          proofOfDegreeRandomValue: value.degree.proofOfDegreeRandomValue,
          validatorAddress: value.seedAndSign.validatorAddress,
          signatureRandomValue: value.signatureRandomValue,
          approval: value.approve,
        };
        // this.props.valueEntry.seedAndSign.approval =
        //   value.encryptedApproval.sig;
        res = this.compare_vals(res);
        if (file) {
          this.handleFileUpload("proofOfDegree", [valueObj.file]);
        }
        break;
      case "license":
        res = {
          type: 2,
          license: value.license.license,
          clientAddress: value.license.clientAddress,
          licenseRandomValue: value.license.licenseResult.randomValue,
          licenseExpireDate: value.license.licenseExpireDate,
          licenseExpireDateRandomValue:
            value.license.licenseExpireDateResult.randomValue,
          licenseDescription: value.license.licenseDescription,
          licenseDescriptionRandomValue:
            value.license.licenseDescriptionResult.randomValue,
          proofOfLicenseRandomValue:
            value.license.proofOfLicenseResult.randomValue,
        };
        res = this.compare_vals(res);
        if (file) {
          this.handleFileUpload("proofOfLicense", [valueObj.file]);
        }
        break;
      case "license_val":
        res = {
          type: 2,
          license: value.license.license,
          licenseRandomValue: value.license.licenseRandomValue,
          licenseExpireDate: value.license.licenseExpireDate,
          licenseExpireDateRandomValue:
            value.license.licenseExpireDateRandomValue,
          licenseDescription: value.license.licenseDescription,
          licenseDescriptionRandomValue:
            value.license.licenseDescriptionRandomValue,
          proofOfLicenseRandomValue: value.license.proofOfLicenseRandomValue,
          validatorAddress: value.seedAndSign.validatorAddress,
          signatureRandomValue: value.signatureRandomValue,
          approval: value.approve,
        };
        // this.props.valueEntry.seedAndSign.approval =
        //   value.encryptedApproval.sig;
        res = this.compare_vals(res);
        if (file) {
          this.handleFileUpload("proofOfLicense", [valueObj.file]);
        }
        break;

      default:
        break;
    }
    return res;
  };

  compare_vals = (val_set) => {
    for (var key in val_set) {
      if (this.state.hasOwnProperty(key)) {
        if (
          this.state[key] !== "" &&
          this.state[key] !== 0 &&
          this.state[key] !== [] &&
          this.state[key] !== null
        ) {
          if (val_set[key] === this.state[key]) {
            delete val_set[key];
          } else {
            this.setState({
              notificationOpen: true,
              notificationMessage:
                "I already have a value of " +
                this.state[key] +
                " for " +
                key +
                ", " +
                "but the new file says it's " +
                val_set[key] +
                ". Something is wrong.",
            });
            return {};
          }
        }
      }
    }
    return val_set;
  };

  render() {
    const { classes, handleBack, theme } = this.props;
    const {
      type,
      notificationOpen,
      notificationMessage,
      configurated,
      clientFile,
      validatorFile,
      mode,
      publicKey,
    } = this.state;
    const Attribute = ["AGE", "DEGREE", "LICENSE"];

    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <FormControl className={classes.formControl}>
              <Typography variant="caption" className={classes.instruction}>
                <Attachment color="primary" />
                <Typography variant="caption" style={{ marginLeft: "8px" }}>
                  UPLOAD ENCRYPTION RESULT .ZIP FILES FROM CLIENT
                </Typography>
              </Typography>
              <Upload
                handleFileUpload={(files) => {
                  this.handleClientFileUpload(files.map((file) => file.file));
                }}
                files={clientFile}
              />
              <Typography variant="caption" className={classes.instruction}>
                <Attachment color="primary" />
                <Typography variant="caption" style={{ marginLeft: "8px" }}>
                  UPLOAD VALIDATION RESULT .ZIP FILES FROM VALIDATOR
                </Typography>
              </Typography>
              <Upload
                handleFileUpload={(files) => {
                  this.handleValidatorFileUpload(
                    files.map((file) => file.file)
                  );
                }}
                files={validatorFile}
              />
            </FormControl>

            <Divider
              variant="middle"
              style={{ width: "100%", marginBottom: "24px" }}
            />

            {mode == 1 ? (
              <form noValidate className={classes.form}>
                <Typography variant="caption" className={classes.instruction}>
                  <LooksOne color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    SELECT WHAT KIND OF DATA FOR VALIDATION.
                  </Typography>
                </Typography>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="client-type">Type</InputLabel>
                  <Select
                    value={type}
                    onChange={this.handleChange}
                    inputProps={{
                      name: "type",
                      id: "client-type",
                    }}
                    defaultValue={0}
                    disabled={configurated}
                  >
                    <MenuItem value={0}>Age</MenuItem>
                    <MenuItem value={1}>Degree</MenuItem>
                    <MenuItem value={2}>License</MenuItem>
                  </Select>
                </FormControl>

                <Divider variant="middle" className={classes.divider} />

                <Typography variant="caption" className={classes.instruction}>
                  <LooksTwo color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    INSERT {Attribute[type]} AND RANDOM VALUE.
                  </Typography>
                </Typography>

                {this.renderContent(type)}
                <FormControl className={classes.formControl}>
                  <React.Fragment>
                    <FormLabel
                      component="legend"
                      style={{
                        marginBottom: theme.spacing(2),
                      }}
                    >
                      Public Key
                    </FormLabel>

                    {configurated ? (
                      <Chip
                        label={publicKey.length && publicKey[0].name}
                        className={classes.chip}
                        variant="outlined"
                        color="default"
                      />
                    ) : (
                      <Upload
                        handleFileUpload={(files) => {
                          this.handleKeyFileUpload(
                            "publicKey",
                            files.map((file) => file.file)
                          );
                        }}
                        files={publicKey}
                      />
                    )}
                  </React.Fragment>
                </FormControl>
              </form>
            ) : (
              <div
                style={{
                  width: "100%",
                  marginBottom: theme.spacing(3),
                }}
              >
                <StepButton
                  variant="contained"
                  color="primary"
                  onClick={this.handleChangeMode}
                >
                  Or, Input Fields Manually
                </StepButton>
              </div>
            )}

            <Notification
              open={notificationOpen}
              onClose={this.handleClose}
              message={notificationMessage}
            />

            <Divider variant="middle" style={{ width: "100%" }} />

            <div className={classes.stepButtons}>
              <Link to="/">
                <StepButton className={classes.backButton} variant="outlined">
                  Back To Home
                </StepButton>
              </Link>
              <StepButton
                variant="contained"
                color="primary"
                onClick={this.handleSubmit}
              >
                Next
              </StepButton>
            </div>
          </Box>
        </Container>
      </React.Fragment>
    );
  }
}

export default withTheme(SelectTypePageWrapper);
