import _ from "lodash";
import FlexLayout from "flexlayout-react";
import shortid from "shortid";

/**
 * utilies to deal with layouts
 * @author Daofeng Li
 */

export const initialLayout = {
    global: { tabSetHeaderHeight: 25, tabSetTabStripHeight: 25 },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                children: [
                    {
                        type: "tab",
                        enableClose: false,
                        name: "Browser",
                        component: "app",
                        id: "app",
                    },
                ],
            },
        ],
    },
};

export function addTabSetToLayout(newTabset, exisingLayout) {
    let children;
    const initial = _.isEmpty(exisingLayout) ? initialLayout : exisingLayout;
    if (initial.layout.children.length > 1) {
        // already have 2 panels, change direction to horizontal
        const lastChild = initial.layout.children.slice(-1)[0];
        if (lastChild.type === "row") {
            children = [...initial.layout.children, newTabset];
        } else {
            const child = [lastChild, newTabset];
            children = [
                ...initial.layout.children.slice(0, -1),
                { type: "row", children: child, id: shortid.generate() },
            ];
        }
    } else {
        children = [...initial.layout.children, newTabset];
    }
    const layout = { ...initial.layout, children };
    return { ...initial, layout };
}

export function deleteTabByIdFromLayout(layout, tabId) {
    const model = FlexLayout.Model.fromJson(layout);
    model.doAction(FlexLayout.Actions.deleteTab(tabId));
    const json = model.toJson();
    return json.layout.children.length > 1 ? json : {};
}

export function tabIdExistInLayout(layout, tabId) {
    if (_.isEmpty(layout)) {
        return false;
    }
    const model = FlexLayout.Model.fromJson(layout);
    const tab = model.getNodeById(tabId);
    return tab === undefined ? false : true;
}
