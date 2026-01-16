import { useState, useEffect, useRef } from 'react';
import Chrono from '../components/Chrono';
import Earth from '../components/Earth';
import PlayerCard from '../components/PlayerCard';
import './css/StageSpectrWaiting.css';
import socket from '../sockets';

// player list = {user_id: {username, city, lat, lon, color_id, ready, spectr}, ...}
export default function StageSpectrWaiting({round, roomId}) {
    const [playerList, setPlayerList] = useState({});
    
    useEffect(() => {
        socket.emit("get-player-list", {room_id: roomId}, (data) => {
            setPlayerList(data["player_list"]);
        });
    }, []);

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
                        playerList != undefined && playerList.values().map((player, i) => {
                            return <PlayerCard player={player} key={i} showReady={true}/>
                        })
                    }
                    { playerList.length == 0 && (<div className="loader"></div>) }
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