import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons
import Chat from "@material-ui/icons/Chat";
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import Fingerprint from "@material-ui/icons/Fingerprint";
// core components
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import InfoArea from "components/InfoArea/InfoArea.js";

import styles from "assets/jss/material-kit-react/views/landingPageSections/productStyle.js";

const useStyles = makeStyles(styles);

export default function ProductSection() {
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={12}>
          <h2 className={classes.title}>About PIMS</h2>
          <h5 className={`${classes.description} ${classes.about}`}>
            Identity is a collection of individual properties (or features) that
            define an entity and determine the transactions in which that entity
            can participate. These properties can in- clude name, date of birth,
            national insurance number, as well as an individual’s skills,
            qualifications, activities, reputation, history, and the result of
            some background bank- ing checks, such as Know You Client (KYC) or
            Anti-Money Laundering (AML) checks. Identity management is central
            to a wide range of organisations such as industries, banks,
            financial institutions. Reliance on physical identity processes
            (based on a physi- cal record and hard copy of documents) is
            inefficient, error-prone, and not transparent. Digital identity,
            however, can address the aforementioned challenges and can offer ad-
            vanced functionality and security. <br />
            <br />
            In general, digital identity systems can be categorised into two
            classes: centralised and decentralised. The centralised system is
            suitable for certain purposes e.g. when sensitive data is involved,
            but it is less flexible, introduces single-point failure, suscep-
            tible to vendor lock-in and is less transparent. Blockchain
            technology due to its appealing features, e.g. transparency,
            immutability, support of decentralised creation of unique digital
            identities, is a suitable framework to support decentralised digital
            identity management system. However, performing verifications on ID
            holders’ properties, e.g. KYC verifica- tions, imposes a high cost
            to organisations. Recent studies suggest that the costs of KYC are
            increasing, and have a negative impact on their profit; More
            specifically, financial institutions’ average costs, concerning KYC,
            are 60 million and some of them spend up to 500 million on
            compliance with KYC (and Customer Due Diligence). <br />
            <br />
            In this project, we have designed and implemented a decentralised
            digital identity system that allows (a) anyone to create a digital
            ID, without relying on a third party (b) validators to verify ID
            holders attributes in a privacy-preserving manner, and (c)
            validators, e.g. organisations or financial institutions, to
            minimise the cost imposed by the process of verifying individuals’
            properties. The system utilises blockchain technology, smart
            contracts and cryptographic tools. It consists of a set of
            validators, a set of ID holders, and a set of parties interested in
            the result of verification performed by each validator for each
            identity holder. The role of each validator is to approve a
            collection of attributes provided by an identity holder.
            <br />
          </h5>
        </GridItem>
      </GridContainer>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={6}>
            <InfoArea
              title="Technology Behind PIMS"
              description="Blockchain, smart contract, wallet software, commitment scheme, digital signature scheme, and more cryptographic primitives."
              icon={Chat}
              iconColor="info"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={6}>
            <InfoArea
              title="Application Areas"
              description="Financial sectors and voluntary organizations"
              icon={VerifiedUser}
              iconColor="success"
              vertical
            />
          </GridItem>
          {/* <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="Fingerprint"
              description="Divide details about your product or agency work into parts. Write a few lines about each one. A paragraph describing a feature will be enough."
              icon={Fingerprint}
              iconColor="danger"
              vertical
            />
          </GridItem> */}
        </GridContainer>
      </div>
    </div>
  );
}
