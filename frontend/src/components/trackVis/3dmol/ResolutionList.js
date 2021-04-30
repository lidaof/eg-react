import React, {useState, useEffect} from 'react';

export const ResolutionList = (props) => {
    const {resolutions, resolution, onUpdateResolution} = props;
    // console.log(props)
    const [reso, setReso] = useState(0)
    useEffect(() => {
        setReso(resolution);
      }, [resolution]);
    if(!resolutions.length) return null;
    return (
        <div style={{padding: 5}}>
             <label>
          Choose resolution:
          <select value={reso.toString()} onChange={e => setReso(e.target.value)}>
            {
                resolutions.map(r => <option key={r} value={r}>{r}</option>)
            }
          </select>
        </label>
        <button className="btn btn-primary btn-sm" onClick={() => onUpdateResolution(Number.parseInt(reso, 10))}>Go</button>
        </div>
    );
}

ResolutionList.defaultProps = {
    resolutions: [],
    resolution: 0,
    onUpdateResolution: () => {},
}