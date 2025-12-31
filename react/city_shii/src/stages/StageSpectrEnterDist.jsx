import { useState, useEffect, useRef } from 'react';
import Chrono from '../components/Chrono';
import Earth from '../components/Earth';
import './css/StageSpecterEnterDist.css';
import { clamp, lerp } from 'three/src/math/MathUtils.js';

function antiLerp(a, b, c) {
    return (c - a) / (b - a);
}

function Slider({ defaultValue, min, max, unit }) {
    const sliding = useRef(false);
    const value = useRef(defaultValue);
    
    
    function updateSlider(percentage) {
        const div = document.querySelector("div.slider");
        const text = document.querySelector("div.text");

        const root = document.documentElement; 
        const color1 = getComputedStyle(root).getPropertyValue("--primary");

        const [c1r, c1g, c1b] = color1.slice(4, 15).split(",");
        const color2 = getComputedStyle(root).getPropertyValue("--secondary");
        const [c2r, c2g, c2b] = color2.slice(4, 15).split(",");
        
        const r = Math.round(lerp(c2r, c1r, percentage));
        const g = Math.round(lerp(c2g, c1g, percentage));
        const b = Math.round(lerp(c2b, c1b, percentage));

        text.textContent =  value.current + unit;
        div.style.background = 
            `linear-gradient(90deg, var(--secondary) 0%, rgb(${r}, ${g}, ${b}) ${percentage*100}%, white ${percentage*100}%)`;

        text.style.background = 
            `linear-gradient(90deg, white ${percentage*100}%, rgb(${r}, ${g}, ${b}) ${percentage*100}%, var(--primary) 100%)`;
        text.style.webkitBackgroundClip = 'text';
        text.style.backgroundClip = 'text';
        text.style.color = 'transparent';
    }
    
    const sliderHandler = (event) => {
        const div = document.querySelector("div.slider");

        if (!sliding.current) return;

        console.log(event.clientX);
        console.log(div.offsetWidth);
        
        let percentage = (event.clientX - div.getBoundingClientRect().left) / div.offsetWidth;

        console.log(percentage);

        value.current = Math.round(lerp(min/10, max, percentage/10)) * 10;
        value.current = clamp(value.current, min, max);

        updateSlider(percentage)
    };

    useEffect(() => {
        const handleKeyUp = (event) => {
            if (event.repeat) return;

            if ((event.key == "ArrowUp" || event.key == "ArrowRight") && value.current <= max - 10) {
                value.current += 10;
            }
            
            else if ((event.key == "ArrowDown" || event.key == "ArrowLeft") && value.current >= min + 10) {
                value.current -= 10;
            }

            let percentage = antiLerp(min, max, value.current);
            updateSlider(percentage);
        }

        document.addEventListener("keydown", handleKeyUp);

        return () => document.removeEventListener("keydown", handleKeyUp);
    }, []);


    return (
        <div 
            className="slider" 
            onMouseDown={(event) => {sliding.current  = true; sliderHandler(event)}}
            onMouseUp  ={(event) => {sliding.current = false; sliderHandler(event)}}
            onMouseMove={sliderHandler}
            style={{user_select: "none", cursor: "pointer"}}
            >
            <div 
                className='text' 
                style={{user_select: "none", cursor: "pointer", pointer_events: "none"}}
                >{value.current + unit}</div>
        </div>
    )
}

export default function StageSpectrEnterDist({round, city}) {
    return (
        <div className='background'>
            <div className='main-card'>
                <span className='subtitle'>Set the distance from...</span>
                <span className='title'>{city["name"] || "-city-"}</span>
                <div className="round-time">
                    <span style={{flex: 1}} className='sub-subtitle'>Round {round || "-"} </span>
                    <span style={{flex: 1}} className='sub-subtitle chrono'>
                        <Chrono  initSec={120} reverse={true} target={0}/>
                    </span>
                </div>
                {/* <span className='sub-subtitle'>Round {round || "n"}</span> */}
                <span></span>
                { /* min: 10km max: 20000km */ }
                <Slider defaultValue={10000} min={10} max={20000} unit="km"/>
                <button className='send-butt active'>Send</button>
            </div>
            <Earth
                size={"90vh"}
                camSpeed={0.5}
                rotSpeed={3.}
                pinList={[city]}
            />
        </div>
    );
}