/**
 * Function to format data to work with new Heatmap widget
 * @author Deepak Purushotham
 */

export function formatForHeatmap(data) {
    if (Object.keys(data) === 0) {
        return null;
    }

    if (data.hasOwnProperty('heatmap')) {
        if (data.heatmap.length === 0) {
            return null;
        }
        const yAxesNames = data.heatmap[0].y;
        const datapoints = data.heatmap[0].z;

        const result = {
            data: [],
            keys: []
        };
        datapoints.forEach((row, index) => {
            const rowName = yAxesNames[index];
            const tmp = {
                row: rowName
            };
            row.map((elem, elemIndex) => {
                tmp[elemIndex + 1] = Number.parseFloat(elem.toFixed(2));
            });

            result.data.push(tmp);                                                  // For HeatmapWidget.js line 16
        });
        result.keys = datapoints[0].map((d, idx) => (idx + 1).toString());          // For HeatmapWidget.js line 17
        return result;
    } else {
        return null;
    }

}