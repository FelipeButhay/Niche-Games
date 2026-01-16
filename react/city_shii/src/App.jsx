import { useState, useEffect, useRef } from 'react'
import StageWaiting from './stages/StageWaiting'
import StagePlayerWaiting from './stages/StagePlayerWaiting';
import StagePlayerEnterCity from './stages/StagePlayerEnterCity'
import StageSpectrWaiting from './stages/StageSpectrWaiting';
import StageSpectrEnterDist from './stages/StageSpectrEnterDist';
import StageResults from './stages/StageResults';
import "./stages/css/variables.css";
import "./stages/css/common.css";
import socket from './sockets';
// import Earth from './components/Earth';

function add0s(n, digits) {
	const n_dig = n.toString().length;
	const str_0s = "0".repeat(digits - n_dig);
	return `${str_0s}${n}`;
}

const SCREENS = {
	NULL: 0,
	WAITING: 1,
	PLAYER_WAITING: 2,
	PLAYER_ENTER_CITY: 3,
	SPECTR_WAITING: 4,
	SPECTR_ENTER_DIST: 5,
	RESULTS: 6,
}

export default function App() {
	const [screen, setScreen] = useState(SCREENS.WAITING);
	const [round, setRound] = useState(0);
	const playingCity = useRef({
		name: "Jacksonville",
		color_id: 1, 
		lat: 30.3166, 
		lon: -81.65, 
		distance: 10000
	});

	const [ userId,  setUserId] = useState(undefined);
	const [ roomId,  setRoomId] = useState(undefined);
	const [colorId, setColorId] = useState(undefined);
	const [  admin,   setAdmin] = useState(false);

	const spectr = useRef(undefined);
	
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const room_id = Number(params.get("room_id"));
		const user_id = Number(params.get("user_id"));

		setRoomId(room_id);
		setUserId(user_id);
	}, []);

	useEffect(() => {
		if (userId === undefined || roomId === undefined) return
		
		// innits
		console.log("emiting user-innit");
		socket.emit(
			"user-innit", 
			{room_id: roomId, user_id: userId}, 
			(response) => {
				console.log(response);
				setAdmin(Boolean(response.admin));
				setColorId(response.color_id)
			}
		);

		// socket ons

		const handleSetScreen = (data) => {
			setScreen(data[spectr.current ? "screen_spectr" : "screen"]);
		};

		const handleNextRound = (data) => {
			spectr.current = data.spectr === userId;
			setScreen(data[spectr.current ? "screen_spectr" : "screen"]);
			setRound((r) => r + 1);
			playingCity.current = { ...data.playing_city, spectr: true };
		};

		socket.on("set-screen", handleSetScreen);
		socket.on("next-round", handleNextRound);

		return () => {
			socket.off("set-screen", handleSetScreen);
			socket.off("next-round", handleNextRound);
		};

		}, [userId, roomId]);

		useEffect(() => {
			if (admin) {	
				socket.emit(
					"game-innit", 
					{room_id: roomId}
				);
			}
	}, [admin]);
	
  	return (
		<>
			{screen == SCREENS.WAITING 			&& (
				<StageWaiting/>
			)}


			{screen == SCREENS.PLAYER_WAITING 	&& (
				<StagePlayerWaiting		
					round={round}
					city={playingCity.current}
				/>
			)}
			{screen == SCREENS.SPECTR_ENTER_DIST && (
				<StageSpectrEnterDist 	
					round={round} 
					city={playingCity.current}
					roomId={roomId}
				/>
			)}


			{screen == SCREENS.PLAYER_ENTER_CITY && (
				<StagePlayerEnterCity	
					round={round} 
					city={playingCity.current}
				/>
			)}
			{screen == SCREENS.SPECTR_WAITING 	&& (
				<StageSpectrWaiting 	
					round={round} 
					playerList={[]}
				/>
			)}


			{screen == SCREENS.RESULTS			&& (
				<StageResults			
					round={round} 
				/>
			)}
		</>
	);
}