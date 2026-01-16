import { useState, useEffect, useRef } from 'react';

export default function Chrono({initSec, reverse, target, func}) {
    const [segundos, setSegundos] = useState(initSec || 0);
    const [activo, setActivo] = useState(true);
    const funcEjecutada = useRef(false);

    const incr = reverse ? -1 : 1;

    useEffect(() => {
        let interval;
        let trigger;

        if (activo) {
            interval = setInterval(() => {
                setSegundos((prev) => prev + incr);
            }, 1000);

            trigger = setInterval(() => {
                if (!funcEjecutada.current) {
                    funcEjecutada.current = true;
                    func();
                }
                clearInterval(trigger)
            }, (target - initSec - 1) * incr * 1000);
        }

        return () => {
            clearInterval(interval);
        };
    }, [activo]);

    const formatearTiempo = (s) => {
        if (s <= 0) return "00:00";

        const minutos = Math.floor(s / 60);
        const segundos = s % 60;
        return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    };

    return <></>;
    // return formatearTiempo(segundos);
}
