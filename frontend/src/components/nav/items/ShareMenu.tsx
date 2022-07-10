import Button from "components/egUI/Button";
import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Grow, Menu, MenuItem, Typography } from "@material-ui/core";
import MenuModal from "../MenuModal";
import ShareUI from "components/ShareUI";

interface ShareProps {

}

function Share(props: ShareProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button onClick={handleOpen}>Share</Button>
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Grow}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        borderRadius: "30px",
                        height: "75%",
                    }
                }}
                
            >
                <DialogTitle disableTypography>
                    <Typography variant="h5" style={{ margin: "15px", marginBottom: 0 }}>
                        Share
                    </Typography>
                </DialogTitle>
                <DialogContent style={{ marginLeft: "15px" }}>
                    <ShareUI />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Share;