export default function StageWaiting() {

    return (
        <div
            style={{
                backgroundColor: "black",
                height: "100vh",
                width: "100vw",
                position: "relative"
            }}
        >
            <div className="loader"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    fontSize: "6vh",
                    transform: "translate(-50%, -50%)"
                }}
            ></div>
        </div>
    );
}