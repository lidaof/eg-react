import React from 'react';

export class Footer extends React.Component {
    render (){
        const year = (new Date()).getFullYear();
        return ( <div style={{marginTop: "5px", textAlign: "center", color: "gray"}}>
            Copyright &copy; 2018-{year} Washington University in St. Louis. All rights reserved.
            <br/>  Developed by the <a href="http://wang.wustl.edu" target="_blank">Wang Lab</a>
<br/> <a href="LICENSE.html">Terms and Conditions of Use</a>
        </div>);
    }
}