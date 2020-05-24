import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons
import Dashboard from "@material-ui/icons/AccountCircle";
import Schedule from "@material-ui/icons/VerifiedUser";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import GetApp from "@material-ui/icons/GetApp";

// import List from "@material-ui/icons/List";

// core components
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import NavPills from "components/NavPills/NavPills.js";
import Badge from "components/Badge/Badge.js";
import Table from "./Table";

import styles from "assets/jss/material-kit-react/views/componentsSections/pillsStyle.js";
import Button from "@material-ui/core/Button";
import LocalImg from "assets/img/demo.png";
import { connect } from "react-redux";

const useStyles = makeStyles(styles);
const Item = GridItem;
const Container = GridContainer;

function SectionPills(props) {
  const data = props.userlist;
  const classes = useStyles();
  const Download = function DownloadComponent() {
    return (
      <Container
        lg={12}
        justify="center"
        flexDirection="column"
        alignItems="center"
        className={classes.downloadPannel}
      >
        {/* <Item md="12" lg="12">
          <img src={LocalImg} alt="" className={classes.localImg} />
        </Item> */}
        <Item md="12" lg="6">
          <a href={require("assets/encryption_tool.zip")} download>
            <Button
              color="primary"
              className={classes.localButton}
              size="large"
              variant="outlined"
            >
              Get Local encryption tools for FREE
            </Button>
          </a>
        </Item>
      </Container>
    );
  };
  const dataForTable = []
    .concat(
      data["client"].map((item) => {
        return { address: item, type: 0 };
      })
    )
    .concat(
      data["validator"].map((item) => {
        return { address: item, type: 1 };
      })
    );
  return (
    <div className={classes.section}>
      <Download />
      <div className={classes.container}>
        <div id="navigation-pills">
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={8}>
              {/* <h2 className={classes.title}>User List</h2> */}
              <h5 className={classes.description}>
                This is the paragraph where you can write more details about
                your product. Keep you user engaged by providing meaningful
                information. Remember that by this time, the user is curious,
                otherwise he wouldn
                {"'"}t scroll to get here. Add a button if you want the user to
                see more.
              </h5>
            </GridItem>
          </GridContainer>

          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <Table data={dataForTable} />
              {/* <NavPills
                color="rose"
                horizontal={{
                  tabsGrid: { xs: 12, sm: 4, md: 4 },
                  contentGrid: { xs: 12, sm: 8, md: 8 },
                }}
                tabs={[
                  {
                    tabButton: "Download Tool",
                    tabIcon: GetApp,
                    tabContent: <Download />,
                  },
                  {
                    tabButton: "Client",
                    tabIcon: Dashboard,
                    tabContent: <Table data={data["client"]}/>,
                  },
                  {
                    tabButton: "Validator",
                    tabIcon: Schedule,
                    tabContent: <Table data={data["validator"]}/>,
                  },
                  {
                    tabButton: "Service User",
                    tabIcon: SupervisorAccountIcon,
                    tabContent: <Table data={data["service"]}/>,
                  },
                ]}
              /> */}
            </GridItem>
          </GridContainer>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  userlist: state.userlist,
});

export default connect(mapStateToProps)(SectionPills);
