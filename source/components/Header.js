import React from 'react';

export default class Header extends React.Component {
    render() {
        return (
            <div className = 'header'>
                <div className = 'logo' />
                <input
                    placeholder = 'Search'
                    type = 'text'
                />
            </div>
        );
    }
}
