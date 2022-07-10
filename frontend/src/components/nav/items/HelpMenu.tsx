import Button from "components/egUI/Button";
import React, { useState } from "react";
import { Divider, Menu, MenuItem } from "@material-ui/core";
import MenuModal from "../MenuModal";
import { HotKeyInfo } from "components/HotKeyInfo";

/* 
<label className="dropdown-item">
                                    <a
                                        href="https://epigenomegateway.readthedocs.io/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Documentation
                                    </a>
                                </label>
                                <label className="dropdown-item">
                                    <a
                                        href="http://epigenomegateway.wustl.edu/legacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        The 'old' browser
                                    </a>
                                </label>
                                <label className="dropdown-item">
                                    <a
                                        href="https://groups.google.com/d/forum/epgg"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Google groups
                                    </a>
                                </label>
                                <label className="dropdown-item">
                                    <a
                                        href="https://join.slack.com/t/epgg/shared_invite/enQtNTA5NDY5MDIwNjc4LTlhYjJlZWM4MmRlMTcyODEzMDI0ZTlmNmM2ZjIyYmY2NTU5ZTY2MWRmOWExMDg1N2U5ZWE3NzhkMjVkZDVhNTc"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Join our Slack
                                    </a>
                                </label>
                                <label className="dropdown-item">
                                    <a
                                        href="https://github.com/lidaof/eg-react"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Source code @ Github
                                    </a>
                                </label>
                                <label className="dropdown-item">
                                    <a
                                        href="https://www.youtube.com/channel/UCnGVWbxJv-DPDCAFDQ1oFQA"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        YouTube channel
                                    </a>
                                </label>
*/

function Help() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const onClickLink = (href: string) => () => {
        handleClose();
        window.open(href, "_blank");
    }
    
    return (
        <>
            <Button onClick={handleClick}>Help</Button>
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
                <MenuModal closeMenu={handleClose} title="Hotkeys">
                    <HotKeyInfo />
                </MenuModal>
                <Divider />
                <MenuItem onClick={onClickLink("https://epigenomegateway.readthedocs.io/")}>Documentation</MenuItem>
                <MenuItem onClick={onClickLink("http://epigenomegateway.wustl.edu/legacy")}>The 'old' browser</MenuItem>
                <MenuItem onClick={onClickLink("https://groups.google.com/d/forum/epgg")}>Google groups</MenuItem>
                <MenuItem onClick={onClickLink("https://join.slack.com/t/epgg/shared_invite/enQtNTA5NDY5MDIwNjc4LTlhYjJlZWM4MmRlMTcyODEzMDI0ZTlmNmM2ZjIyYmY2NTU5ZTY2MWRmOWExMDg1N2U5ZWE3NzhkMjVkZDVhNTc")}>Join our Slack</MenuItem>
                <MenuItem onClick={onClickLink("https://github.com/lidaof/eg-react")}>Source code @ Github</MenuItem>
                <MenuItem onClick={onClickLink("https://www.youtube.com/channel/UCnGVWbxJv-DPDCAFDQ1oFQA")}>YouTube channel</MenuItem>
            </Menu>
        </>
    );
}

export default Help;