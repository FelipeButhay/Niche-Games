import sqlite3 as sql
import pandas as pd
import random as rand

def get_first_city():
    conn = sql.connect("assets/city_shii_databases/countryInfo.db")
    c = conn.cursor()
    
    c.execute("""
        SELECT (capital) FROM countries WHERE id = ?
    """, (rand.randint(1, 201),))
    
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.close()
    conn.close()
    
    return (
        df.iloc[0]["capital"], 
        df.iloc[0]["capital_lat"],
        df.iloc[0]["capital_lon"]
    )