import React from 'react';
import axios from 'axios';
import LogView from '../LogView/index.js';

import './style.css';

class Fetch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          url: "http://", 
          filter: null,
          data: [],
          /*
          data: [
            {line: '[js_test:after_cluster_time] 2017-07-27T23:32:53.172+0000 d22010| 2017-07-27T23:32:53.169+0000 I NETWORK  [conn8] end connection 10.158.195.82:50080 (14 connections now open)', 
             gitRef: 'https://github.com/mongodb/mongo/blob/master/src/mongo/s/chunk.cpp#L39'},
            {line: '[js_test:after_cluster_time] 2017-07-27T23:32:53.172+0000 d22010| 2017-07-27T23:32:53.169+0000 I NETWORK  [conn8] end connection 10.158.195.82:50080 (14 connections now open)', 
             gitRef: 'https://github.com/mongodb/mongo/blob/master/src/mongo/s/chunk.cpp#L39'},
            {line: '[js_test:after_cluster_time] 2017-07-27T23:32:53.172+0000 d22010| 2017-07-27T23:32:53.169+0000 I NETWORK  [conn8] end connection 10.158.195.82:50080 (14 connections now open)' 
             }
          ],
          */
          gitPage: "https://github.com/mongodb/mongo"
        };
    }

    handleChange = (name, value) => {
        console.log('set ' + name  + ' to !' + value)
        this.setState({name: value});
    }

   handleSubmit(event) {
      let self = this;
      axios.post('http://localhost:9000/api/log', {
        url: this.state.url,
      })
      .then(function (response) {
        console.log("got response");
        console.log(response.data);
        self.setState({data: response.data.data});
      })
      .catch(function (error) {
        console.log(error);
      });
    }

  render() {
      const {url, filter, data } = this.state;

      return (
       <div>
       <form onSubmit={this.handleSubmit}>
        <label>
          Log: <input type="text" size="100" value={url} onChange={this.handleChange.bind(this, 'url')} />
        </label>
        <input type="submit" value="Submit" />
      </form>

      <LogView data = {this.state.data} handleClick = {this.handleClick}/>
      </div>
//      {data.length > 0 ? data.map((value) => value) : null}
     );
  }
}
export default Fetch;
