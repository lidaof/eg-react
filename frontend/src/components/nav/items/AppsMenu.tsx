import React, { useState } from "react";
import Button from '../../egUI/Button'
import { Menu, MenuItem } from "@material-ui/core";
import MenuModal from '../../egUI/MenuModal';
import RegionSetSelector from "components/RegionSetSelector";
import { GenomeConfig } from "model/genomes/GenomeConfig";
import Geneplot from "components/Geneplot/Geneplot";
import ScatterPlot from "components/Geneplot/ScatterPlot";
import { SessionUI } from "../../SessionUI";
import LiveUI from "components/LiveUI";
import { ScreenshotUI } from "components/ScreenshotUI";
import { RegionExpander } from "model/RegionExpander";
import { HighlightInterval } from "components/trackContainers/HighlightMenu";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import { DynamicRecordUI } from "components/DynamicRecordUI";
import { FetchSequence } from "components/FetchSequence";

interface AppsProps {
    genomeConfig: GenomeConfig;
    bundleId: string;
    regionExpander: RegionExpander;
    hasExpansionTrack: boolean;
    highlights: HighlightInterval[];
    viewRegion: DisplayedRegionModel;
    darkTheme: boolean;
}

function Apps(props: AppsProps) {
    const {
        genomeConfig,
        bundleId,
        regionExpander,
        hasExpansionTrack,
        highlights,
        viewRegion,
        darkTheme,
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
            <Button style={{ backgroundColor: open && "var(--eg-secondary-container)" }} onClick={handleClick}>Apps</Button>
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
                <MenuModal closeMenu={handleClose} title="Region Set View" genomeDependent>
                    <RegionSetSelector genome={genomeConfig.genome} />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Gene Plot" genomeDependent>
                    <Geneplot genome={genomeConfig.genome} />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Scatter Plot" genomeDependent>
                    <ScatterPlot genome={genomeConfig.genome} />
                </MenuModal>
                {!process.env.REACT_APP_NO_FIREBASE && (
                    [<MenuModal closeMenu={handleClose} title="Session" key={0}>
                        <SessionUI bundleId={bundleId} />
                    </MenuModal>,
                    <MenuModal closeMenu={handleClose} title="Go Live" key={1}>
                        <LiveUI />
                    </MenuModal>]
                )}
                <MenuModal closeMenu={handleClose} title="Screenshot" genomeDependent>
                    <ScreenshotUI
                        expansionAmount={regionExpander}
                        needClip={hasExpansionTrack}
                        genomeConfig={genomeConfig}
                        highlights={highlights}
                        viewRegion={viewRegion}
                        darkTheme={darkTheme}
                    />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Dynamic Record">
                    <DynamicRecordUI expansionAmount={regionExpander} genomeConfig={genomeConfig} />
                </MenuModal>
                <MenuModal closeMenu={handleClose} title="Fetch Sequence" genomeDependent>
                    <FetchSequence genomeConfig={genomeConfig} selectedRegion={viewRegion} />
                </MenuModal>
            </Menu>
        </>
    );
}

export default Apps;