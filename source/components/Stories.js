import React from 'react';
import stories from '../theme/assets/stories';
import Story from './Story';

export default class Stories extends React.Component {
    render() {
        const storiesJSX = stories.map((story) => {
            return (
                <Story
                    key = { story.id }
                    message = { story.message }
                    src = { story.src }
                />);
        });

        return <div className = 'stories'>{storiesJSX}</div>;
    }
}
