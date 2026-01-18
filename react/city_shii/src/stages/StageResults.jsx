import { useState, useEffect, useRef } from 'react';
import socket from '../sockets';
import PlayerCard from '../components/PlayerCard';
import Earth from '../components/Earth';
import './css/StageResults.css';

const columns = {
	username: 		"#str_/Username",
	color_id:		"#hide/",
	city:			"#str_/City",
	lat:			"#hide/",
	lon:			"#hide/",
	delta_d: 		"#num_/Δd",
	points: 		"#num_/+Points", 
	total_points: 	"#num_/Total Points",
	spectr:			"#hide/"
}

const sortConfigOrder = ["max", "min", null];
export default function StageResults({round, roomId, userId, city}) {
	// order (el elemento que se ecuntra arriba de todo es el mayor (1) o el menor (2))
	const [sortConfig, setSortConfig] = useState({ key: "color_id", order: 2});
	const [table, setTable] = useState([
		{ username: "Loading...", color_id: 1, city: "-", lat: 180, lon: 0, delta_d: 0, points: 0, total_points: 1200, spectr: false }
	]);

	useEffect(() => {
		socket.emit("get-results", 
			{room_id : roomId}, 
			(response) => {
				console.log(response);

				response["results"] = response["results"].map((user) => {
					if (user.spectr) {
						user["delta_d"] = "-";
						user["points"] = "-";
					}
					return user;
				});

				const sortedTable = [...response["results"]].sort((a,b) => {		
					if (sortConfig.order == null) {
						setSortConfig({ key: "color_id", order: 2});
					}
					
					const valA = a[sortConfig.key];
					const valB = b[sortConfig.key];
		
					if (typeof valA === "string") return  1;
					if (typeof valB === "string") return -1;
		
					return sortConfig.order === 1 ? valB - valA : valA - valB;
				});
				setTable(sortedTable);
			}
		)
	}, []);

	useEffect(() => {
		if (table != undefined) {
			const sortedTable = [...table].sort((a,b) => {		
				if (sortConfig.order == null) {
					setSortConfig({ key: "color_id", order: 2});
				}
				
				const valA = a[sortConfig.key];
				const valB = b[sortConfig.key];

				if (typeof valA === "string") return  1;
				if (typeof valB === "string") return -1;

				return sortConfig.order === 1 ? valB - valA : valA - valB;
			});
			setTable(sortedTable);
		}
	}, [sortConfig]);

	/* [
		{ username: "SpeedFang",   color_id: 1, city: "Buenos Aires",     lat: -34.6037, lon: -58.3816, delta_d: 12, 	  points: 150, total_points: 1200, spectr: false },
		{ username: "CrimsonWolf", color_id: 2, city: "Madrid",           lat: 40.4168,  lon: -3.7038,  delta_d: -3,      points:  98, total_points:  980, spectr: false },
		{ username: "LunaStrike",  color_id: 3, city: "Santiago",         lat: -33.4489, lon: -70.6693, delta_d: 7,       points: 110, total_points: 1040, spectr: false },
		{ username: "NeonVortex",  color_id: 4, city: "Ciudad de México", lat: 19.4326,  lon: -99.1332, delta_d: "-",     points: "-", total_points:  860, spectr: true  },
	//  { username: "NeonVortex",  color_id: 4, city: "-",                lat: null,     lon: null,     delta_d: "-",     points: "-", total_points:  860, spectr: true  },
		{ username: "IronPulse",   color_id: 5, city: "Lima",             lat: -12.0464, lon: -77.0428, delta_d: -1.7178, points:  95, total_points:  920, spectr: false },
		{ username: "SkyRider",    color_id: 6, city: "Bogotá",           lat: 4.7110,   lon: -74.0721, delta_d: 5.1263,  points: 102, total_points:  990, spectr: false },
		{ username: "EchoBlade",   color_id: 7, city: "Caracas",          lat: 10.4806,  lon: -66.9036, delta_d: -4.5229, points:  88, total_points:  870, spectr: false },
		{ username: "ShadowCore",  color_id: 8, city: "Quito",            lat: -0.1807,  lon: -78.4678, delta_d: 9.3556,  points: 112, total_points: 1080, spectr: false }
	] */

	// const spectrUser = data.current.table.filter((user) => user.spectr)[0];

	function handlerArrowClick(key) {
		if (key == sortConfig.key) {
			const newOrder = (sortConfig.order + 1) % 3; 
			setSortConfig({
				key: newOrder == 0 ? "color_id" : sortConfig.key,
				order: newOrder == 0 ? 2 : newOrder
			});
		} else {
			setSortConfig({
				key: key,
				order: 1
			});
		}
	}

	// ready shii

    const [ready, setReady] = useState(false);

	function handlerReadyButtonClick() { 
		setReady((prev) => {
			const newReady = !prev;
			socket.emit("set-ready2", { room_id: roomId, user_id: userId,ready2: newReady });
			return newReady;
		});
	}

    return (
        <div className='result-background'>
			<div className="result-table">
				<span className='title'>Round Results</span>
				<span className='subtitle'>{city.distance}km from {city.name}</span>
            	<span className='sub-subtitle'>Round {round || "-"}</span>
				<div className='table'>
					<div className='table-header'>
						<div className='color-space'></div>
						{Object.keys(table[0]).map((key, i) => {
							let column_code = columns[key];
							// console.log(key);
							// console.log(column_code);
							return (column_code != undefined && !column_code.startsWith("#hide/"))
							&& (
								<div className='header-cell' key={i}>
									<div className='header-cell-title'>{column_code.substr(6)}</div>

									{column_code.startsWith("#num_/") && (
											<svg className='arrows' viewBox="-10 -25 20 50" onClick={() => handlerArrowClick(key)}>
												<polygon id="up"   points="0 -24, 10 -4, -10 -4" 
													fill={
														sortConfig.key == key && sortConfig.order == 1 ? 
														"var(--primary)" : "#888"}/>

												<polygon id="down" points="0  24, 10  4, -10  4" 
													fill={
														sortConfig.key == key && sortConfig.order == 2 ? 
														"var(--primary)" : "#888"}/>
											</svg>
										)
									}
								</div>
							)}
						)}
					</div>
					<div className='table-body'>
						{table.map((user) => {return (
								<div className='body-row row' key={user["color_id"]} id={user["color_id"]}>
									<div className='color-space' 
										style={{
											backgroundColor: `var(--color${user["color_id"]})`
										}}
									></div>
									{Object.keys(user).map((key, i) => {
										let column_code = columns[key];
										// console.log(key);
										// console.log(column_code);
										return (column_code != undefined && !column_code.startsWith("#hide/"))
										&& (
											<div key={i} className={
													"body-cell" + " " + 
													key + " " + 
													(column_code.startsWith("#num_/") ? "numeric" : "string")
												}
												style={{fontStyle: "auto"}}
											>
												{
													key == "delta_d" && typeof user[key] === "number" ? 
													user[key].toFixed(2) + "km" : 
													user[key]
												}
											</div>
										)}
									)}
								</div>
							)}
						)}
					</div>
				</div>
			</div>

			<div className='result-earth'>
				<div className='earth-grid'
					style={{
						gridColumn: 
							table != undefined ? 
							(table.length > 4 ? "2" : "2 / 3") : "1", 
						gridRow: "1 / 5"
					}}
				>
					<Earth
						fixed={false}                 
						size={"100%"}
						camSpeed={0.5}
						rotSpeed={3.}
						pinList={
							table == undefined ? [] :
							table.map((player) => {
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

				{ table != undefined && (
					<div className='player-container'
						style={{gridColumn: "1", gridRow: `1 / ${Math.min(5, table.length)}`}}	
					>
						{
							table
								.slice(0, Math.min(4, table.length))
								.map((player, i) => {
									return <PlayerCard player={player} key={i}/>
								})
						}	
					</div>
				)}

				{ (table != undefined && table.length > 4) &&
					(
						<div className='player-container'
							style={{gridColumn: "3", gridRow: `1 / ${table.length-3}`}}
						>
							{
								table.slice(4, table.length).map((player, i) => {
									return <PlayerCard player={player} key={i + 4}/>
								})
							}	
						</div>
					)
				}
			</div>

			<button 
				className={'ready-button' + " " + (ready ? "ready" : "")} 
				onClick={handlerReadyButtonClick}
			>
				<div className='ready-text'>Ready</div>
				<div className='signs'>
					<div className='sign-?' style={{lineHeight: "3rem"}}>?</div>
					<div className='sign-!' style={{lineHeight: "3rem"}}>!</div>
				</div> 
			</button>
        </div>
    );
}