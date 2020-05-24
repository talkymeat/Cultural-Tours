import React, { useState, useEffect } from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
// core components
import Header from "components/Header/Header.js";
import Footer from "components/Footer/Footer.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import HeaderLinks from "components/Header/HeaderLinks.js";
import Parallax from "components/Parallax/Parallax.js";

import profile from "assets/img/faces/admin.jpg";

import styles from "assets/jss/material-kit-react/views/profilePage.js";
import Tabs from "./Sections/Navigations";
import { USER_TYPE, UserType } from "utils/enum";
import AdminPortfolio from "./AdminUser";
import ClientPortfolio from "./ClientUser";
import ValidatorPortfolio from "./ValidatorUser";
import ServicePortfolio from "./ServiceUser";

import adminBg from "assets/img/admin.png";
import clientBg from "assets/img/client.png";
import validatorBg from "assets/img/validator.png";
import serviceBg from "assets/img/service.png";
import { globalAction } from "redux/actions/global_state";

const useStyles = makeStyles(styles);

const backgroundImage = {
  [USER_TYPE.ADMIN]: adminBg,
  [USER_TYPE.CLIENT]: clientBg,
  [USER_TYPE.VALIDATOR]: validatorBg,
  [USER_TYPE.SERVICE_USER]: serviceBg,
};

function ProfilePage(props) {
  const classes = useStyles();
  const [address, setAddress] = useState("");
  const {
    match: {
      params: { role },
    },
  } = props;
  const { ...rest } = props;
  const imageClasses = classNames(
    classes.imgRaised,
    classes.imgRoundedCircle,
    classes.imgFluid
  );

  useEffect(() => {
    props.dispatch(globalAction.TOOGLE_BACKDROP);
    setTimeout(() => {
      props.dispatch(globalAction.TOOGLE_BACKDROP);
    }, 2000);
    setTimeout(() => {
      setAddress(window.account);
    }, 100);
  }, []);

  console.log(props.global);
  let RoleComponent = <div>span</div>;
  switch (+role) {
    case USER_TYPE.ADMIN:
      RoleComponent = <AdminPortfolio />;
      break;
    case USER_TYPE.VALIDATOR:
      RoleComponent = <ValidatorPortfolio {...props} />;
      break;
    case USER_TYPE.CLIENT:
      RoleComponent = <ClientPortfolio {...props} />;
      break;
    case USER_TYPE.SERVICE_USER:
      RoleComponent = <ServicePortfolio {...props} />;
      break;
    default:
      break;
  }

  return (
    <div>
      <Header
        color="transparent"
        brand="Blockchain Lab"
        rightLinks={<HeaderLinks />}
        fixed
        changeColorOnScroll={{
          height: 200,
          color: "white",
        }}
        {...rest}
      />
      <Parallax small filter image={backgroundImage[+role]} />
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div>
          <div className={classes.container}>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={6}>
                <div className={classes.profile}>
                  <div>
                    <img src={profile} alt="..." className={imageClasses} />
                  </div>
                  <div className={classes.name}>
                    <h3 className={classes.title}>{UserType(+role)}</h3>
                  </div>
                </div>
              </GridItem>
            </GridContainer>
            <div className={classes.description}>
              <p>Adress: {address} </p>
            </div>
            {RoleComponent}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const mapStateToProps = (state) => ({
  global: state.global,
});
export default connect(mapStateToProps)(ProfilePage);
