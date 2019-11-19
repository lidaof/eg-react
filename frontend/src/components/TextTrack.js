import React from 'react';

const TEXT_TYPE_DESC = {
    bed: {
        desc: 'text file in BED format, each column is separated by tab',
        example: `chr1	13041	13106	reg1	1	+
           chr1	753329	753698	reg2	2	+
           chr1	753809	753866	reg3	3	+
           chr1	754018	754252	reg4	4	+
           chr1	754361	754414	reg5	5	+
           chr1	754431	754492	reg6	6	+
           chr1	755462	755550	reg7	7	+
           chr1	761040	761094	reg8	8	+
           chr1	787470	787560	reg9	9	+
           chr1	791123	791197	reg10	10	+`
    },
    bedgraph: {
        desc: 'text file in bedGraph format, 4 columns bed file, each column is chromosome, start, end and value',
        example: ``
    }
};

export class TextTrack extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            textType: 'bed'
        };
    }

    renderTextForm = () => {
        return 'aaa';
    };

    render() {
        return <div></div>;
    }
}
