import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  label: {
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
  },
  content: {
    wordBreak: "break-word",
  },
}));

export default function DescriptionItem(props) {
  const classes = useStyles();
  const { label, content, full } = props;
  const labelWidth = full ? 12 : 4;
  const contentWidth = full ? 12 : 8;
  return (
    <Grid container alignItems="center">
      <Grid
        container
        item
        xs={labelWidth}
        className={`${classes.label} ${full ? classes.marginBottom : ""}`}
      >
        {label}:
      </Grid>
      <Grid container item xs={contentWidth} className={classes.content}>
        {content}
      </Grid>
    </Grid>
  );
}
