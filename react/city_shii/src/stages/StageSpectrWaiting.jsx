import { useState, useEffect, useRef } from 'react';
import Chrono from '../components/Chrono';
import Earth from '../components/Earth';
import PlayerCard from '../components/PlayerCard';
import './css/StageSpectrWaiting.css';

// player list = [{username, city, lat, lon, color_id, ready, spectr}, ...]
export default function StageSpectrWaiting({round, playerList}) {
    const print = () => {console.log("pene")}

    return (
        <div className='background'>
            <div className='interface'>
                <div className='main-card title-container'>
                    <span className='title'>Waiting for the Players</span>
                    <div className="round-time">
                        <span style={{flex: 1}} className='sub-subtitle'>Round {round || "-"} </span>
                        <span style={{flex: 1}} className='sub-subtitle chrono'>
                            <Chrono  initSec={120} reverse={true} target={0}/>
                        </span>
                    </div>
                </div>
                <div className="main-card player-container">
                    {
                        playerList != undefined && playerList.map((player, i) => {
                            return <PlayerCard player={player} key={i} showReady={true}/>
                        })
                    }
                </div>
            </div>
            
            <Earth
                fixed={true}
                size={"90vh"}
                camSpeed={0.5}
                rotSpeed={3.}
                pinList={
                    !playerList ? [] :
                    playerList.map((player) => {
                        return {
                            color_id: player["color_id"], 
							lat: player["lat"],
							lon: player["lon"],
							spectr: player["spectr"]
                        }
                    })
                }
            />
        </div>
    );
}