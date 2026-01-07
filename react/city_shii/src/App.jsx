import { useState, useEffect, useRef } from 'react'
import StageWaiting from './stages/StageWaiting'
import StagePlayerWaiting from './stages/StagePlayerWaiting';
import StagePlayerEnterCity from './stages/StagePlayerEnterCity'
import StageSpectrWaiting from './stages/StageSpectrWaiting';
import StageSpectrEnterDist from './stages/StageSpectrEnterDist';
import StageResults from './stages/StageResults';
import "./stages/css/variables.css";
import "./stages/css/common.css";
// import Earth from './components/Earth';

const STAGE_ENUM = {
	NULL: 0,
	WAITING: 1,
	PLAYER_WAITING: 2,
	PLAYER_ENTER_CITY: 3,
	SPECTR_WAITING: 4,
	SPECTR_ENTER_DIST: 5,
	RESULTS: 6,
}

export default function App() {
	const [screen, setScreen] = useState(STAGE_ENUM.WAITING);
	const [round, setRound] = useState(0);
	const playingCity = useRef({
		name: "Jacksonville",
		color_id: 1, 
		lat: 30.3166, 
		lon: -81.65, 
		size: 3.6,
		distance: 10000
	});

  	return (
		<>
			{screen == STAGE_ENUM.WAITING 			&& (<StageWaiting/>)}
			{screen == STAGE_ENUM.PLAYER_WAITING 	&& (<StagePlayerWaiting/>)}
			{screen == STAGE_ENUM.PLAYER_ENTER_CITY && (<StagePlayerEnterCity city={playingCity.current}/>)}
			{screen == STAGE_ENUM.SPECTR_WAITING 	&& (<StageSpectrWaiting playerList={[
				{
				  "id": 1,
				  "username": "LunaFox",
				  "city": "Buenos Aires",
				  "lat": -34.6037,
				  "lon": -58.3816,
				  "color_id": 3,
				  "ready": true,
				  "spectr": false
				},
				{
				  "id": 2,
				  "username": "NeoDrift",
				  "city": "Madrid",
				  "lat": 40.4168,
				  "lon": -3.7038,
				  "color_id": 5,
				  "ready": false,
				  "spectr": false
				},
				{
				  "id": 3,
				  "username": "PixelStorm",
				  "city": "Tokyo",
				  "lat": 35.6895,
				  "lon": 139.6917,
				  "color_id": 1,
				  "ready": true,
				  "spectr": false
				},
				{
				  "id": 4,
				  "username": "CrimsonByte",
				  "city": "Toronto",
				  "lat": 43.6532,
				  "lon": -79.3832,
				  "color_id": 7,
				  "ready": false,
				  "spectr": false
				},
				{
				  "id": 5,
				  "username": "EchoNova",
				  "city": "Berlin",
				  "lat": 52.5200,
				  "lon": 13.4050,
				  "color_id": 2,
				  "ready": true,
				  "spectr": true
				},
				{
				  "id": 6,
				  "username": "SolarWave",
				  "city": "Sydney",
				  "lat": -33.8688,
				  "lon": 151.2093,
				  "color_id": 6,
				  "ready": false,
				  "spectr": false
				},
				{
				  "id": 7,
				  "username": "VortexKing",
				  "city": "New York",
				  "lat": 40.7128,
				  "lon": -74.0060,
				  "color_id": 8,
				  "ready": true,
				  "spectr": false
				},
				{
				  "id": 8,
				  "username": "ArcticSoul",
				  "city": "Oslo",
				  "lat": 59.9139,
				  "lon": 10.7522,
				  "color_id": 4,
				  "ready": false,
				  "spectr": false
				}
				]}
			/>)}
			{screen == STAGE_ENUM.SPECTR_ENTER_DIST 	&& (<StageSpectrEnterDist city={playingCity.current}/>)}
			{screen == STAGE_ENUM.RESULTS			&& (<StageResults/>)}
		</>
	);
}