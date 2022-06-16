import React from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { QRCodeSVG } from "qrcode.react";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: 500,
    },
}));

export function ShareUI(props) {
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);
    const { bundleId } = props;

    const link = `https://epigenomegateway.wustl.edu/browser/?bundle=${bundleId}`;
    const emailLink = `mailto:?subject=browser%20view&body=${link}`;
    const iframeContent = `<iframe src="${link}" width="100%" height="1200" frameborder="0" style="border:0" allowfullscreen></iframe>`;

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="Email" {...a11yProps(0)} />
                    <Tab label="Embed" {...a11yProps(1)} />
                    <Tab label="QR code" {...a11yProps(2)} />
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} dir={theme.direction}>
                    Click <a href={emailLink}>here</a> to email current browser view.
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <textarea name="iframeContent" id="iframeContent" cols="30" rows="10">
                        {iframeContent}
                    </textarea>
                </TabPanel>
                <TabPanel value={value} index={2} dir={theme.direction}>
                    <QRCodeSVG value={link} />
                </TabPanel>
            </SwipeableViews>
        </div>
    );
}
