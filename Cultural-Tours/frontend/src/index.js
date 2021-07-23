// This is file is the starting point from which the Edinburgh Flâneur page is
// generated

import React, { Component } from 'react';
// nodejs library that concatenates classes
import classNames from "classnames";

import { render } from 'react-dom';
// import './index.css';
import bkgd from './assets/bkgd.png'
import App from './App';
import * as serviceWorker from './serviceWorker';
//import HeaderLinks from './components/Header/HeaderLinks.js'

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Menu from '@material-ui/core/Menu';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel'
import SearchIcon from '@material-ui/icons/Search';


// icons
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

// I am not certain this is actually used
import "./culturalspacemainwebpage/culturalspacemainwebpage.css";

// Defines the primary and secondary colours for the site's visual identity
import theme from './theme';

const apiDomain = 'http://127.0.0.1:8000/' // <<- Change this when the page is live online

// Colour scheme:
const ef_gold = "#FAB85E"
const ef_cream = "#F3EFD9"
const ef_teal = "#107269"
const ef_sienna = "#C2583E"
const ef_umber = "#55412F"

// generates styles for page elements, using colours etc from theme
const useStyles = makeStyles((style) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontSize: "50px",
    fontWeight: 500,
    color: ef_cream
  },
  text: {
    color: ef_umber
  },
  topButton: {
    flexGrow: 1,
    fontSize: "30px",
    fontWeight: 500,
    color: ef_cream
  },
  bar: {
    backgroundColor: ef_teal
  },
  bigDot: {
    fontSize: "100px",
    color: ef_gold
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left',
    //color: "transparent",
  },
  button: {
    backgroundColor: ef_sienna,
    fontSize: "24px",
    fontWeight: 500,
    size: "large",
    color: ef_cream,
    '&:hover': {
      backgroundColor: ef_teal
    }
  },
  cardTitle: {
    textAlign: "center",
  },
  centred: {
    margin: "auto",
  },
  formControl: {
    margin: theme.spacing(1),
    width: "100%",
    backgroundColor: ef_sienna,
    color: ef_cream
  },
  selectEmpty: {
    marginTop: theme.spacing(4),
  },
  waypoint: {
    backgroundColor: ef_cream
  },
  site: {
    backgroundColor: "#dddddd"
  },
  searchbox: {
    backgroundColor: ef_cream
  },
}));

function FrontpageWrapper(props) {
  const classes = useStyles();
  return <Frontpage classes={classes} {...props} />;
}

// The main react component for the page
class Frontpage extends Component {
  // The user proceeds through multiple steps specifying the information they
  // want for their tour.
  // currentStep:       tracks which step the user is on, and
  // handleNext:        makes the changes necessary at each transition from
  //                    step to step
  // type:              "B" for bus, "C" for cycle
  // route:             Object describing the route returned by the backend API,
  //                    including details of cultural sites selected
  // routes:            Array of names of available routes
  constructor(props) {
      super(props);
      this.state = {
        currentStep: 0,
        handleNext: this.handleNext,
        compileTourURL: this.compileTourURL,
        type: "",
        route: {},
        routes: [],
        categories: []
      };
  }

  handleNext = (step, newState) => {
    newState.currentStep = step;
    this.setState(newState);
    if (this.state.currentStep===6 && step===6) {
      console.log('yabadabadaba');
      this.getTour();
    }
  }


  compileTourURL = () => {
    console.log("Compiling Tour URL");
    const { categories, searches } = this.state;
    var tourURL =
      apiDomain + 'api/v1/tour/' + this.state.route.id + '/' +
        '?max_dist=' + this.state.distance +
        '&first_stop=' + this.state.start.id +
        '&last_stop=' + this.state.end.id;
    for (var i = 0; i < searches.length; i++){
      tourURL += '&search=' + encodeURIComponent(searches[i])
    }
    for (var j = 0; j < categories.length; j++) {
      if (categories[j].selected) {
        console.log(categories[j]);
        var cat = encodeURIComponent(categories[j].name.toLowerCase());
        tourURL += '&category=' + cat;
        var allSelected = categories[j].subcategories.reduce((a, b) => {
          console.log(a, typeof a);
          console.log(b);
          console.log(categories[j].subcategories);
          return (typeof a==='boolean'?a:a.selected) && b.selected;
        });
        console.log(categories[j].subcategories, allSelected);
        if (!allSelected) {
          var subcat_str = '&subcat_' + cat + '=';
          console.log(subcat_str, categories[j].subcategories.length);
          for (var k = 0; k < categories[j].subcategories.length; k++) {
            console.log(categories[j].subcategories[k], categories[j].subcategories[k].selected, 'pewp');
            if (categories[j].subcategories[k].selected) {
              tourURL +=
                subcat_str +
                encodeURIComponent(categories[j].subcategories[k].name);
            }
          }
        }
      }
    }
    console.log(tourURL);
    this.setState({tourURL: tourURL});
    return tourURL;
  }

  getTour = async () => {
    const tURL = this.compileTourURL()
    fetch(tURL)
      .then((response) => {
        return response.json();
      })
      .then((tour) => {
        console.log(tour);
        console.log(this)
        this.setState({
          tour: tour
        });
      });
  }

  // Standard React function that runs once the component has loaded. Calls on
  // the API to get the list of routes, then uses asynchronous JS to handle the
  // response, parsing it as JSON and updating the value `routes` in state
  componentDidMount() {
    const routesURL = apiDomain + 'api/v1/routes/';
    const catsURL = apiDomain + 'api/v1/categories/'
    fetch(routesURL)
      .then((response) => {
        return response.json();
      })
      .then((routes) => {
        this.setState({
          routes: routes,
        })
      })
    fetch(catsURL)
      .then((response) => {
        return response.json();
      })
      .then((categories) => {
        for (var i = 0; i < categories.length; i++){
          categories[i]['selected'] = false;
        }
        this.setState({
          categories: categories,
        })
      })
  }

  // Main method of the component - this renders the actual page elements
  render() {
    // De-structures elements from this.props and this.state, so they can be
    // referred to in the base of the namespage inside the method
    const { classes } = this.props;
    const { currentStep, type, route, routes, start, end, distance, categories } = this.state;
    return (
      <div
        className="bg_image"
        style={{
          backgroundImage:'url('+bkgd+')',
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        <AppBar position="static" className={classes.bar}>
          <Toolbar className={classes.container}>
            <FiberManualRecordIcon className={classes.bigDot} />
            <Typography variant="h6" className={classes.title}>
              Edinburgh Fl&acirc;neur
            </Typography>
            <Button
              href="http://edinburghflaneur.org"
              target="_blank"
              className={classes.topButton}
            >
              Main Site
            </Button>
            <Button
              href="http://edinburghflaneur.org"
              target="_blank"
              className={classes.topButton}
            >
              Leave Feedback
            </Button>
            <Button
              href="mailto:team@edinburghflaneur.org"
              className={classes.topButton}
            >
              Contact Us
            </Button>
          </Toolbar>
        </AppBar>
        <div style={{ padding: 40 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h1" className={classes.text}>
                Explore Edinburgh's Cultural Spaces
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="body1" className={classes.text}>
                Welcome to Edinburgh Living Lab's cultural tours of Edinburgh.
                Here, you can generate custom tours of cultural spaces around
                Edinburgh, drawing on our database of over 1,000 sites.
                Pick a bus line or cycle route and we'll give you an itinerary
                of cultural sites within 500 meters of your route, which you may
                print out as a pamphlet or access via your mobile device.
                This project aims to generate interest in Edinburgh’s cultural
                sector once the shutdown is over, and printed tours will be
                distributed on select bus lines, to showcase cultural spaces
                within 500 meters of each bus stop. The project will be promoted
                by the Council’s Culture Office. The maps will be available on the
                Culture and Communities Mapping Project website and the City
                Council’s website.

              </Typography>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                className={classes.button + ' ' + classes.centred}
                onClick={() => {this.handleNext(1, {})}}
              >
                Plan my tour!
              </Button>
            </Grid>
            <Grid item xs={6}>
            </Grid>
          </Grid>
        </div>
        <div style={{ padding: 40 }}>
          { currentStep > 0
            ? <FirstStep classes={classes} handleNext={this.handleNext}/>
            : null
          }
        </div>
        <div style={{ padding: 40 }}>
          { currentStep > 1
            ? <SecondStep
                classes={classes}
                handleNext={this.handleNext}
                type={type}
                routes={routes}
              />
            : null
          }
        </div>
        <div style={{ padding: 40 }}>
          { currentStep > 2
            ? <ThirdStep
                classes={classes}
                handleNext={this.handleNext}
                type={type}
                route={route}
              />
            : null
          }
        </div>
        <div style={{ padding: 40 }}>
          { currentStep > 3
            ? <FourthStep
                classes={classes}
                handleNext={this.handleNext}
                route={route}
                start={start}
                end={end}
              />
            : null
          }
        </div>
        <div style={{ padding: 40 }}>
          { currentStep > 4
            ? <FifthStep
                classes={classes}
                handleNext={this.handleNext}
                route={route}
                start={start}
                end={end}
                distance={distance}
                categories={categories}
              />
            : null
          }
        </div>
        <div style={{ padding: 40 }}>
          { currentStep > 5
            ? <LastStep
                classes={classes}
                handleNext={this.handleNext}
                route={route}
                start={start}
                end={end}
                distance={distance}
                getTour={this.getTour}
                compileTourURL = {this.compileTourURL}
                tour={this.state.tour}
              />
            : null
          }
        </div>
      </div>
    );
  }
}

class FirstStep extends Component {
  constructor(props) {
      super(props);
      this.step1Ref = React.createRef()
      this.state = {

      };
  }

  componentDidMount() {
    window.scrollTo(0, this.step1Ref.current.offsetTop)
  }

  render() {
    const { classes, handleNext } = this.props;
    const { currentStep } = this.state;
    return (
      <div ref={this.step1Ref} style={{ padding: 40 }}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card className={classes.centred}>
              <CardContent>
                <Typography
                  variant="h3"
                  className={classes.text + ' ' + classes.cardTitle}
                >
                  How do you want to travel?
                </Typography>
              </CardContent>
              <CardActions>
                <Grid container>
                  <Grid item xs={2}></Grid>
                  <Grid item xs={3}>
                    <Button
                      variant="contained"
                      className={classes.button + ' ' + classes.centred}
                      onClick={() => {handleNext(2, {'type': 'Cycle'})}}
                    >
                      Bike & Walk
                    </Button>
                  </Grid>
                  <Grid item xs={3}></Grid>
                  <Grid item xs={3}>
                    <Button
                      variant="contained"
                      className={classes.button + ' ' + classes.centred}
                      onClick={() => {handleNext(2, {'type': 'Bus'})}}
                    >
                      Bus & Walk
                    </Button>
                  </Grid>
                  <Grid item xs={1}></Grid>
                </Grid>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </div>
    )
  }
}

class SecondStep extends Component {
  constructor(props) {
      super(props);
      this.step2Ref = React.createRef()
      this.state = {

      };
  }

  async componentDidMount() {
    window.scrollTo(0, this.step2Ref.current.offsetTop)
  }

  render() {
    const { classes, type, handleNext, routes } = this.props;
    const routeCount = () => {
      var count=0;
      for(var i=0; i < routes.length; i++){
        if (routes[i].type === type) {
          count++;
        }
      }
      return count;
    }
    return (
      <div ref={this.step2Ref} style={{ padding: 40 }}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card className={classes.centred}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    Select a route
                  </Typography>
                </Grid>
                <Grid item xs={3}></Grid>
                <Grid item xs={6}>
                  <FormControl className={classes.formControl}>
                  <InputLabel
                    width={600}
                    className={classes.button}
                    id="route_selector"
                  >
                    {routeCount() + " routes"}
                  </InputLabel>
                    <Select
                      width={600}
                      className={classes.selectEmpty}
                      id="which_route"
                      inputProps={{
                        name: "pick_route",
                        id: "pick_route",
                        'aria-label': 'Without label'
                      }}
                      defaultValue=""
                      displayEmpty
                    >
                      {routes.map((route) => (
                        route.type === type
                        ? <MenuItem
                            key={'route_'+route.id}
                            value={route.id}
                            onClick={() => {
                              handleNext(
                                3,
                                {
                                  'route': route
                                }
                              )
                            }}
                          >
                            {route.name}
                          </MenuItem>
                        : null
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}></Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </div>
    )
  }
}

class ThirdStep extends Component {
  constructor(props) {
    super(props);
    this.step3Ref = React.createRef()
    this.state = {
      start: this.props.route.waypoints[0],
      end: this.props.route.waypoints[this.props.route.waypoints.length-1],
    };
  }

  async componentDidMount() {
    window.scrollTo(0, this.step3Ref.current.offsetTop)
  }

  render() {
    const { classes, type, route, handleNext } = this.props;
    var { start, end } = this.state;
    var startFound = false;
    var endPassed = false;
    return (
      <div ref={this.step3Ref} style={{ padding: 40 }}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card className={classes.centred}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    Pick your start and end points
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    {route.name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    Start at {start.name} (<em>Lat: {start.lat}, Lon {start.lon}
                    </em>)<br />Finish at {end.name} (<em>Lat: {end.lat},&nbsp;
                    Lon {end.lon}</em>)
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <FormControl className={classes.formControl}>
                    <InputLabel
                      width={600}
                      className={classes.button}
                      id="start_selector"
                    >
                      Start:
                    </InputLabel>
                    <Select
                      width={600}
                      className={classes.selectEmpty}
                      id="which_route"
                      inputProps={{
                        name: "start_wpt",
                        id: "start_wpt",
                        'aria-label': 'Without label'
                      }}
                      defaultValue=""
                      displayEmpty
                    >
                      {route.waypoints.map((waypoint) => {
                        endPassed = waypoint.stop_id === end.stop_id
                          ? true
                          : endPassed;
                        return waypoint.is_keypoint && (!endPassed || waypoint.stop_id === end.stop_id)
                          ? <MenuItem
                              key={'wpt_'+waypoint.stop_id}
                              value={waypoint.stop_id}
                              onClick={() => {
                                this.setState({start: waypoint});
                              }}
                            >
                              {waypoint.name}&nbsp;<em>Lat: {waypoint.lat}&nbsp;
                              Lon: {waypoint.lon}</em>
                            </MenuItem>
                          : null;
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={5}>
                  <FormControl className={classes.formControl}>
                    <InputLabel
                      width={600}
                      className={classes.button}
                      id="route_selector"
                    >
                      End:
                    </InputLabel>
                    <Select
                      width={600}
                      className={classes.selectEmpty}
                      id="which_route"
                      inputProps={{
                        name: "end_wpt",
                        id: "end_wpt",
                        'aria-label': 'Without label'
                      }}
                      defaultValue=""
                      displayEmpty
                    >
                      {
                        route.waypoints.map((waypoint) => {
                        startFound = waypoint.stop_id === start.stop_id
                          ? true
                          : startFound;
                        return waypoint.is_keypoint && startFound
                          ? <MenuItem
                              key={'wpt_'+waypoint.stop_id}
                              value={waypoint.stop_id}
                              onClick={() => {
                                this.setState({end: waypoint});
                              }}
                            >
                              {waypoint.num}:&nbsp;{waypoint.name}&nbsp;
                              <em>
                                Lat: {waypoint.lat}&nbsp;Lon: {waypoint.lon}
                              </em>
                          </MenuItem>
                          : null;
                        })
                      }
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    className={classes.button + ' ' + classes.centred}
                    onClick={() => {
                      handleNext(
                        4,
                        {
                          'start': this.state.start,
                          'end': this.state.end,
                        }
                      )
                    }}
                  >
                    Next <NavigateNextIcon />
                  </Button>
                </Grid>
                <Grid item xs={12}></Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </div>
    )
  }

}

class FourthStep extends Component {
  constructor(props) {
      super(props);
      this.step4Ref = React.createRef()
      this.state = {
        distance: 250
      };
  }

  async componentDidMount() {
    window.scrollTo(0, this.step4Ref.current.offsetTop)
  }

  render() {
    const { classes, handleNext, route, start, end } = this.props;

    return (
      <div ref={this.step4Ref} style={{ padding: 40 }}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card className={classes.centred}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    Set your range
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Typography
                    variant="h5"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    List cultural sites within {this.state.distance}m of&nbsp;
                    "{route.name}", from {start.name} to {end.name}
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={6}>
                  <Slider
                    defaultValue={250}
                    getAriaValueText={(value) => (value+'m')}
                    aria-labelledby="discrete-slider-always"
                    valueLabelDisplay="auto"
                    color={ef_teal}
                    step={25}
                    marks
                    min={25}
                    max={500}
                    onChange={(event, newValue) => {
                      this.setState({distance: newValue});
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    className={classes.button + ' ' + classes.centred}
                    onClick={() => {
                      handleNext(
                        5,
                        {
                          'distance': this.state.distance,
                        }
                      )
                    }}
                  >
                    Next <NavigateNextIcon />
                  </Button>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={12}></Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </div>
    )
  }

}

class FifthStep extends Component {
  constructor(props) {
      super(props);
      this.step5Ref = React.createRef();
      this.state = {
        searchesOrFilters: [],
        searches: [],
        search_count: 0,
        filter_count: 0
      };
  }

  async componentDidMount() {
    window.scrollTo(0, this.step5Ref.current.offsetTop)
  }

  addSearchOrFilter(isSearch) {
    var newSOF = {
      isSearch: isSearch,
      key: (
        isSearch
        ?'search_' + (this.state.search_count + 1)
        :'filter_' + (this.state.filter_count + 1)
      )
    }
    this.state.searchesOrFilters.push(newSOF)
    this.setState({
      searchesOrFilters: this.state.searchesOrFilters,
      search_count: this.state.search_count + (isSearch?1:0),
      filter_count: this.state.filter_count + (isSearch?0:1)
    });
  }

  render() {
    const { classes, handleNext, route, start, end, distance } = this.props;
    var { searchesOrFilters, searches, search_count, filter_count } = this.state;
    var { categories } = this.props;

    return (
      <div ref={this.step5Ref} style={{ padding: 40 }}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card className={classes.centred}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    Filter sites
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Typography
                    variant="h5"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    {
                      "Add search terms and categories to limit the cultural " +
                      "sites displayed. If you do not add category filters or" +
                      " searches, all sites that fall within " + distance +
                      "m of your route will be displayed. If you add category" +
                      " filters or searches, all sites found by at least one " +
                      "of your categories or searches will be displayed."
                    }
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>



                <Grid item xs={2}></Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    className={classes.button + ' ' + classes.centred}
                    onClick={() => {this.addSearchOrFilter(false)}}
                  >
                    Add a category filter
                  </Button>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    className={classes.button + ' ' + classes.centred}
                    onClick={() => {this.addSearchOrFilter(true)}}
                  >
                    Add a search term
                  </Button>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                {
                  searchesOrFilters.map((sOF) => (
                    sOF.isSearch
                    ? <SearchBox
                        classes={classes}
                        searches={searches}
                        key = {sOF.key}
                        key_str = {sOF.key}
                      />
                    : <CategorySelector
                        classes={classes}
                        categories={categories}
                        key = {sOF.key}
                        key_str = {sOF.key}
                    />
                ))}
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                <Button
                  variant="contained"
                  className={classes.button + ' ' + classes.centred}
                  onClick={() => {
                    console.log('beep');
                    handleNext(
                      6,
                      {
                        'categories': this.props.categories,
                        'searches': this.state.searches,
                        'did_thing': 'thing_done'
                      }
                    )
                  }}
                >
                  GO! <NavigateNextIcon />
                </Button>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={12}></Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </div>
    )
  }

}

class LastStep extends Component {
  constructor(props) {
      super(props);
      this.step5Ref = React.createRef()

  }

  async componentDidMount() {
    window.scrollTo(0, this.step5Ref.current.offsetTop)
    console.log(this.props);
    this.props.getTour()
  }

  render() {
    const { classes, handleNext, route, start, end, distance, tour } = this.props;


    return (
      <div ref={this.step5Ref} style={{ padding: 40 }}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card className={classes.centred}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    Your tour
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Typography
                    variant="h5"
                    className={classes.text + ' ' + classes.cardTitle}
                  >
                    Cultural sites within {distance}m of&nbsp;
                    "{route.name}", from {start.name} to {end.name}
                  </Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  {
                    tour && tour.waypoints?
                    <List>
                      {
                        tour.waypoints.map((wpt) => (
                          wpt.is_keypoint?
                            <div key={wpt.stop_id}>
                              <ListItem >
                                <Waypoint
                                  num={tour.waypoints.indexOf(wpt)+1}
                                  name={wpt.name}
                                  lat={wpt.lat}
                                  lon={wpt.lon}
                                  sites={wpt.sites}
                                  classes={classes}
                                  key={wpt.stop_id + '_wpt'}
                                />
                              </ListItem>
                              {
                                tour.waypoints.indexOf(wpt)+1 === tour.waypoints.length
                                  ? null
                                  : <Divider />
                              }
                            </div>
                            :null
                        ))
                      }
                    </List>:
                    <p>Please wait, loading...</p>
                  }
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
      </div>
    )
  }

}



class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search_string: ''
    };
  }

  render() {
    const { classes, key_str } = this.props;
    var { searches } = this.props;
    var { search_string } = this.state;
    return (
        <Card className={classes.searchbox}>
          <Typography variant="h6" className={classes.text}>
            {
              search_string
              ?"You searched for '" + search_string + "'"
              :'Enter your search. You can use "quote marks" to search for ' +
              'multi-word phrases. Your tour will include all cultural sites ' +
              'in our database that contain all the words and phrases in your' +
              ' search'
            }
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={8}>
              <FormControl className={classes.formControl}>
                <InputLabel
                  width={600}
                  className={classes.button}
                  id="search"
                >
                  {"Enter your search"}
                </InputLabel>
                <Input
                  width={600}
                  className={classes.selectEmpty}
                  id={key_str + "_input"}
                  inputProps={{
                    name: "search",
                    id: key_str + "_input_",
                    'aria-label': 'Without label'
                  }}
                  defaultValue=""
                  displayEmpty
                />
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                className={classes.button + ' ' + classes.centred}
                onClick={() => {
                  var search_str = document.getElementById(key_str + "_input_").value;
                  searches.push(search_str);
                  this.setState({
                    search_string: search_str,
                    searches: searches
                  });
                  console.log(this.state.search_string);
                }}
              >
                Search <SearchIcon />
              </Button>
            </Grid>
          </Grid>
        </Card>
    )
  }
}



class CategorySelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "cat_chosen": -1
    }
  }

  render() {
    const { num, name, lat, lon, sites, classes } = this.props;
    var { categories } = this.props;
    var { cat_chosen } = this.state;

    return (
        <Card className={classes.searchbox}>
          <Typography variant="h6" className={classes.text}>
            Select category
          </Typography>
          <FormControl className={classes.formControl}>
          <InputLabel
            width={600}
            className={classes.button}
            id="cat_selector"
          >
            {categories.length + " categories"}
          </InputLabel>
            <Select
              width={600}
              className={classes.selectEmpty}
              id="which_cat"
              inputProps={{
                name: "pick_cat",
                id: "pick_cat",
                'aria-label': 'Without label'
              }}
              defaultValue=""
              displayEmpty
            >
              {categories.map((cat) => (
                !cat.selected || cat.id===this.state.cat_chosen
                ?<MenuItem
                  key={cat.name}
                  value={cat.id}
                  onClick={() => {
                    categories[cat.id]['selected'] = true;
                    if (cat_chosen >= 0) {
                      categories[cat_chosen]['selected'] = false;
                      console.log('It did the thing');
                    }
                    this.setState({'cat_chosen': cat.id});
                  }}
                >
                  {cat.name}
                </MenuItem>
                :null
              ))};
            </Select>
            {
              cat_chosen > -1
              ?<div>
                <Typography variant="h6" className={classes.text}>
                  (Optional) select subcategories
                </Typography>
                <Grid container spacing={1}>

                  {categories[cat_chosen]['subcategories'].map((sc) => (
                    <Grid item xs={4} key={categories[cat_chosen].name+'_'+sc.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            value = {sc.selected}
                            checked = {sc.selected}
                            onChange={() => {
                              sc.selected = !sc.selected;
                              this.forceUpdate();
                            }}
                            name={sc.name}
                            color="primary"
                          />
                        }
                        label={sc.name}
                      />
                    </Grid>
                  ))}
                </Grid>
              </div>
              :null
            }
          </FormControl>
        </Card>
    )
  }
}



class Waypoint extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { num, name, lat, lon, sites, classes } = this.props;
    return (
        <Card className={classes.waypoint}>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography variant="h2" className={classes.text}>
                ({num})
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h4" className={classes.text}>
                    {name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h5" className={classes.text}>
                    <em>Lat: {lat}, Lon: {lon}</em>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={5}>
              {
                sites ?
                  <Typography variant="h5" className={classes.text}>
                    Sites
                  </Typography> :
                  null
              }
              {
                sites ?
                  sites.map((site) => (
                    <Site
                      site={site}
                      classes={classes}
                      key={name + "_site_" + sites.indexOf(site)}
                      kee={name + "_site_" + sites.indexOf(site)}
                    />
                  )) :
                  null
              }
            </Grid>
          </Grid>
        </Card>
    )
  }
}

class Site extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  render() {
    const { site, classes, kee } = this.props;
    var { show } = this.state;
    return (
      <Card className={classes.site}>
        <Button
          variant="contained"
          className={classes.button + ' ' + classes.centred}
          onClick={() => {
            this.setState({
              show: !show
            });
            console.log(this.state.search_string);
          }}
        >
          <Typography variant="h6" className={classes.text}>
            {site.name}
          </Typography>
        </Button>
        {
          show
          ?<List>
            <ListItem>
              <em>Lat:&nbsp;{site.lat}&nbsp;Lon:&nbsp;{site.lon}</em>
            </ListItem>
            {[
              "category", "subcategory", "description", "interest", "organisation",
              "dist_to_stop", "website", "address", ].map((item) => {
                return (
                  site[item]
                    ? <ListItem key={kee+'_'+item}>
                        {item}:&nbsp;{site[item]}
                      </ListItem>
                    : null
                )
              })
            }
          </List>
          : null
        }
      </Card>
    )
  }
}


render(
  <FrontpageWrapper />,
  //<FrontpageX />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
