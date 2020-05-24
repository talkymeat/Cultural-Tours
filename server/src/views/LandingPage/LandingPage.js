import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons

// core components
import Header from "components/Header/Header.js";
import Footer from "components/Footer/Footer.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import HeaderLinks from "components/Header/HeaderLinks.js";
import Parallax from "components/Parallax/Parallax.js";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import { FormControl } from "@material-ui/core";
import { connect } from "react-redux";
import Typist from "react-typist";

import styles from "assets/jss/material-kit-react/views/landingPage.js";

// Sections for this page
import ProductSection from "./Sections/ProductSection.js";
import TeamSection from "./Sections/TeamSection.js";
import WorkSection from "./Sections/WorkSection.js";
import UserSection from "./Sections/UserListSection";

import { USER_TYPE } from "utils/enum";

const dashboardRoutes = [];

const useStyles = makeStyles(styles);

function LandingPage(props) {
  const classes = useStyles();
  const [role, setRole] = useState(" ");
  const { ...rest } = props;
  function handleRoleChange(v) {
    setRole(v.target.value);
  }
  return (
    <div>
      <Header
        color="transparent"
        routes={dashboardRoutes}
        brand="Blockchain Lab"
        rightLinks={<HeaderLinks />}
        fixed
        changeColorOnScroll={{
          height: 400,
          color: "white",
        }}
        {...rest}
      />
      <Parallax filter image={require("assets/img/home.png")}>
        <div className={classes.container}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <h1 className={classes.title}>
                <Typist
                  cursor={{
                    hideWhenDone: true,
                    hideWhenDoneDelay: 0,
                  }}
                >
                  Privacy-preserving <br />
                  Identity Management System
                </Typist>
              </h1>
              <h4>
                <Typist
                  cursor={{
                    hideWhenDone: true,
                  }}
                >
                  A Secure Blockchain-based Solution to Financial Institutions
                  and Voluntary Organisations
                </Typist>
              </h4>
              <br />
              <GridContainer alignItems="center">
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel id="role">Role</InputLabel>
                  <Select
                    labelId="role"
                    id="role-select"
                    displayEmpty
                    value={role}
                    onChange={handleRoleChange}
                  >
                    <MenuItem value=" " disabled>
                      Place Select Your Role
                    </MenuItem>
                    <MenuItem value={USER_TYPE.ADMIN}>Admin</MenuItem>
                    <MenuItem value={USER_TYPE.VALIDATOR}>Validator</MenuItem>
                    <MenuItem value={USER_TYPE.CLIENT}>Client</MenuItem>
                    <MenuItem value={USER_TYPE.SERVICE_USER}>
                      Service User
                    </MenuItem>
                  </Select>
                </FormControl>
                <Link to={"/user/" + role}>
                  <Button
                    color="danger"
                    size="lg"
                    rel="noopener noreferrer"
                    disabled={!role.toString().trim()}
                  >
                    <i
                      className="fas fa-play"
                      style={{ marginRight: "12px" }}
                    />
                    Get Start
                  </Button>
                </Link>
              </GridContainer>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>
          <ProductSection />
          <GridContainer style={{ marginTop: "0" }}>
            <GridItem xs={12} lg={12}>
              <img
                style={{ width: "100%" }}
                src={require("../../assets/img/index.jpg")}
              />
            </GridItem>
          </GridContainer>
          <UserSection />
          <TeamSection />
          {/* <WorkSection /> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const mapStateToProps = (state) => ({
  userlist: state.userlist,
});

export default connect(mapStateToProps)(LandingPage);
