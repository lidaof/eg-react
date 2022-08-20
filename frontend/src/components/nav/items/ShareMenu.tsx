import { Dialog, DialogActions, DialogContent, DialogTitle, Grow, Typography } from "@material-ui/core";
import Button from "components/egUI/Button";
import ShareUI from "components/ShareUI";
import React, { useState } from "react";

function Share() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button style={{ backgroundColor: open && "var(--eg-secondary-container)" }} onClick={handleOpen}>Share</Button>
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