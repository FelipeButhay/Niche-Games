import psycopg2 as pg
import sqlite3 as sql
import pandas as pd
import random as rand
import src.tools.tools as tools
from enum import IntEnum
import os

class Screens(IntEnum):
    NULL = 0
    
    WAITING = 1
    
    PLAYER_WAITING = 2
    SPECTR_ENTER_DIST = 5
    
    PLAYER_ENTER_CITY = 3
    SPECTR_WAITING = 4
    
    RESULTS = 6
    
POSTGRE_PASSWORD = os.getenv("POSTGRE_PASSWORD")
    
def get_first_city():
    conn = sql.connect("assets/city_shii_databases/countryInfo.db")
    c = conn.cursor()
    
    c.execute("""
        SELECT capital, capital_lat, capital_lon FROM countries WHERE id = ?
    """, (rand.randint(1, 201),))
    
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.close()
    conn.close()
    
    return {
        "name": df.iloc[0]["capital"], 
        "lat": df.iloc[0]["capital_lat"],
        "lon": df.iloc[0]["capital_lon"]
    }
    
def get_cities(query: str) -> list:
    conn = pg.connect(
        dbname="cities500pg",
        user="postgres",
        password=POSTGRE_PASSWORD,
        host="localhost"
    )
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, lat, lon, cc, pop, similarity(name, %s) AS score
        FROM cities
        WHERE name %% %s
        ORDER BY score DESC
        LIMIT 16;
    """, (query, query))

    results = cur.fetchall()
    results = [ {
            "id":   r[0],
            "name": r[1],
            "lat":  r[2],
            "lon":  r[3],
            "cc":   r[4],
            "pop":  r[5]
        } for r in results]
    results.sort(key=lambda x: x["pop"], reverse=True)

    cur.close()
    conn.close()
    return results

def get_city_id(city_id):
    conn = pg.connect(
        dbname="cities500pg",
        user="postgres",
        password=POSTGRE_PASSWORD,
        host="localhost"
    )
    cur = conn.cursor(cursor_factory=pg.extras.DictCursor)

    cur.execute("""
        SELECT id, name, lat, lon, cc, pop FROM ciudades WHERE id == %s;
    """, (city_id,)) 

    results = cur.fetchall()

    cur.close()
    conn.close()
    return {
        "id":   results[0][0],
        "name": results[0][1],
        "lat":  results[0][2],
        "lon":  results[0][3],
        "cc":   results[0][4],
        "pop":  results[0][5]
    }