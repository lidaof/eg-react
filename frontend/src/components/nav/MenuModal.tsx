import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grow,
    MenuItem,
    Typography
} from "@material-ui/core";

interface MenuModalProps {
    children: React.ReactNode;
    title: string;
}

function MenuModal(props: MenuModalProps) {
    const {
        children,
        title,
    } = props;
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <MenuItem onClick={handleOpen}>{title}</MenuItem>
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
                        {title}
                    </Typography>
                </DialogTitle>
                <DialogContent style={{ marginLeft: "15px" }}>
                    {children}
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

export default MenuModal;