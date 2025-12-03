import sqlite3 as sql
import pandas as pd

def getUserData(user_id) -> dict:
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.close()
    conn.close()
    
    return dict(df.iloc[0])