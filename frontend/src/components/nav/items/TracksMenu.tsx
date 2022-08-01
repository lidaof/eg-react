import React, { useState } from "react";
import Button from '../../egUI/Button'
import { Menu, MenuItem } from "@material-ui/core";
import MenuModal from '../../egUI/MenuModal';
import NavigableMenuModal from '../../egUI/NavigableMenuModal';
import RegionSetSelector from "components/RegionSetSelector";
import FacetTableUI from "components/FacetTableUI";
import { AnnotationTrackUI } from "components/trackManagers/AnnotationTrackUI";
import CustomTrackAdder from "components/trackManagers/CustomTrackAdder";
import HubPane from "components/trackManagers/HubPane";
import TrackList from "components/trackManagers/TrackList";
import { TrackUpload } from "components/TrackUpload";
import { TextTrack } from '../../TextTrack';
import { GenomeConfig } from "model/genomes/GenomeConfig";
import Track from "components/trackVis/commonComponents/Track";
import TrackModel from "model/TrackModel";

interface TracksProps {
    tracks: TrackModel[];
    onTracksAdded: Function;
    onTrackRemoved: Function;
    onAddTracksToPool: Function;
    publicTracksPool: Track[];
    publicHubs: any[];
    onHubUpdated: Function;
    // publicTrackSets: any[];
    customTracksPool: Track[];
    // customTrackSets: any[];
    addTermToMetaSets: Function;
    genomeConfig: GenomeConfig;
    groupedTrackSets: any[];
    addedTrackSets: Set<string>;
    availableTrackSets: Set<string>;
    addTracktoAvailable: Function;
    removeTrackFromAvailable: Function;
}

function Tracks(props: TracksProps) {
    const {
        tracks,
        onTracksAdded,
        onTrackRemoved,
        onAddTracksToPool,
        publicTracksPool,
        publicHubs,
        onHubUpdated,
        // publicTrackSets,
        customTracksPool,
        // customTrackSets,
        addedTrackSets,
        addTermToMetaSets,
        genomeConfig,
        groupedTrackSets,
        availableTrackSets,
        addTracktoAvailable,
        removeTrackFromAvailable
    } = props;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }
    
    return (
        <>
            <Button style={{ backgroundColor: open && "var(--eg-secondary-container)" }} onClick={handleClick}>Tracks</Button>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                getContentAnchorEl={null}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: { borderRadius: 16 }
                }}
            >
                <MenuModal closeMenu={handleClose} title="Annotation Tracks" genomeDependent>
                    <AnnotationTrackUI
                        addedTracks={tracks}
                        onTracksAdded={onTracksAdded}
                        addedTrackSets={addedTrackSets}
                        genomeConfig={genomeConfig}
                        groupedTrackSets={groupedTrackSets}
                    />
                </MenuModal>
                <NavigableMenuModal closeMenu={handleClose} title="Public Data Hubs" genomeDependent>
                    <HubPane
                        addedTracks={tracks}
                        onTracksAdded={onTracksAdded}
                        onTrackRemoved={onTrackRemoved}
                        onAddTracksToPool={onAddTracksToPool}
                        publicTracksPool={publicTracksPool}
                        publicHubs={publicHubs}
                        onHubUpdated={onHubUpdated}
                        // publicTrackSets={publicTrackSets}
                        addedTrackSets={addedTrackSets}
                        addTermToMetaSets={addTermToMetaSets}
                    />
                </NavigableMenuModal>
                <MenuModal closeMenu={handleClose} title="Track Facet Table" genomeDependent>
                    <FacetTableUI
                        publicTracksPool={publicTracksPool}
                        customTracksPool={customTracksPool}
                        addedTracks={tracks}
                        onTracksAdded={onTracksAdded}
                        // publicTrackSets={publicTrackSets}
                        // customTrackSets={customTrackSets}
                        addedTrackSets={addedTrackSets}
                        addTermToMetaSets={addTermToMetaSets}
                    />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Remote Tracks" genomeDependent>
                    <CustomTrackAdder
                        addedTracks={tracks}
                        onTracksAdded={onTracksAdded}
                        onTrackRemoved={onTrackRemoved}
                        onAddTracksToPool={onAddTracksToPool}
                        customTracksPool={customTracksPool}
                        // customTrackSets={customTrackSets}
                        addedTrackSets={addedTrackSets}
                        addTermToMetaSets={addTermToMetaSets}
                        genomeConfig={genomeConfig}
                    />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Local Tracks" genomeDependent>
                    <TrackUpload onTracksAdded={onTracksAdded} />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Local Text Tracks" genomeDependent>
                    <TextTrack onTracksAdded={onTracksAdded} />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Track List" genomeDependent>
                    <TrackList
                        addedTracks={tracks}
                        onTracksAdded={onTracksAdded}
                        onTrackRemoved={onTrackRemoved}
                        addedTrackSets={addedTrackSets}
                        availableTrackSets={availableTrackSets}
                        addTracktoAvailable={addTracktoAvailable}
                        removeTrackFromAvailable={removeTrackFromAvailable}
                    />
                </MenuModal>
            </Menu>
        </>
    )
}

export default Tracks;