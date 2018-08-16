import React from 'react';
import {Link} from 'react-router-dom';

const NotFoundPage = () => (
    <div style={{
        margin: "150px",
        height: "500px"
    }}>
        <h3>
            404 - Page not found
        </h3>
        <br/>
        <Link to="/">Go home</Link>
    </div>
);

export default NotFoundPage;
