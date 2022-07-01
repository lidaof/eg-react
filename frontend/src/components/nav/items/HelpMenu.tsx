import Button from "components/egUI/Button";
import React, { useState } from "react";
import { Menu, MenuItem } from "@material-ui/core";


interface HelpProps {

}

function Help(props: HelpProps) {
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
            <Button onClick={handleClick}>Help</Button>
        </>
    )
}

export default Help;