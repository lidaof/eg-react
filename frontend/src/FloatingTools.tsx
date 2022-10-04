import React from 'react';
import {
    motion,
    AnimatePresence
    // @ts-ignore
} from 'framer-motion/dist/framer-motion';
import { Tools } from 'components/trackContainers/Tools';
import {
    IconButton,
    Paper
} from "@material-ui/core";

interface FloatingToolsProps {
    pickingGenome: boolean;
    activeTool: typeof Tools.DRAG;
    onSetActiveTool: (tool: typeof Tools.DRAG) => void;
}

function FloatingTools(props: FloatingToolsProps) {
    const {
        pickingGenome,
        activeTool,
        onSetActiveTool
    } = props;

    const cstyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
    };

    const mstyle: React.CSSProperties = {
        position: 'fixed',
        float: 'right',
        right: 0,
        width: 55,
        zIndex: 99,
        border: '1px #5f6368 solid',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        overflow: 'hidden',
    };

    const renderButtons = () => {
        const bres: React.ReactNode[] = [];

        for (let tname in Tools) {
            const tool: typeof Tools.DRAG = Tools[tname];
            const active = tool.buttonContent === activeTool.buttonContent;

            bres.push(
                <IconButton
                    onClick={() => onSetActiveTool(tool)}
                    disabled={active}
                    key={tname}
                >
                    {tool.icon}
                </IconButton>
            )
        }

        return bres;
    };

    return (
        <AnimatePresence>
            {!pickingGenome && (
                <motion.div
                    key={pickingGenome}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                >
                    <div style={mstyle}>
                        <Paper>
                            <div style={cstyle}>
                                {renderButtons()}
                            </div>
                        </Paper>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default FloatingTools;