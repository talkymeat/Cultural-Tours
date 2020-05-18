/**
 * Author: JIN XIAO
 * Email: xiaojin971212@gmail.com
 */
import React, { Component } from "react";
import { Link } from "react-router-dom";
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
import { LooksOne, LooksTwo, Looks3, Looks } from "@material-ui/icons";
import * as Utilities from "../../utilities";
import Notification from "../../components/Notification";
import moment from "moment";
import Input from "@material-ui/core/Input";
import { FormHelperText } from "@material-ui/core";

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
      proofOfAge: null,
      proofOfAgeOriginalValue: [],
      notificationOpen: false,
      degree: "",
      degreeDescription: "",
      proofOfDegree: null,
      proofOfDegreeOriginalValue: [],
      license: "",
      licenseDescription: "",
      licenseExpireDate: null,
      proofOfLicense: null,
      proofOfLicenseOriginalValue: [],
      notificationMessage: "Please fill all the information.",
      clientAddress: "",
    };
  }
  // componentDidMount() {
  //   console.log("props", this.props);
  // }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
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
    const { type, clientAddress } = this.state;
    var { log } = this.props;
    const { valueEntry } = this.props;
    const { handleNext, updateValueEntry } = this.props;
    let valueEntities = {};
    let valueKey = "";
    let isPassvalidation = false;
    let values = {};
    if (!Utilities.isAddress(clientAddress)) {
      this.setState({
        notificationOpen: true,
        notificationMessage:
          "Please input the correct format of client address.",
      });
      return;
    }
    switch (type) {
      case 0:
        valueKey = "age";
        values = {
          age: this.state.age,
          proofOfAge: this.state.proofOfAge,
          clientAddress,
        };

        isPassvalidation = Object.keys(values).every((k) => !!values[k]);
        if (isPassvalidation) {
          valueEntities = {
            clientAddress,
            age: this.state.age,
            ageResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.age,
              log
            ),
            proofOfAgeResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.proofOfAge,
              log
            ),
            proofOfAgeOriginalValue: this.state.proofOfAgeOriginalValue,
          };
        }
        break;
      case 1:
        valueKey = "degree";
        values = {
          clientAddress,
          degree: this.state.degree,
          degreeDescription: this.state.degreeDescription,
          proofOfDegree: this.state.proofOfDegree,
        };
        isPassvalidation = Object.keys(values).every((k) => !!values[k]);
        if (isPassvalidation) {
          valueEntities = {
            clientAddress,
            degree: this.state.degree,
            degreeDescription: this.state.degreeDescription,
            degreeResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.degree,
              log
            ),
            degreeDescriptionResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.degreeDescription,
              log
            ),
            proofOfDegreeResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.proofOfDegree,
              log
            ),
            proofOfDegreeOriginalValue: this.state.proofOfDegreeOriginalValue,
          };
        }
        break;
      case 2:
        valueKey = "license";
        values = {
          clientAddress,
          license: this.state.license,
          licenseDescription: this.state.licenseDescription,
          licenseExpireDate: this.state.licenseExpireDate,
          proofOfLicense: this.state.proofOfLicense,
        };
        isPassvalidation = Object.keys(values).every((k) => !!values[k]);
        if (isPassvalidation) {
          valueEntities = {
            clientAddress,
            license: this.state.license,
            licenseDescription: this.state.licenseDescription,
            licenseExpireDate: this.state.licenseExpireDate,
            licenseResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.license,
              log
            ),
            licenseDescriptionResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.licenseDescription,
              log
            ),
            licenseExpireDateResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.licenseExpireDate,
              log
            ),
            proofOfLicenseResult: Utilities.hashWithKeccak(
              Utilities.generateSeed(),
              this.state.proofOfLicense,
              log
            ),
            proofOfLicenseOriginalValue: this.state.proofOfLicenseOriginalValue,
          };
        }
        break;

      default:
        break;
    }
    if (!isPassvalidation) {
      this.setState({
        notificationOpen: true,
        notificationMessage: "Please fill all the Information.",
      });
    } else {
      handleNext();
      updateValueEntry(valueKey, valueEntities);
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
      degree,
      degreeDescription,
      license,
      licenseDescription,
      licenseExpireDate,
      proofOfAgeOriginalValue,
      proofOfDegreeOriginalValue,
      proofOfLicenseOriginalValue,
    } = this.state;
    switch (type) {
      case 0:
        return (
          <AgeNode
            theme={theme}
            classes={classes}
            age={age}
            proofOfAgeOriginalValue={proofOfAgeOriginalValue}
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
          />
        );

      case 1:
        return (
          <DegreeNode
            theme={theme}
            classes={classes}
            degree={degree}
            degreeDescription={degreeDescription}
            handleChange={this.handleChange}
            proofOfDegreeOriginalValue={proofOfDegreeOriginalValue}
            handleFileUpload={this.handleFileUpload}
          />
        );

      case 2:
        return (
          <LicenseNode
            theme={theme}
            classes={classes}
            license={license}
            licenseDescription={licenseDescription}
            licenseExpireDate={licenseExpireDate}
            handleChange={this.handleChange}
            handleFileUpload={this.handleFileUpload}
            handleDateChange={this.handleDateChange}
            proofOfLicenseOriginalValue={proofOfLicenseOriginalValue}
          />
        );

      default:
        return "";
    }
  };

  render() {
    const { classes } = this.props; // DC@20-04-20: Removed handleBack
    const {
      type,
      notificationOpen,
      notificationMessage,
      clientAddress,
    } = this.state;
    const Attribute = ["AGE", "DEGREE", "LICENSE"];
    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <form noValidate className={classes.form}>
              <Typography variant="caption" className={classes.instruction}>
                <LooksOne color="primary" />
                <Typography variant="caption" style={{ marginLeft: "8px" }}>
                  Pleace Input the Address of Your Account
                </Typography>
              </Typography>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="client-age">Address</InputLabel>
                <Input
                  value={clientAddress}
                  onChange={this.handleChange}
                  inputProps={{
                    name: "clientAddress",
                    id: "client-address",
                  }}
                />
                <FormHelperText>
                  Don't know your account address?{" "}
                  <a href="http://www.google.com" target="_blank">
                    CLICK HERE!
                  </a>
                </FormHelperText>
              </FormControl>
              <Typography variant="caption" className={classes.instruction}>
                <LooksTwo color="primary" />
                <Typography variant="caption" style={{ marginLeft: "8px" }}>
                  SELECT WHAT KIND OF DATA FOR ENCRYPTION.
                </Typography>
              </Typography>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="client-type">Type</InputLabel>
                <Select
                  id="what-data"
                  value={type}
                  onChange={this.handleChange}
                  inputProps={{
                    name: "type",
                    id: "client-type",
                  }}
                  defaultValue={0}
                >
                  <MenuItem id="select-age" value={0}>
                    Age
                  </MenuItem>
                  <MenuItem id="select-degree" value={1}>
                    Degree
                  </MenuItem>
                  <MenuItem id="select-license" value={2}>
                    License
                  </MenuItem>
                </Select>
              </FormControl>

              <Divider variant="middle" className={classes.divider} />

              <Typography variant="caption" className={classes.instruction}>
                <Looks3 color="primary" />
                <Typography variant="caption" style={{ marginLeft: "8px" }}>
                  INSERT {Attribute[type]}.
                </Typography>
              </Typography>

              {this.renderContent(type)}
            </form>

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
