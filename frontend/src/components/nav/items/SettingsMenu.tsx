import Button from "components/egUI/Button";
import React, { useState } from "react";
import { Menu, MenuItem } from "@material-ui/core";

interface SettingsProps {

}

function Settings(props: SettingsProps) {
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
            <Button onClick={handleClick}>Settings</Button>
        </>
    )
}

export default Settings;