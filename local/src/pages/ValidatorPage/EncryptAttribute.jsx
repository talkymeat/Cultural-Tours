/**
 * Author: JIN XIAO
 * Email: xiaojin971212@gmail.com
 */
import React, { Component } from "react";
import { styled, makeStyles, withTheme } from "@material-ui/core/styles";
import CssBaseLine from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Divider from "@material-ui/core/Divider";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { LooksOne, LooksTwo, Looks3, Attachment } from "@material-ui/icons";
import Input from "@material-ui/core/Input";

import * as Utilities from "../../utilities";
import Notification from "../../components/Notification";
import moment from "moment";
import Zip from "jszip";
import Upload from "../../components/Upload";

import AgeNode from "./EncryptAttributeAge";
import DegreeNode from "./EncryptAttributeDegree";
import LicenseNode from "./EncryptAttributeLicense";

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
      configurationFile: [],
      clientAddress: "",
      mode: 0, // 0: configuration file, 1: input manually
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      [`${e.target.name}Dirty`]: true,
    });
  };

  handleGenerateSeed = () => {
    let emptyArray = new Uint32Array(2);
    window.crypto.getRandomValues(emptyArray);
    let fisrtPart = emptyArray[0].toString(16);
    let secondPart = emptyArray[1].toString(16);
    return fisrtPart.concat(secondPart);
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

  handleFileUpload = (key, files) => {
    let value = "";
    if (files.length > 0) {
      Utilities.hashFile(files[0], (result) => {
        value = result;
        this.setState({
          [key]: value,
          [key + "OriginalValue"]: files,
        });
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
      type,
      clientAddress,
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
          clientAddress,
          ageRandomValue,
          proofOfAge,
          proofOfAgeOriginalValue,
          proofOfAgeRandomValue,
        };
        break;
      case 1:
        valueKey = "degree";
        values = {
          degree,
          clientAddress,
          degreeRandomValue,
          degreeDescription,
          proofOfDegree,
          degreeDescriptionRandomValue,
          proofOfDegreeRandomValue,
          proofOfDegreeOriginalValue,
        };
        break;
      case 2:
        valueKey = "license";
        values = {
          license,
          clientAddress,
          licenseRandomValue,
          licenseDescription,
          licenseDescriptionRandomValue,
          licenseExpireDate,
          licenseExpireDateRandomValue,
          proofOfLicense,
          proofOfLicenseOriginalValue,
          proofOfLicenseRandomValue,
        };
        break;

      default:
        break;
    }
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
      const date_time = Utilities.timeAndDate();
      updateValueEntry("currentDate", date_time[0]);
      updateValueEntry("currentTime", date_time[1]);
    }
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
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
            canEdit={configurated}
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
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
            canEdit={configurated}
            degreeRandomValue={degreeRandomValue}
            proofOfDegreeRandomValue={proofOfDegreeRandomValue}
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
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
            handleDateChange={this.handleDateChange}
            licenseRandomValue={licenseRandomValue}
            licenseDescriptionRandomValue={licenseDescriptionRandomValue}
            licenseExpireDateRandomValue={licenseExpireDateRandomValue}
            proofOfLicenseRandomValue={proofOfLicenseRandomValue}
          />
        );

      default:
        return "";
    }
  };

  handleConfigureUpload = (file) => {
    this.setState({
      configurationFile: file,
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
          console.log("ew", files);
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
            configurationFile: [],
            notificationOpen: true,
            notificationMessage: "Invalid Configuration File.",
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

  formatValue = (valueObj, file = false) => {
    const value = JSON.parse(valueObj.valueString);
    let res = {};
    switch (value.key) {
      case "age":
        res = {
          type: 0,
          clientAddress: value.age.clientAddress,
          age: value.age.age,
          ageRandomValue: value.age.ageResult.randomValue,
          proofOfAgeRandomValue: value.age.proofOfAgeResult.randomValue,
        };
        if (file) {
          this.handleFileUpload("proofOfAge", [valueObj.file]);
        }
        break;
      case "degree":
        res = {
          type: 1,
          clientAddress: value.degree.clientAddress,
          degree: value.degree.degree,
          degreeRandomValue: value.degree.degreeResult.randomValue,
          degreeDescription: value.degree.degreeDescription,
          degreeDescriptionRandomValue:
            value.degree.degreeDescriptionResult.randomValue,
          proofOfDegreeRandomValue:
            value.degree.proofOfDegreeResult.randomValue,
        };
        if (file) {
          this.handleFileUpload("proofOfDegree", [valueObj.file]);
        }
        break;
      case "license":
        res = {
          type: 2,
          clientAddress: value.license.clientAddress,
          license: value.license.license,
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
        if (file) {
          this.handleFileUpload("proofOfLicense", [valueObj.file]);
        }
        break;

      default:
        break;
    }
    return res;
  };

  render() {
    const { classes, handleBack, theme } = this.props;
    const {
      type,
      notificationOpen,
      notificationMessage,
      configurated,
      configurationFile,
      mode,
      clientAddress,
    } = this.state;
    const Attribute = ["AGE", "DEGREE", "LICENSE"];

    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <Typography variant="caption" className={classes.instruction}>
              <Attachment color="primary" />
              <Typography variant="caption" style={{ marginLeft: "8px" }}>
                UPLOAD ENCRYPTION RESULT .ZIP FILE
              </Typography>
            </Typography>
            <FormControl className={classes.formControl}>
              {/* <Typography
                variant="caption"
                style={{
                  marginBottom: theme.spacing(1),
                  marginTop: theme.spacing(2)
                }}
              >
                Configuration File:
              </Typography> */}
              <Upload
                handleFileUpload={(files) => {
                  this.handleConfigureUpload(files.map((file) => file.file));
                }}
                files={configurationFile}
              />
            </FormControl>

            <Divider
              variant="middle"
              style={{ width: "100%", marginBottom: "24px" }}
            />

            {mode == 1 ? (
              <form noValidate className={classes.form}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="validator-clientAddress">
                    Client's Address
                  </InputLabel>
                  <Input
                    value={clientAddress}
                    onChange={this.handleChange}
                    inputProps={{
                      name: "clientAddress",
                      id: "validator-clientAddress",
                      placeholder: "Please Input Client's Address",
                    }}
                    disabled={configurated}
                  />
                </FormControl>
                <Typography variant="caption" className={classes.instruction}>
                  <LooksTwo color="primary" />
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
                  <Looks3 color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    INSERT {Attribute[type]} AND RANDOM VALUE.
                  </Typography>
                </Typography>

                {this.renderContent(type)}
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
              <StepButton onClick={handleBack} className={classes.backButton}>
                Back
              </StepButton>
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
