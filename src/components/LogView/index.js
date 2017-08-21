import React from 'react';

import './style.css';


class LogView extends React.Component { 

  handleClick(gitRef) {
     window.open(gitRef);
  }

  genHtml(jsonInput) {
     const objects = [];
     for ( let i in jsonInput)   {
         if (jsonInput[i].gitRef) {
             objects.push(
                 <div className="gitref-link" key={i} onClick={this.handleClick.bind(this, jsonInput[i].gitRef)}>{jsonInput[i].line}</div>
             );
         }
         else {
             objects.push(
                 <div className="nogitref-link" key={i}>{jsonInput[i].line}</div>
             );
         }
     }
     return (
        <div>{objects}</div>
     );
  }

  render() {
      let processed = this.genHtml(this.props.data);
      console.log(processed);
      return processed
  }
}
export default LogView;
