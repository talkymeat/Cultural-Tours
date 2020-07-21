import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

class Frontpage extends React.Component {
  render() {
    return (
      <div>
        <h1>Cultural Tours of Edinburgh</h1>
        <p>
          Welcome to Edinburgh Living Lab's cultural tours of Edinburgh. Pick a bus
          line or cycle route and we'll give you an itinerary of cultural sites
          close to your route.
        </p>
      </div>
    )
  }
}

ReactDOM.render(
  <Frontpage />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
