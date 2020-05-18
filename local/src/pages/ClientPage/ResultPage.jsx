/**
 * Author: JIN XIAO
 * Email: xiaojin971212@gmail.com
 */
import React, { Component } from "react";
import { styled, makeStyles, withTheme } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import CssBaseLine from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Chip from "@material-ui/core/Chip";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Zip from "jszip";
import MailService from "./MailingService";
import { CLIENT_URL } from "../../config";
import MuiAlert from "@material-ui/lab/Alert";

import {
  LooksOne,
  LooksTwo,
  Looks3,
  Email,
  CloudDownloadOutlined,
} from "@material-ui/icons";
import FileSaver from "file-saver";

import Descriptionitem from "../../components/DescriptionItem";

function Alert(props) {
  return <MuiAlert elevation={0} variant="outlined" {...props} />;
}

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
    "& a": {
      textDecoration: "none",
    },
  },
  divider: {
    width: "100%",
    borderTop: "1px dashed",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    marginLeft: 0,
    marginRight: 0,
  },
  row: {
    marginBottom: theme.spacing(2),
  },
  actions: {
    width: "100%",
    display: "flex",
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(2),
  },
  formControl: {
    width: "60%",
    marginBottom: theme.spacing(4),
  },
}));

const StepButton = styled(Button)(({ theme }) => ({
  minWidth: "120px",
}));

function ResultPageWrapper(props) {
  const classes = useStyles();
  return <ResultPage classes={classes} {...props} />;
}

class ResultPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      senderEmail: "",
      recieverEmail: "",
      downloadDirty: false,
    };
  }
  componentDidMount() {
    // console.log("result page props", this.props);
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  renderOriginalDescriptionList = () => {
    const { valueEntry } = this.props;
    let originalValueList = [];
    switch (valueEntry.key) {
      case "age":
        const { age } = valueEntry;
        originalValueList.push({
          label: "Age",
          value: age.age,
        });
        originalValueList.push({
          file: true,
          label: "Proof Of Age",
          value: age.proofOfAgeOriginalValue,
        });
        break;
      case "degree":
        const { degree } = valueEntry;
        originalValueList.push({
          label: "DEGREE",
          value: degree.degree,
        });
        originalValueList.push({
          label: "DEGREE DESCRIPTION",
          value: degree.degreeDescription,
        });
        originalValueList.push({
          file: true,
          label: "Proof Of DEGREE",
          value: degree.proofOfDegreeOriginalValue,
        });
        break;
      case "license":
        const { license } = valueEntry;
        originalValueList.push({
          label: "LICENSE",
          value: license.license,
        });
        originalValueList.push({
          label: "LICENSE DESCRIPTION",
          value: license.licenseDescription,
        });
        originalValueList.push({
          label: "LICENSE EXPIREDATE",
          value: license.licenseExpireDate,
        });
        originalValueList.push({
          file: true,
          label: "Proof Of LICENSE",
          value: license.proofOfLicenseOriginalValue,
        });
        break;

      default:
        break;
    }
    return originalValueList;
  };

  renderResultDescriptionList = () => {
    const { valueEntry } = this.props;
    let randomValueList = [];
    let hashValueList = [];
    switch (valueEntry.key) {
      case "age":
        const {
          age: { ageResult, proofOfAgeResult },
        } = valueEntry;
        randomValueList.push({
          label: "Random Value Of Age",
          value: ageResult.randomValue,
        });
        randomValueList.push({
          label: "Random Value Of Proof Of Age",
          value: proofOfAgeResult.randomValue,
        });
        hashValueList.push({
          label: "Hashed Value Of Age",
          value: ageResult.hashValue,
        });
        hashValueList.push({
          label: "Hashed Value Of Proof Of Age",
          value: proofOfAgeResult.hashValue,
        });
        break;
      case "degree":
        const {
          degree: {
            degreeResult,
            degreeDescriptionResult,
            proofOfDegreeResult,
          },
        } = valueEntry;
        randomValueList.push({
          label: "Random Value Of DEGREE",
          value: degreeResult.randomValue,
        });
        randomValueList.push({
          label: "Random Value Of DEGREE DESCRIPTION",
          value: degreeDescriptionResult.randomValue,
        });
        randomValueList.push({
          label: "Random Value Of PROOF OF DEGREE",
          value: proofOfDegreeResult.randomValue,
        });
        hashValueList.push({
          label: "Hashed Value Of DEGREE",
          value: degreeResult.hashValue,
        });
        hashValueList.push({
          label: "Hashed Value Of DEGREE DESCRIPTION",
          value: degreeDescriptionResult.hashValue,
        });
        hashValueList.push({
          label: "Hashed Value Of PROOF OF DEGREE",
          value: proofOfDegreeResult.hashValue,
        });
        break;
      case "license":
        const {
          license: {
            licenseResult,
            licenseDescriptionResult,
            licenseExpireDateResult,
            proofOfLicenseResult,
          },
        } = valueEntry;
        randomValueList.push({
          label: "Random Value Of LICENSE",
          value: licenseResult.randomValue,
        });
        randomValueList.push({
          label: "Random Value Of LICENSE DESCRIPTION",
          value: licenseDescriptionResult.randomValue,
        });
        randomValueList.push({
          label: "Random Value Of LICENSE EXPIREDATE",
          value: licenseExpireDateResult.randomValue,
        });
        randomValueList.push({
          label: "Random Value Of PROOF OF LICENSE",
          value: proofOfLicenseResult.randomValue,
        });
        hashValueList.push({
          label: "Hashed Value Of LICENSE",
          value: licenseResult.hashValue,
        });
        hashValueList.push({
          label: "Hashed Value Of LICENSE DESCRIPTION",
          value: licenseDescriptionResult.hashValue,
        });
        hashValueList.push({
          label: "Hashed Value Of LICENSE EXPIREDATE",
          value: licenseExpireDateResult.hashValue,
        });
        hashValueList.push({
          label: "Hashed Value Of PROOF OF LICENSE",
          value: proofOfLicenseResult.hashValue,
        });

        break;

      default:
        break;
    }
    return {
      randomValueList,
      hashValueList,
    };
  };

  handleFileDownload = (file) => {
    FileSaver.saveAs(file);
  };

  handleResultDownload = () => {
    const {
      valueEntry: { key },
    } = this.props;
    const that = this;
    const resultEntities = this.props.valueEntry;
    const valueString = JSON.stringify(resultEntities);
    let zip = new Zip();
    const folder = zip.folder("result");
    folder.file(`encryption_result.txt`, valueString);
    let file = null;
    switch (key) {
      case "age":
        file = this.props.valueEntry[key].proofOfAgeOriginalValue[0];
        break;
      case "degree":
        file = this.props.valueEntry[key].proofOfDegreeOriginalValue[0];
        break;
      case "license":
        file = this.props.valueEntry[key].proofOfLicenseOriginalValue[0];
        break;
      default:
        break;
    }
    const { log } = this.props;
    const logString = JSON.stringify(log);
    folder
      .folder("log")
      .file(
        "encryption_log.txt",
        new Blob([logString], { type: "text/plain;charset=utf-8" })
      );
    folder.file("Original_" + file.name, file);
    folder.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, `${key}_encryption_result_${+new Date()}.zip`);
      that.setState({
        downloadDirty: true,
      });
    });
  };

  // handleLogDownload = () => {
  //   const { log } = this.props;
  //   const logString = JSON.stringify(log);
  //   FileSaver.saveAs(
  //     new Blob([logString], { type: "text/plain;charset=utf-8" }),
  //     "encryption_log.txt"
  //   );
  // };

  handleRegister = () => {
    const { valueEntry } = this.props;
    console.log(valueEntry);
    let searchParams = {};
    switch (valueEntry.key) {
      case "age":
        const { age } = valueEntry;
        searchParams = {
          type: 0,
          encryptedAge: age.ageResult.hashValue,
          encryptedProofOfAge: age.proofOfAgeResult.hashValue,
        };
        break;
      case "degree":
        const { degree } = valueEntry;
        searchParams = {
          type: 1,
          encryptedDegree: degree.degreeResult.hashValue,
          encryptedDescription: degree.degreeDescriptionResult.hashValue,
          encryptedProofOfDegree: degree.proofOfDegreeResult.hashValue,
        };
        break;
      case "license":
        const { license } = valueEntry;
        searchParams = {
          type: 2,
          encryptedLicense: license.licenseResult.hashValue,
          encryptedDate: license.licenseExpireDateResult.hashValue,
          encryptedDescription: license.licenseDescriptionResult.hashValue,
          encryptedProofOfLicense: license.proofOfLicenseResult.hashValue,
        };
        break;
      default:
        break;
    }
    let url =
      CLIENT_URL +
      "?" +
      Object.entries(searchParams)
        .map((i) => {
          return i.join("=");
        })
        .join("&");
    console.log(url);
    window.open(url, "_blank");
  };

  render() {
    const { classes, theme, valueEntry } = this.props;
    const { senderEmail, recieverEmail } = this.state;
    var { log } = this.props;
    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <div className={classes.actions}>
              {/* &nbsp;
              <StepButton
                variant="contained"
                color="primary"
                style={{ marginBottom: theme.spacing(4) }}
                onClick={this.handleLogDownload}
              >
                Download Log, {log.length} items encrypted
              </StepButton> */}
              <Alert severity="info">
                NOTE: Please click DOWNLOAD RESULT button first, and register
                your information after you downloaded the result.
              </Alert>
            </div>

            <ExpansionPanel elevation={0} style={{ width: "100%" }}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="body2">
                  ENCRYPTION DETAIL.(Click to expand)
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography variant="caption" className={classes.instruction}>
                  <LooksOne color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    CLIENT INFORMATION.
                  </Typography>
                </Typography>

                <Container>
                  <Grid
                    container
                    className={classes.row}
                    key={
                      valueEntry[valueEntry.key] &&
                      valueEntry[valueEntry.key]["clientAddress"]
                    }
                  >
                    <Descriptionitem
                      label="Address"
                      content={
                        valueEntry[valueEntry.key] &&
                        valueEntry[valueEntry.key]["clientAddress"]
                      }
                    />
                  </Grid>
                </Container>

                <Typography variant="caption" className={classes.instruction}>
                  <LooksTwo color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    ORIGINAL VALUE OF ENCRYPTION ATTRIBUTE.
                  </Typography>
                </Typography>

                <Container>
                  {this.renderOriginalDescriptionList().map((item) => {
                    return item.file ? (
                      <Grid container className={classes.row} key={item.value}>
                        <Descriptionitem
                          label={item.label}
                          content={
                            <Chip
                              icon={
                                <CloudDownloadOutlined
                                  style={{
                                    marginLeft: "12px",
                                    marginRight: "0px",
                                  }}
                                />
                              }
                              label={item.value[0].name}
                              className={classes.chip}
                              variant="outlined"
                              color="primary"
                              clickable
                              onClick={() => {
                                this.handleFileDownload(item.value[0]);
                              }}
                            />
                          }
                        />
                      </Grid>
                    ) : (
                      <Grid container className={classes.row} key={item.value}>
                        <Descriptionitem
                          label={item.label}
                          content={item.value}
                        />
                      </Grid>
                    );
                  })}
                </Container>

                <Divider variant="middle" className={classes.divider} />

                <Typography variant="caption" className={classes.instruction}>
                  <Looks3 color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    RESULT OF ENCRYPTION ATTRIBUTE.
                  </Typography>
                </Typography>

                <ExpansionPanel
                  elevation={0}
                  style={{ marginBottom: theme.spacing(2) }}
                >
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography variant="body2">Random Value List</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Container>
                      {this.renderResultDescriptionList().randomValueList.map(
                        (item, i) => {
                          return (
                            <Grid container className={classes.row}>
                              <Descriptionitem
                                key={item.value}
                                label={item.label}
                                content={item.value}
                                full
                              />
                            </Grid>
                          );
                        }
                      )}
                    </Container>
                  </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel elevation={0}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography variant="body2">
                      Encrypted Value List
                    </Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Container>
                      {this.renderResultDescriptionList().hashValueList.map(
                        (item) => {
                          return (
                            <Grid container className={classes.row}>
                              <Descriptionitem
                                key={item.value}
                                label={item.label}
                                content={item.value}
                                className={classes.row}
                                full
                              />
                            </Grid>
                          );
                        }
                      )}
                    </Container>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <Divider variant="middle" className={classes.divider} />

            <Typography variant="caption" className={classes.instruction}>
              <Email color="primary" />
              <Typography variant="caption" style={{ marginLeft: "8px" }}>
                SEND RESULT TO VALIDATOR BY EMAIL. (OPTIONAL)
              </Typography>
            </Typography>

            <Container>
              <MailService
                classes={classes}
                handleChange={this.handleChange}
                recieverEmail={recieverEmail}
              />
              <a
                onClick={(e) => {
                  window.open(
                    `mailto:${recieverEmail}?subject=[BlockchainStudio] Encryption Result`,
                    "Mail"
                  );
                  e.preventDefault();
                }}
                href={`mailto:${recieverEmail}?subject=[BlockchainStudio] Encryption Result`}
              >
                <StepButton
                  variant="contained"
                  color="primary"
                  style={{ marginBottom: theme.spacing(2) }}
                >
                  SEND
                </StepButton>
              </a>
            </Container>

            <Divider variant="middle" style={{ width: "100%" }} />

            <div className={classes.stepButtons}>
              <Link to={{ pathname: "/", state: { log: log } }}>
                <StepButton className={classes.backButton} variant="outlined">
                  Back To Home
                </StepButton>
              </Link>
              {this.state.downloadDirty ? (
                <StepButton
                  variant="contained"
                  color="primary"
                  onClick={this.handleRegister}
                >
                  Go To Register
                </StepButton>
              ) : (
                <StepButton
                  variant="contained"
                  color="primary"
                  style={{ marginBottom: theme.spacing(4) }}
                  onClick={this.handleResultDownload}
                >
                  Download Result
                </StepButton>
              )}
            </div>
          </Box>
        </Container>
      </React.Fragment>
    );
  }
}

export default withTheme(ResultPageWrapper);
