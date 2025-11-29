import sqlite3 as sql
import pandas as pd
from enum import Enum

# USERS DATABASE POSSIBLE STATUS
# rejected, accepted, pending

#EXIT CODES
class friendsExitCodes(Enum):
    SUCCESS = 0
    
    UNKNOWN = 1
    
    INEXISTENT_USER = 2
    EMPTY_DATA = 3
    EXISTENT_REQUEST = 4

def user_exists(username: str, user_id: str):
    if  (username == None or username == "") and \
        (user_id == None or user_id == ""):
            return friendsExitCodes.EMPTY_DATA, None
    
    conn = sql.connect("databases/users.db")
    c = conn.cursor()

    exit_code = friendsExitCodes.UNKNOWN

    if username == None:
        c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    elif user_id == None:
        c.execute("SELECT * FROM users WHERE username = ?", (username,))
        
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    if df.empty:
        exit_code = friendsExitCodes.INEXISTENT_USER
        identifier = None
    else:
        exit_code = friendsExitCodes.SUCCESS
        identifier = df.at[0, "id"]
    
    c.close()
    conn.close()
    
    return exit_code, identifier

def send_request(sender_id: str, receiver_id: str):
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    c.execute("""
        SELECT * FROM friendships WHERE 
        (sender_id = ? AND receiver_id = ?) OR
        (sender_id = ? AND receiver_id = ?) """, 
        (sender_id, receiver_id, receiver_id, sender_id)
    )
    
    exit_code = friendsExitCodes.UNKNOWN
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    if df.empty:
        c.execute("INSERT INTO friendships (sender_id, receiver_id) VALUES (?, ?)", (sender_id, receiver_id))
        exit_code = friendsExitCodes.SUCCESS
    else:
        exit_code = friendsExitCodes.EXISTENT_REQUEST
    
    c.close()
    conn.close()
    
    return exit_code
    
def get_friends(user_id: str):
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    c.execute("""
        SELECT u.id, u.username
        FROM friendships f, users u
        
        WHERE ((f.sender_id = ? AND u.id = f.receiver_id)
        OR (f.receiver_id = ? AND u.id = f.sender_id))
        AND status = 'accepted'
    """, (user_id,user_id))
    
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.close()
    conn.close()
    
    return [dict(d) for d in df.iloc]
    
def get_requests(user_id: str):
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    c.execute("""
        SELECT u.id, u.username
        FROM friendships f, users u
        
        WHERE ((f.sender_id = ? AND u.id = f.receiver_id)
        OR (f.receiver_id = ? AND u.id = f.sender_id))
        AND status = 'pending'
    """, (user_id,user_id))
    
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.close()
    conn.close()
    
    return [dict(d) for d in df.iloc]