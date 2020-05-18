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
      publicKey: [],
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

  loadFileAsPubText = (files) => {
    var fileReader = new FileReader();
    var st = this.state;
    fileReader.onload = function (fileLoadedEvent) {
      console.log("It loaded without error");
      Object.assign(st, {
        publicKey: fileLoadedEvent.target.result,
        publicKeyFile: files,
      });
    };
    console.log(files[0], "  ");
    fileReader.readAsText(files[0], "UTF-8");
  };

  handleSubmit = () => {
    const { publicKey, publicKeyFile, clientAddress } = this.state; // DC@20-04-21: removed seed
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
      updateValueEntry("seedAndSign", {
        publicKey,
        publicKeyFile,
        clientAddress,
        approval: "",
      }); // DC@20-04-21: removed seed
    }
  };

  validationCheck = () => {
    const { publicKey, clientAddress } = this.state; // DC@20-04-21: removed seed
    if (!publicKey || !clientAddress) {
      // DC@20-04-21: removed seed
      return {
        result: false,
        message: "Please fill all the fields before next step.",
      };
    }
    if (!Utilities.isAddress(clientAddress)) {
      return {
        result: false,
        message:
          'Please input the client address in the correct format; "Ox" followed by 40 hexidecimal digits.',
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
      publicKey,
    } = this.state; // DC@20-04-21: removed seed
    // DC@20-04-21: changed 'INSERT or GENERATE ENCRYPTION KEY FOR VALIDATION' to 'RSA KEY'
    // DC@20-04-21: Removed box for inserting/generating Encryption Key - I've pasted it in, commented out, at the bottom of the file
    return (
      <React.Fragment>
        <CssBaseLine />
        <Container fixed className={classes.root}>
          <Box className={classes.container}>
            <Typography variant="h5" className={classes.title}>
              INSERT RSA PUBLIC KEY
            </Typography>
            <form noValidate className={classes.form}>
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

                  <Upload
                    handleFileUpload={(files) => {
                      this.handleFileUpload(
                        "publicKey",
                        files.map((file) => file.file)
                      );
                    }}
                    files={publicKey}
                  />
                </React.Fragment>
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

// handleGenerateSeed = () => {
//   let emptyArray = new Uint32Array(2);
//   window.crypto.getRandomValues(emptyArray);
//   let fisrtPart = emptyArray[0].toString(16);
//   let secondPart = emptyArray[1].toString(16);
//   return fisrtPart.concat(secondPart);
// };

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
