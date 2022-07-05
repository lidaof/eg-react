import React, { useState } from "react";
import Button from '../../egUI/Button'
import { Menu, MenuItem } from "@material-ui/core";
import MenuModal from '../MenuModal';
import RegionSetSelector from "components/RegionSetSelector";

interface TracksProps {
    
}

function Tracks(props: TracksProps) {
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
            <Button onClick={handleClick}>Apps</Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuModal title="Region Set View">
                    <RegionSetSelector 
                        
                    />
                </MenuModal>
                <MenuModal title="Gene Plot">
                    <p>test</p>
                </MenuModal>
                <MenuModal title="Scatter Plot">
                    <p>test</p>
                </MenuModal>
                <MenuModal title="Session">
                    <p>test</p>
                </MenuModal>
                <MenuModal title="Go Live">
                    <p>test</p>
                </MenuModal>
                <MenuModal title="Screenshot">
                    <p>test</p>
                </MenuModal>
                <MenuModal title="Dynamic Record">
                    <p>test</p>
                </MenuModal>
                <MenuModal title="Fetch Sequence">
                    <p>test</p>
                </MenuModal>
            </Menu>
        </>
    )
}

export default Tracks;