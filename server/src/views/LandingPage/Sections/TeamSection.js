import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons

// core components
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

import styles from "assets/jss/material-kit-react/views/landingPageSections/teamStyle.js";

import team1 from "assets/img/faces/t1.jpg";
import team2 from "assets/img/faces/t2.jpg";
import team3 from "assets/img/faces/t3.jpg";
import team4 from "assets/img/faces/t4.jpg";
import team5 from "assets/img/faces/t5.jpg";

const useStyles = makeStyles(styles);

export default function TeamSection() {
  const classes = useStyles();
  const imageClasses = classNames(
    classes.imgRaised,
    classes.imgRoundedCircle,
    classes.imgFluid
  );
  return (
    <div className={classes.section} id="about">
      <h2 className={classes.title}>Here is our team</h2>
      <div>
        <GridContainer justify="center">
          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img src={team1} alt="..." className={imageClasses} />
              </GridItem>
              <h4 className={classes.cardTitle}>
                Professor Aggelos Kiayias
                <br />
                <small className={classes.smallTitle}>
                  Director of the Blockchain Lab
                </small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  <a
                    href="https://www.kiayias.com/Aggelos_Kiayias/Home_of_Aggelos_Kiayias.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view profile
                  </a>
                </p>
              </CardBody>
              {/* <CardFooter className={classes.justifyCenter}>
                <Button
                  justIcon
                  color="transparent"
                  className={classes.margin5}
                >
                  <i className={classes.socials + " fab fa-twitter"} />
                </Button>
                <Button
                  justIcon
                  color="transparent"
                  className={classes.margin5}
                >
                  <i className={classes.socials + " fab fa-instagram"} />
                </Button>
                <Button
                  justIcon
                  color="transparent"
                  className={classes.margin5}
                >
                  <i className={classes.socials + " fab fa-facebook"} />
                </Button>
              </CardFooter> */}
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img src={team2} alt="..." className={imageClasses} />
              </GridItem>
              <h4 className={classes.cardTitle}>
                Dr. Aydin Abadi
                <br />
                <small className={classes.smallTitle}>Research Associate</small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  <a
                    href="https://www.research.ed.ac.uk/portal/en/persons/aydin-kheirbakhsh-abadi(77aa9e59-2429-41d9-a3e7-f936298f61a6).html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view profile
                  </a>
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img
                  src={team3}
                  alt="..."
                  className={imageClasses}
                  style={{ width: "100%" }}
                />
              </GridItem>
              <h4 className={classes.cardTitle}>
                Lamprini Georgiou
                <br />
                <small className={classes.smallTitle}>PhD student</small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  <a
                    href="https://www.ed.ac.uk/profile/lamprini-georgiou"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view profile
                  </a>
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img src={team5} alt="..." className={imageClasses} />
              </GridItem>
              <h4 className={classes.cardTitle}>
                Jin Xiao
                <br />
                <small className={classes.smallTitle}>Software developer</small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  <a
                    href="https://jxiao17.myportfolio.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view profile
                  </a>
                </p>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img src={team4} alt="..." className={imageClasses} />
              </GridItem>
              <h4 className={classes.cardTitle}>
                Dave Cochran
                <br />
                <small className={classes.smallTitle}>
                  Software developer & teaching assistant
                </small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  <a
                    href="https://uk.linkedin.com/in/davecochran"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view profile
                  </a>
                </p>
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
