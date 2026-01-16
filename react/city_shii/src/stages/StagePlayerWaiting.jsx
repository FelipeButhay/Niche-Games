import { useState, useEffect } from 'react';
import Chrono from '../components/Chrono';
import Earth from '../components/Earth';
import socket from '../sockets';
import './css/StagePlayerWaiting.css';

export default function StagePlayerWaiting({round, city}) {
    return (
        <div className='background'>
            <div className='main-card'>
                <span className='title'>Waiting for the Spectr</span>
                <div className="round-time">
                    <span style={{flex: 1}} className='sub-subtitle'>Round {round || "-"} </span>
                    <span style={{flex: 1}} className='sub-subtitle chrono'>
                        <Chrono initSec={0} reverse={false} target={-1} func={() => {}}/>
                    </span>
                </div>
                {/* <span className='sub-subtitle'>Round {round || "n"}</span> */}
            </div>
            <Earth
                size={"90vh"}
                camSpeed={0.5}
                rotSpeed={16.}
                pinList={[city]}
            />
        </div>
    );
}