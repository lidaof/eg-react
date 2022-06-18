import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { QRCodeSVG } from "qrcode.react";
import { connect } from "react-redux";
import { compose } from "redux";
import querySting from "query-string";
import Zlib from "../vendor/zlib_and_gzip.js";
import { CopyToClip } from "./CopyToClipboard";
import { AppStateSaver } from "../model/AppSaveLoad";

// some string functions from juicebox.js
/**
 * Compress string and encode in a url safe form
 * @param s
 */
function compressString(str) {
    const bytes = [];
    for (var i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    const compressedBytes = new Zlib.RawDeflate(bytes).compress(); // UInt8Arry
    const compressedString = String.fromCharCode.apply(null, compressedBytes); // Convert to string
    let enc = btoa(compressedString);
    return enc.replace(/\+/g, ".").replace(/\//g, "_").replace(/=/g, "-"); // URL safe
}

/**
 * Uncompress the url-safe encoded compressed string, presumably created by compressString above
 *
 * @param enc
 * @returns {string}
 */
export function uncompressString(enc) {
    enc = enc.replace(/\./g, "+").replace(/_/g, "/").replace(/-/g, "=");

    const compressedString = atob(enc);
    const compressedBytes = [];
    for (let i = 0; i < compressedString.length; i++) {
        compressedBytes.push(compressedString.charCodeAt(i));
    }
    const bytes = new Zlib.RawInflate(compressedBytes).decompress();

    let str = "";
    for (let b of bytes) {
        str += String.fromCharCode(b);
    }
    return str;
}

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
            {value === index && <Box p={3}>{children}</Box>}
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

function ShareUI(props) {
    const useStyles = makeStyles((theme) => ({
        root: {
            backgroundColor: props.background,
            color: props.color,
            width: 800,
        },
    }));
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = useState(0);
    const [link, setLink] = useState("");
    const { color, background, browser } = props;
    const { url } = querySting.parseUrl(window.location.href);
    const json = JSON.stringify(new AppStateSaver().toObject(browser.present));
    const compressed = compressString(json);
    const full = `${url}/?blob=${compressed}`;
    const emailLink = `mailto:?subject=browser%20view&body=${link}`;
    const iframeContent = `<iframe src="${link}" width="100%" height="1200" frameborder="0" style="border:0" allowfullscreen></iframe>`;

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    useEffect(() => {
        // https://stackoverflow.com/a/66992058/1098347
        fetch(`https://api.tinyurl.com/create`, {
            method: `POST`,
            headers: {
                accept: `application/json`,
                authorization: `Bearer ${process.env.REACT_APP_TINYURL_BEARER}`,
                "content-type": `application/json`,
            },
            body: JSON.stringify({
                url: full,
                domain: `tiny.one`,
            }),
        })
            .then((response) => {
                if (response.status !== 200) {
                    // eslint-disable-next-line no-throw-literal
                    throw `error with the tiny-url fetch operation. Status Code: ${response.status}`;
                }
                return response.json();
            })
            .then((data) => {
                setLink(data.data.tiny_url);
            })
            .catch((error) => {
                setLink(full);
                console.error(error);
            });
    }, [full]);

    return (
        <div className={classes.root} id="shareUI">
            <AppBar position="static" color="transparent">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="secondary"
                    variant="fullWidth"
                    aria-label="shareUI"
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
                    <p>
                        Click{" "}
                        <a href={emailLink} target="_blank" rel="noopener noreferrer">
                            here
                        </a>{" "}
                        to email current browser view.
                    </p>
                    <p>
                        Or <CopyToClip value={link} /> current link and send it via chat software.
                    </p>
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <div>
                        <textarea
                            style={{ color, backgroundColor: background }}
                            defaultValue={iframeContent}
                            cols="90"
                            rows="10"
                        />
                    </div>
                    <div>
                        <CopyToClip value={iframeContent} />
                    </div>
                </TabPanel>
                <TabPanel value={value} index={2} dir={theme.direction}>
                    <QRCodeSVG value={link} style={{ display: "block", margin: "auto" }} size={256} />
                </TabPanel>
            </SwipeableViews>
        </div>
    );
}

export default compose(
    connect(
        (state) => ({
            browser: state.browser,
        }),
        null
    )
)(ShareUI);
