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
import { SHA3 } from "crypto-js";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import * as Utilities from "../../utilities";
import Zip from "jszip";
import Notification from "../../components/Notification";
import MailService from "./MailingService";
import { VALIDATOR_URL } from "../../config";
import MuiAlert from "@material-ui/lab/Alert";

import {
  LooksOne,
  LooksTwo,
  Looks3,
  Looks4,
  Email,
  CloudDownloadOutlined,
} from "@material-ui/icons";
import FileSaver from "file-saver";

import Forge from "node-forge";

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
  generateApproval: {
    display: "flex",
    justifyContent: "flex-start",
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
      message: "Default",
      open: false,
      recieverEmail: "",
      downloadDirty: false,
      approval: {
        sig: "",
        hashedApproval: "",
        approvalRandomValue: "",
      },
    };
  }
  componentDidMount() {
    // console.log("result page props", this.props);
  }

  handleClose = () => {
    this.setState({
      open: false,
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
          age: { age, ageRandomValue, proofOfAgeRandomValue, proofOfAge },
        } = valueEntry;
        randomValueList.push({
          label: "Random Value Of Age",
          value: ageRandomValue,
        });
        randomValueList.push({
          label: "Random Value Of Proof Of Age",
          value: proofOfAgeRandomValue,
        });
        hashValueList.push({
          label: "Hash Value Of Age",
          value: SHA3(age.concat(ageRandomValue), {
            outputLength: 256,
          }).toString(),
        });
        hashValueList.push({
          label: "Hash Value Of Proof Of Age",
          value: SHA3(proofOfAge.concat(proofOfAgeRandomValue), {
            outputLength: 256,
          }).toString(),
        });
        break;
      case "degree":
        const {
          degree: {
            degree,
            proofOfDegree,
            degreeRandomValue,
            degreeDescription,
            degreeDescriptionRandomValue,
            proofOfDegreeRandomValue,
          },
        } = valueEntry;
        randomValueList.push({
          label: "Random Value Of DEGREE",
          value: degreeRandomValue,
        });
        randomValueList.push({
          label: "Random Value Of DEGREE DESCRIPTION",
          value: degreeDescriptionRandomValue,
        });
        randomValueList.push({
          label: "Random Value Of PROOF OF DEGREE",
          value: proofOfDegreeRandomValue,
        });
        hashValueList.push({
          label: "Hash Value Of DEGREE",
          value: SHA3(degree.concat(degreeRandomValue), {
            outputLength: 256,
          }).toString(),
        });
        hashValueList.push({
          label: "Hash Value Of DEGREE DESCRIPTION",
          value: SHA3(degreeDescription.concat(degreeDescriptionRandomValue), {
            outputLength: 256,
          }).toString(),
        });
        hashValueList.push({
          label: "Hash Value Of PROOF OF DEGREE",
          value: SHA3(proofOfDegree.concat(proofOfDegreeRandomValue), {
            outputLength: 256,
          }).toString(),
        });
        break;
      case "license":
        const {
          license: {
            license,
            proofOfLicense,
            licenseRandomValue,
            licenseDescription,
            licenseDescriptionRandomValue,
            licenseExpireDate,
            licenseExpireDateRandomValue,
            proofOfLicenseRandomValue,
          },
        } = valueEntry;
        randomValueList.push({
          label: "Random Value Of LICENSE",
          value: licenseRandomValue,
        });
        randomValueList.push({
          label: "Random Value Of LICENSE DESCRIPTION",
          value: licenseDescriptionRandomValue,
        });
        randomValueList.push({
          label: "Random Value Of LICENSE EXPIREDATE",
          value: licenseExpireDateRandomValue,
        });
        randomValueList.push({
          label: "Random Value Of PROOF OF LICENSE",
          value: proofOfLicenseRandomValue,
        });
        hashValueList.push({
          label: "Hash Value Of LICENSE",
          value: SHA3(license.concat(licenseRandomValue), {
            outputLength: 256,
          }).toString(),
        });
        hashValueList.push({
          label: "Hash Value Of LICENSE DESCRIPTION",
          value: SHA3(
            licenseDescription.concat(licenseDescriptionRandomValue),
            {
              outputLength: 256,
            }
          ).toString(),
        });
        hashValueList.push({
          label: "Hash Value Of LICENSE EXPIREDATE",
          value: SHA3(licenseExpireDate.concat(licenseExpireDateRandomValue), {
            outputLength: 256,
          }).toString(),
        });
        hashValueList.push({
          label: "Hash Value Of PROOF OF LICENSE",
          value: SHA3(proofOfLicense.concat(proofOfLicenseRandomValue), {
            outputLength: 256,
          }).toString(),
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

  generateApproval = async () => {
    this.handleApprove((approval) => {
      this.setState(
        {
          open: true,
          message: "Success, Approval has copied to clipboard automatically.",
        },
        () => {
          Utilities.copyStringToClipboard(approval);
        }
      );
    });
  };

  handleApprove = (callback) => {
    var that = this;
    if (this.state.approval.sig !== "") {
      callback(
        that.state.approval.hashedApproval,
        that.state.approval.sig,
        that.state.approval.approvalRandomValue
      );
      return;
    } else {
      const { valueEntry } = this.props;
      const { key, seedAndSign } = valueEntry;
      var { log } = this.props;
      var S = this.props.valueEntry[this.props.valueEntry.key][
        this.props.valueEntry.key
      ];
      if (this.props.valueEntry.key === "degree") {
        S = S.concat(
          this.props.valueEntry[this.props.valueEntry.key]["degreeDescription"]
        );
      } else if (this.props.valueEntry.key === "license") {
        S = S.concat(
          this.props.valueEntry[this.props.valueEntry.key]["licenseDescription"]
        ).concat(
          this.props.valueEntry[this.props.valueEntry.key]["licenseExpireDate"]
        );
      }
      const rv = Utilities.generateSeed();
      const message = rv // DC@20-04-27: The message now doesn't need to be hashed before signing
        .concat(valueEntry[valueEntry.key].clientAddress)
        .concat(S)
        .concat("approved");
      // const encryptedMessage = SHA3(originalMessage, {
      //   outputLength: 256
      // }).toString();
      // const encryptedMessageWithInfo = encryptedMessage // DC@20-04-21: No longer needed
      //   .concat(this.props.valueEntry)
      //   .concat("approved");
      const privateKey = seedAndSign.privateKey[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const keyInfo = Forge.pki.privateKeyFromPem(e.target.result);
        const md = Forge.md.sha256.create();
        md.update(message, "utf8"); // DC@20-04-21: changed to encryptedMessage, from encryptedMessageWithInfo
        const pss = Forge.pss.create({
          md: Forge.md.sha1.create(),
          mgf: Forge.mgf.mgf1.create(Forge.md.sha1.create()),
          saltLength: 20,
        });
        const signature = keyInfo.sign(md, pss);
        console.log(signature);
        const signatureHex = Forge.util.bytesToHex(signature); // I think it's the
        console.log(signatureHex);
        const d_t = Utilities.timeAndDate();
        log.push({
          date: d_t[0],
          time: d_t[1],
          clientAdd: valueEntry[valueEntry.key].clientAddress,
          message: S,
          randomVal: rv,
        });
        that.state.approval.hashedApproval = SHA3(
          signatureHex.toString().concat(rv),
          { outputLength: 256 }
        ).toString();
        that.state.approval.sig = signatureHex;
        that.state.approval.approvalRandomValue = rv;
        callback(
          SHA3(signatureHex.toString().concat(rv), {
            outputLength: 256,
          }).toString(),
          signatureHex.toString(),
          rv
        );
      };
      console.log(privateKey);
      reader.readAsBinaryString(privateKey);
    }
  };

  handleResultDownload = async () => {
    const { valueEntry } = this.props;
    const { key } = valueEntry;
    const resultEntities = this.props.valueEntry;
    const that = this;
    this.handleApprove((encryptedApproval, approve, rv) => {
      resultEntities.approve = approve;
      resultEntities.encryptedApproval = encryptedApproval;
      resultEntities.signatureRandomValue = rv;
      const valueString = JSON.stringify(resultEntities);
      let zip = new Zip();
      const folder = zip.folder("result");
      folder.file("result.txt", valueString);
      let file = null;
      switch (key) {
        case "age":
          file = that.props.valueEntry[key].proofOfAgeOriginalValue[0];
          break;
        case "degree":
          file = that.props.valueEntry[key].proofOfDegreeOriginalValue[0];
          break;
        case "license":
          file = that.props.valueEntry[key].proofOfLicenseOriginalValue[0];
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
      folder.file(file.name, file);
      let publicKey = valueEntry.seedAndSign.publicKey[0];
      folder.file("publicKey.txt", publicKey);
      folder.generateAsync({ type: "blob" }).then(function (content) {
        FileSaver.saveAs(
          content,
          `${key}_validation_result_${+new Date()}.zip`
        );
        that.setState({
          downloadDirty: true,
        });
      });
    });
  };

  handleRegister = () => {
    const search = this.computeHashValue();
    const { valueEntry } = this.props;
    this.handleApprove((approval) => {
      search["approval"] = approval;
      search["client"] = valueEntry[valueEntry.key].clientAddress;
      let url =
        VALIDATOR_URL +
        "?" +
        Object.entries(search)
          .map((i) => {
            return i.join("=");
          })
          .join("&");
      window.open(url, "_blank");
    });
  };

  computeHashValue = () => {
    const { valueEntry } = this.props;
    console.log(this.props);
    let searchParams = {};
    switch (valueEntry.key) {
      case "age":
        const {
          age: { age, ageRandomValue, proofOfAgeRandomValue, proofOfAge },
        } = valueEntry;
        searchParams = {
          type: 0,
          encryptedAge: SHA3(age.concat(ageRandomValue), {
            outputLength: 256,
          }).toString(),
          encryptedProofOfAge: SHA3(proofOfAge.concat(proofOfAgeRandomValue), {
            outputLength: 256,
          }).toString(),
        };
        break;
      case "degree":
        const {
          degree: {
            degree,
            proofOfDegree,
            degreeRandomValue,
            degreeDescription,
            degreeDescriptionRandomValue,
            proofOfDegreeRandomValue,
          },
        } = valueEntry;
        searchParams = {
          type: 1,
          encryptedDegree: SHA3(degree.concat(degreeRandomValue), {
            outputLength: 256,
          }).toString(),
          encryptedDescription: SHA3(
            degreeDescription.concat(degreeDescriptionRandomValue),
            {
              outputLength: 256,
            }
          ).toString(),
          encryptedProofOfDegree: SHA3(
            proofOfDegree.concat(proofOfDegreeRandomValue),
            {
              outputLength: 256,
            }
          ).toString(),
        };
        break;
      case "license":
        const {
          license: {
            license,
            proofOfLicense,
            licenseRandomValue,
            licenseDescription,
            licenseDescriptionRandomValue,
            licenseExpireDate,
            licenseExpireDateRandomValue,
            proofOfLicenseRandomValue,
          },
        } = valueEntry;
        searchParams = {
          type: 2,
          encryptedLicense: SHA3(license.concat(licenseRandomValue), {
            outputLength: 256,
          }).toString(),
          encryptedDate: SHA3(
            licenseExpireDate.concat(licenseExpireDateRandomValue),
            {
              outputLength: 256,
            }
          ).toString(),
          encryptedDescription: SHA3(
            licenseDescription.concat(licenseDescriptionRandomValue),
            {
              outputLength: 256,
            }
          ).toString(),
          encryptedProofOfLicense: SHA3(
            proofOfLicense.concat(proofOfLicenseRandomValue),
            {
              outputLength: 256,
            }
          ).toString(),
        };

        break;
      default:
        break;
    }

    return searchParams;
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  renderApprovalResultList = (live) => {
    if (live) {
      console.log("boop");
      const { valueEntry } = this.props;
      const { clientAddress } = valueEntry[valueEntry.key];
      let approvalList = [];
      approvalList.push({
        label: "Signed Approval",
        value: Utilities.lineWrap(this.state.approval.sig, 32),
      });
      approvalList.push({
        label: "Hashed Signature",
        value: Utilities.lineWrap(this.state.approval.hashedApproval, 32),
      });
      approvalList.push({
        label: "Random Value of Signature",
        value: this.state.approval.approvalRandomValue,
      });
      return approvalList;
    } else {
      return [];
    }
  };

  handleLogDownload = () => {
    const { log } = this.props;
    const logString = JSON.stringify(log);
    FileSaver.saveAs(
      new Blob([logString], { type: "text/plain;charset=utf-8" }),
      "encryption_log.txt"
    );
  };

  render() {
    const { classes, theme, valueEntry, live } = this.props;
    const { message, open, senderEmail, recieverEmail } = this.state;
    var { log } = this.props;
    // DC@20-04-21: removed const seed = valueEntry && valueEntry.seedAndSign && valueEntry.seedAndSign.seed;
    const validatorAddress =
      valueEntry &&
      valueEntry.seedAndSign &&
      valueEntry.seedAndSign.validatorAddress;
    const clientAddress =
      valueEntry && valueEntry.key && valueEntry[valueEntry.key].clientAddress;
    // DC@20-04-21: Edit: "VALUE OF ENCRYPTION KEY AND CLIENT ADDRESS." > "VALUE OF CLIENT ADDRESS."
    // DC@20-04-21: Below that, removed:
    //  <Grid container className={classes.row}>
    //    <Descriptionitem label="ENCRYPTION KEY" content={seed} />
    //  </Grid> // DC@20-04-21: Container now just contains grid item for client address
    console.log("object", this.state.approval);
    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <div className={classes.actions}>
              <Alert severity="info">
                NOTE: Please click DOWNLOAD RESULT button first, and register
                your information after you downloaded the result.
              </Alert>

              {/* <StepButton
                variant="contained"
                color="primary"
                style={{
                  marginBottom: theme.spacing(4),
                  marginLeft: theme.spacing(2),
                }}
                onClick={this.handleLogDownload}
              >
                Download Log, {log.length} items encrypted
              </StepButton> */}
            </div>

            <ExpansionPanel elevation={0}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="body2">VALIDATION DETAIL</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography variant="caption" className={classes.instruction}>
                  <LooksOne color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    VALUE OF CLIENT AND VALIDATOR's ADDRESS.
                  </Typography>
                </Typography>

                <Container>
                  <Grid container className={classes.row}>
                    <Descriptionitem
                      label="VALIDATOR ADDRESS"
                      content={validatorAddress}
                    />
                  </Grid>
                  <Grid container className={classes.row}>
                    <Descriptionitem
                      label="CLIENT ADDRESS"
                      content={clientAddress}
                    />
                  </Grid>
                </Container>

                <Divider variant="middle" className={classes.divider} />

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
                    VALIDATION OF ENCRYPTION ATTRIBUTE.
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
                        (item) => {
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

                <Divider variant="middle" className={classes.divider} />

                <Typography variant="caption" className={classes.instruction}>
                  <Looks4 color="primary" />
                  <Typography variant="caption" style={{ marginLeft: "8px" }}>
                    SIGNED APPROVAL.
                  </Typography>
                </Typography>

                <Container>
                  {this.state.approval !== ""
                    ? this.renderApprovalResultList(live).map((item) => {
                        var fileArr = [""];
                        if ("value" in item) {
                          if (typeof item.value === "object") {
                            console.log(typeof item.value);
                            console.log(item.value);
                            fileArr = item.value;
                          }
                        }
                        return item.file ? (
                          <Grid
                            container
                            className={classes.row}
                            key={item.publicKey}
                          >
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
                                  label={fileArr[0].name}
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
                          <Grid
                            container
                            className={classes.row}
                            key={item.value}
                          >
                            <Descriptionitem
                              label={item.label}
                              content={item.value}
                            />
                          </Grid>
                        );
                      })
                    : ""}
                  <div className={classes.generateApproval}>
                    <StepButton
                      variant="contained"
                      color="primary"
                      style={{
                        marginBottom: theme.spacing(2),
                        marginTop: theme.spacing(2),
                      }}
                      onClick={this.generateApproval}
                    >
                      Show Encrypted Approval
                    </StepButton>
                  </div>
                </Container>
              </ExpansionPanelDetails>
            </ExpansionPanel>

            <Divider variant="middle" className={classes.divider} />

            <Typography variant="caption" className={classes.instruction}>
              <Email color="primary" />
              <Typography variant="caption" style={{ marginLeft: "8px" }}>
                SEND RESULT TO SERVICE USER BY EMAIL. (OPTIONAL)
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
                    `mailto:${recieverEmail}?subject=[BlockchainStudio] Validation Result`,
                    "Mail"
                  );
                  e.preventDefault();
                }}
                href={`mailto:${recieverEmail}?subject=[BlockchainStudio] Validation Result`}
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

        <Notification
          onClose={this.handleClose}
          open={open}
          message={message}
          type="success"
        />
      </React.Fragment>
    );
  }
}

export default withTheme(ResultPageWrapper);
