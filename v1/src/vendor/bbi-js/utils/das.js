/* eslint-disable */
/* -*- mode: javascript; c-basic-offset: 4; indent-tabs-mode: nil -*- */

// 
// Dalliance Genome Explorer
// (c) Thomas Down 2006-2010
//
// das.js: queries and low-level data model.
//


    "use strict";
    
    if (typeof(require) !== 'undefined') {
    }
    
    //
    // DAS 1.6 features command
    //
    
    function DASFeature() {
    }
    
    function DASGroup(id) {
        if (id)
            this.id = id;
    }
    
    if (typeof(module) !== 'undefined') {
        module.exports = {
            DASGroup: DASGroup,
            DASFeature: DASFeature,
        };
    }