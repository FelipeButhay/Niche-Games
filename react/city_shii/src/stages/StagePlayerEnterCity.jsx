import { useState, useEffect } from 'react';
import Chrono from '../components/Chrono';
import Earth from '../components/Earth';
import './css/StagePlayerEnterCity.css';
import { randInt } from 'three/src/math/MathUtils.js';

const placeHolders = [
    "City McCity",
    "Agartha",
    "Hiperborea",
    "Atlantis",
    "Jacksonville",
    "Niu York",
    "Batman",
    "Kunming",
    "Tero Violado",
    "Epstein Island",
    "Marte",
]

export default function StagePlayerEnterCity({ round, city}) {
    const [cityList, setCityList] = useState([
        {name: "Charleville",          pop:  3515, cc: "AU"},
        {name: "Charleville-Mézières", pop: 52415, cc: "FR"},
        {name: "Charleville",          pop:  3919, cc: "IE"},
    ]);
    const [citySelectedId, setCitySelectedId] = useState(null);

    function handleSelectCity(id) {
        if (id == citySelectedId) {
            setCitySelectedId(null);
        } else {
            setCitySelectedId(id);
        }
        console.log(citySelectedId);
    }

    return (
        <div className='background' >
            <div className='interface'>
                <div className='main-card'>
                    <div className='title-div'>
                        <span style={{display: "inline"}} className='title'>Choose a city </span> 
                        <span style={{display: "inline"}} className='title-special'>{city["distance"]}km</span>
                        <span style={{display: "inline"}} className='title'> apart from </span> 
                        <span style={{display: "inline"}} className='title-special'>{city["name"]}</span>
                    </div>
                    <div className="round-time">
                        <span style={{flex: 1}} className='sub-subtitle'>Round {round || "-"} </span>
                        <span style={{flex: 1}} className='sub-subtitle chrono'>
                            <Chrono  initSec={120} reverse={true} target={0} func={() => {}}/>
                        </span>
                    </div>
                    {/* <span className='sub-subtitle'>Round {round || "n"}</span> */}
                    <input type="text" placeholder={placeHolders[randInt(0, placeHolders.length)]}></input>

                    <div className='city-container'>
                        {
                            cityList.length > 0 ?
                            cityList.map((city, i) => {
                                return (
                                    <div id={`city${i}`} key={i} onClick={() => handleSelectCity(i)}
                                        className={'city-card ' + (citySelectedId == i ? "selected" : "not-selected")} >

                                        <span className="city-name">{"[" + (city.cc || "cc") + "]"} {city.name || `CITY - ${i}`}</span>
                                        <span className="city-pop">{city.pop || "unknown"} inhab.</span>

                                    </div>
                                ) 
                            }) : (<span className=''>Select a City</span>)
                        }

                        { cityList.length > 0 && (<span className='warning'>Select a city from above.</span>) }

                        <button className={'send-butt ' + (citySelectedId != null && "active")} 
                            style={{
                                marginTop: "4vh",
                                position: "relative", 
                            }} >Send</button>
                    </div>
                </div>
            </div>
            <Earth
                fixed={true}   
                size={"90vh"}
                camSpeed={0.5}
                rotSpeed={3.}
                pinList={[city]}
            />
        </div>
    )
}