import { useState } from 'react';
import Chrono from '../components/Chrono';
import Earth from '../components/Earth';
import './css/StagePlayerEnterCity.css';
import { randInt } from 'three/src/math/MathUtils.js';
import socket from '../sockets';

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
    "Lanus Oeste"
];

export default function StagePlayerEnterCity({ round, userId, roomId, city}) {
    const [cityList, setCityList] = useState([]);
    /* [
        {name: "Charleville",          pop:  3515, cc: "AU"},
        {name: "Charleville-Mézières", pop: 52415, cc: "FR"},
        {name: "Charleville",          pop:  3919, cc: "IE"},
    ] */
    const [citySelectedId, setCitySelectedId] = useState(null);

    function handleSelectCity(id) {
        if (id == citySelectedId) {
            setCitySelectedId(null);
        } else {
            setCitySelectedId(id);
        }
        console.log(citySelectedId);
    }
    
    function handleSubmit(e) {
        e.preventDefault();
        const inputText = e.target.querySelector("input");
        socket.emit("get-cities", {city: inputText.value, user_id: userId}, (response) => {
            setCityList(response);
        });
        inputText.value = "";
    }

    function handleSend() {
        socket.emit("send-city", {city_id: citySelectedId, user_id: userId, room_id: roomId});
    }

    return (
        <div className='background' >
            <div className='interface'>
                <div className='main-card'>
                    <div className='title-div'>
                        <span style={{display: "inline"}} className='title'>Choose a city </span> 
                        <span style={{display: "inline"}} className='title-special'>{city.distance}km</span>
                        <span style={{display: "inline"}} className='title'> apart from </span> 
                        <span style={{display: "inline"}} className='title-special'>{city.name}</span>
                    </div>
                    <div className="round-time">
                        <span style={{flex: 1}} className='sub-subtitle'>Round {round || "-"} </span>
                        <span style={{flex: 1}} className='sub-subtitle chrono'>
                            <Chrono  initSec={120} reverse={true} target={0} func={() => {}}/>
                        </span>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input type="text" 
                            placeholder={placeHolders[randInt(0, placeHolders.length)]}
                        ></input>
                    </form>

                    <div className='city-container'>
                        {
                            cityList.length > 0 ?
                            cityList.map((city) => {
                                return (
                                    <div id={`id-${city.id}`} key={city.id} onClick={() => handleSelectCity(city.id)}
                                        className={'city-card ' + (citySelectedId == city.id ? "selected" : "not-selected")} >

                                        <span className="city-name">
                                            {"[" + (city.cc || "cc") + "]"} {city.name || `CITY - ${city.id}`}
                                        </span>
                                        <span className="city-pop">{city.pop || "unknown"} inhab.</span>

                                    </div>
                                ) 
                            }) : (<span className='select-city'>Select a City</span>)
                        }

                        { cityList.length > 0 && (<span className='warning'>Select a city from above.</span>) }

                        <button className={'send-butt ' + (citySelectedId != null && "active")}
                            onClick={handleSend}
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