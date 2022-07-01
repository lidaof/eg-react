import React, { useState } from "react";
import Button from '../../egUI/Button'
import { Menu, MenuItem } from "@material-ui/core";
import MenuModal from '../MenuModal';

interface AppsProps {
    
}

function Apps(props: AppsProps) {
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
                
            </Menu>
        </>
    )
}

export default Apps;