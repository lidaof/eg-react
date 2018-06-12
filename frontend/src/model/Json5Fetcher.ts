import $ from 'jquery';
import JSON5 from 'json5';

class Json5Fetcher {
    /**
     * Gets JSON5 from a URL.
     * 
     * @param {string} url - the URL from which to fetch
     * @return {Promise<Object>} promise for parsed JSON
     */
    get(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            $.ajax({ // We use jQuery because axios INSISTS on dataType = "json", making parsing with JSON5 impossible
                url,
                dataType: "text", // Expected type of data from server
            })
            .done((data: any) => {
                try {
                    resolve(JSON5.parse(data));
                } catch (error) {
                    reject(error);
                }
            })
            .fail(reject);
        });
    }
}

export default Json5Fetcher;
