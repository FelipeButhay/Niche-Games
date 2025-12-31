import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

const radius = 50;
const fov = 45;
const dist = 150;
const PI = 3.14159265359;

const earthRotationSpeed = 0.05; 
const cloudRotationSpeed = 0.07; 

//                         1      2        3       4         5         6       7        8
const color_list = [null, "Red", "Green", "Blue", "Yellow", "Purple", "Cyan", "White", "Orange"];

function BigPinModel({ colorID, lat, lon, rotSpeedMult }) {
	const color = color_list[colorID];
	const { nodes, materials } = useGLTF(`/models/pins_big/${color.toLowerCase()}.glb`);
	const size = 10;

	const rotY = lon * PI / 180.;
	const rotZ = PI/2 - lat * PI / 180.;

	const group = useRef();
	useFrame((state, delta) => {
    	if (group.current) {
            group.current.rotation.y += delta * earthRotationSpeed * rotSpeedMult;
    	}
  	});

  	return (
    	<group ref={group} dispose={null} position={[0,0,0]} rotation={[0, rotY, rotZ]}>
			<group scale={size} position={[0,radius,0]}>
      			<mesh castShadow receiveShadow geometry={nodes[`Cube01${colorID}_1`].geometry} material={materials.Metal}/>
      			<mesh castShadow receiveShadow geometry={nodes[`Cube01${colorID}`].geometry}   material={materials[color]}/>
      		</group>
    	</group>
  	)
}

// default size 3.
function PinModel({ colorID, lat, lon, rotSpeedMult }) {
	const color = color_list[colorID];
	const { nodes, materials } = useGLTF(`/models/pins/${color.toLowerCase()}.glb`);
	const size = 2.5;

	const rotY = lon * PI / 180.;
	const rotZ = PI/2 - lat * PI / 180.;

	const group = useRef();
	useFrame((state, delta) => {
    	if (group.current) {
            group.current.rotation.y += delta * earthRotationSpeed * rotSpeedMult;
    	}
  	});

  	return (
    	<group ref={group} dispose={null} position={[0,0,0]} rotation={[0, rotY, rotZ]}>
      		<group scale={size} position={[0,radius,0]}>
        		<mesh castShadow receiveShadow geometry={nodes[`Cube00${colorID}_1`].geometry} material={materials.Metal}/>
        		<mesh castShadow receiveShadow geometry={nodes[`Cube00${colorID}`].geometry}   material={materials[color]}/>
      		</group>
    	</group>
	);
}

function EarthModel({ nodes, materials, rotSpeedMult }) {
  	const group = useRef();

  	useFrame((state, delta) => {
    	if (group.current) {
    	  	const [clouds, earth] = group.current.children;

            clouds.rotation.y += delta * cloudRotationSpeed * rotSpeedMult;
            earth.rotation.y  += delta * earthRotationSpeed * rotSpeedMult;
    	}
  	});

  	return (
    	<group ref={group} dispose={null} scale={1.0} /*rotation={[23.45 * PI / 180., 0, 0]}*/>
    	  	<mesh castShadow={true} receiveShadow={true} geometry={nodes.Clouds.geometry} material={materials.Clouds} />
    	  	<mesh castShadow={true} receiveShadow={true} geometry={nodes.Earth.geometry}  material={materials.Earth} />
    	</group>
  	);
}

// useGLTF.preload("/models/earth.glb");

function Sun() { 
	// kinda deprecated 
	const lightRef = useRef();
  	const { scene } = useThree();

  	useEffect(() => {
    	const target = new THREE.Object3D();
    	target.position.set(-550, 0, 0);
    	scene.add(target);

    	lightRef.current.target = target;
  	}, [scene]);

	return (
		<>
			<directionalLight
      			ref={lightRef}
      			position={[-500, 0, 0]}
      			intensity={3.}
    		/>
			<mesh position={[-550, 0, 0]}> 
				<sphereGeometry args={[10, 32, 32]} /> 
				<meshStandardMaterial color="yellow" /> 
			</mesh> 
		</>
	)
}

/* HTML: <div class="loader"></div> */

function LoaderFallback() {
  	// You can put any React or R3F component here (e.g., a simple box or HTML spinner)
  	return (
		<Html center>
  			<div className="loader"></div>
		</Html>
	);
}

// Pin list [{color_id: int, lat: float, lon: float, spectr: bool}, ...]
export default function Earth({ pinList, size, camSpeed, rotSpeed, fixed }) {
	const gltf = useGLTF("/models/earth.glb");

  	return (
    	<div className="earth-container"
			style={{ 
        		width: size, 
        		height: size, 
        		overflow: "hidden",
        		position: "relative", 
				zIndex: 0
			}}>
      		<Canvas 
				style={{
      				// position: "absolute",
      				top: 0,
      				left: fixed ? "25%" : "0",
					width: "100%", 
        			height: size, 
					overflow: "hidden",
    				transform: fixed ? "translateY(5vh)" : "translateY(0)",
					// position: "relative",
    				position: fixed ? "fixed" : "relative",
      			}} 
				camera={{ position: [-dist*.5773, dist*.5773, -dist*.5773], fov }}
			>
        		<ambientLight intensity={0.3} />
        		<directionalLight 
					position={[-500, 0, 0]} 
					intensity={2.}
				/>
				{/* <Sun/> */}
        		<OrbitControls enableZoom={false} enablePan={false} target={[0, 0, 0]} rotateSpeed={camSpeed}/>
				
				<Suspense fallback={<LoaderFallback/>}>
        			<EarthModel nodes={gltf.nodes} materials={gltf.materials} rotSpeedMult={rotSpeed || 1}/>
					{
						pinList == undefined || pinList.length == 0  ? <></> : 
						pinList.map((pinData, i) => {
							return pinData["spectr"] ? 
							(
								<BigPinModel key={i} 
									colorID={pinData["color_id"]} 
									lat={pinData["lat"]} 
									lon={pinData["lon"]} 
									rotSpeedMult={rotSpeed || 1}
								/>
							) : (
								<PinModel key={i} 
									colorID={pinData["color_id"]} 
									lat={pinData["lat"]} 
									lon={pinData["lon"]} 
									rotSpeedMult={rotSpeed || 1}
								/>
							)
						})
					}
				</Suspense>


				{/* <axesHelper args={[100]}/> */}
				{/* <PinModel colorID={1} lat={40.366656} lon={-49.835183}/> */}
      		</Canvas>
    	</div>
  	);
}
