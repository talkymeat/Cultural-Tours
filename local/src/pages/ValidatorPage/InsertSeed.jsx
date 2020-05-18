/**
 * Author: JIN XIAO
 * Email: xiaojin971212@gmail.com
 */
import React, { Component } from "react";
import { styled, makeStyles, withTheme } from "@material-ui/core/styles";
import CssBaseLine from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Alert from "../../components/Alert";
import Divider from "@material-ui/core/Divider";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Forge from "node-forge";
import FileSaver from "file-saver";
import Notification from "../../components/Notification";
import Upload from "../../components/Upload";
import * as Utilities from "../../utilities";
import Zip from "jszip";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  seedInput: {
    width: "400px",
    marginRight: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(8),
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
  form: {
    width: "100%",
    marginBottom: theme.spacing(8),
  },
  fieldRow: {
    marginBottom: theme.spacing(4),
  },
  formControl: {
    width: "80%",
    marginBottom: theme.spacing(4),
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

function InsertSeedPageWrapper(props) {
  const classes = useStyles();
  return <InsertSeedPage classes={classes} {...props} />;
}

class InsertSeedPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // DC@20-04-21: removed seed
      generateDialogStatus: false,
      isHaveKey: "1",
      clientAddress: "",
      privateKey: [],
      message: "Please fill all the information.",
      open: false,
    };
  }
  // componentDidMount() {
  //   console.log(this.props);
  // }

  handleChange = (e) => {
    this.setState(
      {
        [e.target.name]: e.target.value,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  handleGenerateSeed = () => {
    let emptyArray = new Uint32Array(2);
    window.crypto.getRandomValues(emptyArray);
    let fisrtPart = emptyArray[0].toString(16);
    let secondPart = emptyArray[1].toString(16);
    return fisrtPart.concat(secondPart);
  };

  handleGenerateDialogClose = () => {
    this.setState({
      generateDialogStatus: false,
    });
  };

  // DC@20-04-21: Removed handleSeedGenerate

  handleFileUpload = (key, files) => {
    console.log(files);
    this.setState({
      [key]: files,
    });
  };

  generateKeypair = () => {
    const RSA = Forge.pki.rsa;
    RSA.generateKeyPair({ bits: 2048, workers: 2 }, (err, keypair) => {
      //convert the public key to a readable key in PEM format
      const pub_pem = Forge.pki.publicKeyToPem(keypair.publicKey);
      const publicKey = pub_pem;
      // convert the private key to PEM format
      const prv_pem = Forge.pki.privateKeyToPem(keypair.privateKey);
      const privateKey = prv_pem;
      let zip = new Zip();
      const folder = zip.folder("key_pair");
      folder.file(
        "public_key.txt",
        new Blob([publicKey], {
          type: "text/plain;charset=utf-8",
        })
      );
      folder.file(
        "private_key.txt",
        new Blob([privateKey], {
          type: "text/plain;charset=utf-8",
        })
      );
      const that = this;
      folder.generateAsync({ type: "blob" }).then(function (content) {
        FileSaver.saveAs(content, `key_pair.zip`);
        that.setState({
          isHaveKey: "1",
        });
      });
      // FileSaver.saveAs(new Blob([publicKey],{
      //   type: "text/plain;charset=utf-8"
      // }), "public_key.txt");
      // FileSaver.saveAs(new Blob([privateKey],{
      //   type: "text/plain;charset=utf-8"
      // }), "private_key.txt");
    });
  };

  handleSubmit = () => {
    const { privateKey, clientAddress } = this.state; // DC@20-04-21: removed seed
    const { handleNext, updateValueEntry } = this.props;
    const check = this.validationCheck();
    if (!check.result) {
      this.setState({
        open: true,
        message: check.message,
      });
      return;
    } else {
      handleNext();
      updateValueEntry("seedAndSign", { privateKey, clientAddress }); // DC@20-04-21: removed seed
    }
  };

  validationCheck = () => {
    const { privateKey, clientAddress } = this.state; // DC@20-04-21: removed seed
    if (!privateKey || !clientAddress) {
      // DC@20-04-21: removed seed
      return {
        result: false,
        message: "Please fill all the fields before next step.",
      };
    }
    if (!Utilities.isAddress(clientAddress)) {
      return {
        result: false,
        message: "Please input the correct format of client address.",
      };
    }
    return { result: true };
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { classes, theme } = this.props;
    const {
      generateDialogStatus,
      isHaveKey,
      clientAddress,
      message,
      open,
      privateKey,
    } = this.state; // DC@20-04-21: removed seed
    // DC@20-04-21: changed 'INSERT or GENERATE ENCRYPTION KEY FOR VALIDATION' to 'RSA KEY'
    // DC@20-04-21: Removed box for inserting/generating Encryption Key - I've pasted it in, commented out, at the bottom of the file
    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <Typography variant="h5" className={classes.title}>
              INSERT or GENERATE RSA KEY FOR VALIDATION
            </Typography>
            <form noValidate className={classes.form}>
              <Box className={classes.fieldRow}>
                <FormLabel component="legend">
                  Do you have RSA signing key?
                </FormLabel>
                <RadioGroup
                  aria-label="isHaveKey"
                  name="isHaveKey"
                  value={isHaveKey}
                  onChange={this.handleChange}
                  row
                >
                  <FormControlLabel
                    value={"1"}
                    control={<Radio color="primary" size="small" />}
                    label="YES"
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value={"0"}
                    control={<Radio color="primary" size="small" />}
                    label="NO"
                    labelPlacement="end"
                  />
                </RadioGroup>
              </Box>

              <FormControl className={classes.formControl}>
                {isHaveKey === "1" ? (
                  <React.Fragment>
                    <FormLabel
                      component="legend"
                      style={{
                        marginBottom: theme.spacing(2),
                      }}
                    >
                      Private Key
                    </FormLabel>

                    <Upload
                      handleFileUpload={(files) => {
                        this.handleFileUpload(
                          "privateKey",
                          files.map((file) => file.file)
                        );
                      }}
                      files={privateKey}
                    />
                  </React.Fragment>
                ) : (
                  <StepButton
                    variant="contained"
                    color="primary"
                    onClick={this.generateKeypair}
                  >
                    Generate RAS Key pair
                  </StepButton>
                )}
              </FormControl>

              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="client-address">Client Address</InputLabel>
                <Input
                  size="42"
                  value={clientAddress}
                  onChange={this.handleChange}
                  inputProps={{
                    name: "clientAddress",
                    id: "client-address",
                    placeholder: "Pleace Input Client Address",
                  }}
                />
              </FormControl>
            </form>

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
          <Notification
            onClose={this.handleClose}
            open={open}
            message={message}
          />
        </Container>
      </React.Fragment>
    ); // DC@20-04-21: Typo corrected "Success! The encryption key copied to your clipboard automaticlly."
  }
}

export default withTheme(InsertSeedPageWrapper);

// DC@20-04-21: Code removed, stored here in case it's needed again:

// <Box className={classes.fieldRow}>
//   <TextField
//     className={classes.seedInput}
//     id="validator-seed"
//     name="seed"
//     value={seed}
//     onChange={this.handleChange}
//     placeholder="Please input or generate the encryption key for encryption."
//     autoComplete="off"
//     label="Encryption Key"
//   />
//   <Button
//     variant="contained"
//     color="secondary"
//     onClick={this.handleSeedGenerate}
//     style={{
//       color: "#fff"
//     }}
//   >
//     GENERATE ENCRYPTION KEY
//   </Button>
// </Box>

// <Alert
//   open={generateDialogStatus}
//   handleClose={this.handleGenerateDialogClose}
//   title="Seed Generation"
//   description="Success! The encryption key copied to your clipboard automaticlly."
// />

// handleSeedGenerate = () => {// TODO: remove
//   this.setState(
//     {
//       seed: this.handleGenerateSeed(),
//       generateDialogStatus: true
//     },
//     () => {
//       Utilities.copyStringToClipboard(this.state.seed);
//     }
//   );
// };
