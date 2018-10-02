// Core
import React from 'react';
import ReactDOM from 'react-dom';

// Theme
import './theme/init';

export default class Instagram extends React.Component {
    render () {
        return <div className = 'start'>🌟</div>
    }
}

ReactDOM.render(<Instagram />, document.getElementById('app'));
