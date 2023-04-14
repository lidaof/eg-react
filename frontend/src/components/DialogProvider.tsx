import React, { useState } from 'react';
/**
 * import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
 */

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grow
} from '@material-ui/core';

interface DialogButtons {
    title: string;
    onClick?: () => void;
    cancelButton?: boolean;
    autofocus?: boolean;
}
export let showConfirmationDialog: (title: string, content: string, onClick: () => void) => void = (title: string, content: string, onClick: () => void) => {
    showDialog(title, content, [
        {
            title: "Cancel",
            onClick: () => hideDialog()
        },
        {
            title: "OK",
            onClick: () => {
                onClick();
                hideDialog();
            },
            autofocus: true,
        }
    ])
};
export let showDialog: (title: string, content: string, buttons: DialogButtons[]) => void = () => { };
export let hideDialog: () => void = () => { };

interface DialogProviderProps {
    children: React.ReactChildren;
}
export default function DialogProvider(props: DialogProviderProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [buttons, setButtons] = useState<DialogButtons[]>([]);

    const _showDialog = (title: string, content: string, buttons: DialogButtons[]) => {
        setTitle(title);
        setContent(content);
        setButtons(buttons);
        setOpen(true);
    }
    const _hideDialog = () => {
        setTimeout(() => {
            setTitle("");
            setContent("");
        }, 500);
        setOpen(false);
    }

    showDialog = _showDialog;
    hideDialog = _hideDialog;

    const _handleClickAndClose = (onClick: () => void) => () => {
        onClick();
        _hideDialog();
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                TransitionComponent={Grow}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    {buttons.map((button, i) => {
                        return (
                            <Button
                                autoFocus={button.autofocus}
                                onClick={_handleClickAndClose(button.onClick)}
                                key={i}
                                color="primary"
                            >
                                {button.title}
                            </Button>
                        );
                    })}
                </DialogActions>
            </Dialog>
            {props.children}
        </>
    );
}

