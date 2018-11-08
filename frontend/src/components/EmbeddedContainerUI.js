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
                    label: "gencodeM19Basic", 
                    options: { label: "gencodeM19Basic", maxRows: 5 }, 
                    url: "", metadata: { "Track type": "geneannotation" }
                  }, 
                  { 
                    type: "geneannotation", 
                    name: "refGene", 
                    label: "refGene", 
                    options: { label: "refGene", maxRows: 6 }, 
                    url: "", 
                    metadata: { "Track type": "geneannotation" } 
                  },
                  { 
                    type: "ruler", 
                    name: "Ruler", label: "Ruler", 
                    options: { label: "Ruler" }, 
                    url: "", 
                    metadata: { "Track type": "ruler" } 
                  }, 
                  { 
                    type: "repeatmasker", 
                    name: "RepeatMasker", 
                    url: "https://vizhub.wustl.edu/public/mm10/rmsk16.bb", 
                    label: "RepeatMasker",
                    options: { label: "RepeatMasker" }, metadata: { "Track type": "repeatmasker" } 
                  }
                ], 
                metadataTerms: [], 
                regionSets: [], 
                regionSetViewIndex: -1, 
              };
            return (
                <div>
                    <h1>Embedded browser</h1>
                    <EmbeddedContainer contents={contents} />
                    <h2>test</h2>
                </div>
            );
        }
}

export default EmbeddedContainerUI;