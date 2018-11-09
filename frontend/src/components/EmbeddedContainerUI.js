import React from 'react';
import EmbeddedContainer from './EmbeddedContainer';

class EmbeddedContainerUI extends React.Component {
        render(){
            const contents = { 
                genomeName: "mm10", 
                displayRegion: "chr5:51997494-52853744",
                trackLegendWidth: 120, 
                isShowingNavigator: true,
                tracks: [
                  { 
                    type: "geneannotation", 
                    name: "gencodeM19Basic", 
                    genome: "mm10"
                  }, 
                  { 
                    type: "geneannotation", 
                    name: "refGene", 
                    genome: "mm10"
                  },
                  { 
                    type: "ruler", 
                    name: "Ruler",
                  }, 
                  { 
                    type: "repeatmasker", 
                    name: "RepeatMasker", 
                    url: "https://vizhub.wustl.edu/public/mm10/rmsk16.bb", 
                  }
                ], 
                metadataTerms: [], 
                regionSets: [], 
                regionSetViewIndex: -1, 
              };
            // const contents2 = { 
            //     genomeName: "hg19", 
            //     displayRegion: "chr6:51997494-52853744",
            //     trackLegendWidth: 120, 
            //     isShowingNavigator: true,
            //     tracks: [
            //       { 
            //         type: "geneannotation", 
            //         name: "refGene", 
            //         genome: "hg19"
            //       },
            //       { 
            //         type: "ruler", 
            //         name: "Ruler"
            //       }, 
            //     ], 
            //     metadataTerms: [], 
            //     regionSets: [], 
            //     regionSetViewIndex: -1, 
            //   };
            return (
                <div>
                    <h1>Embedded browser</h1>
                    <EmbeddedContainer contents={contents} />
                    <h2>test</h2>
                    {/* <EmbeddedContainer contents={contents2} /> */}
                </div>
            );
        }
}

export default EmbeddedContainerUI;