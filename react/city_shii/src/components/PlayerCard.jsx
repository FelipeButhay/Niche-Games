// player = {username, city, lat, lon, color_id, ready: bool, spectr: bool}
export default function PlayerCard({player, showReady}) {
    const svgPath = 
    player.spectr ? 
    "/svgs/spectr.svg" : 

    player.ready1 ? 
    "/svgs/ready.svg" : 
    "/svgs/not_ready.svg"; 

    return (
        <div className='player-card'>
            <div className='color-stripe'
                style={{
                    backgroundColor: `var(--color${player["color_id"]})`
                }}
            ></div>
            <span className='subtitle'>{player["username"]}</span>
            <span className='sub-subtitle'>{player["city"] || "..."}</span>
            {showReady || player.spectr ? <object type="image/svg+xml" data={svgPath}></object> : <></>}
        </div>
    )
}