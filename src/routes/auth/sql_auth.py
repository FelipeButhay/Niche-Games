import sqlite3 as sql
import pandas as pd
import re

from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum

USERNAME_REGEX=r"^[a-zA-Z0-9_]{3,20}$"
EMAIL_REGEX=r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
PASSWORD_REGEX=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$"

#EXIT CODES
class authExitCodes(Enum):
    SUCCESS = 0
    
    UNKNOWN = 1
    
    EMAIL_EXISTS = 2
    USERNAME_EXISTS = 3
    ACCOUNT_EXISTS = 4
    
    INVALID_DATA = 5
    INVALID_PASSWORD = 6

def registerUser(username: str, email:str, password: str) -> tuple[int, int]:
    exitCode = authExitCodes.UNKNOWN
    
    if  not re.match(USERNAME_REGEX, username) or \
        not re.match(EMAIL_REGEX,       email) or \
        not re.match(PASSWORD_REGEX, password):
            return authExitCodes.INVALID_DATA, None
    
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    password_hash = generate_password_hash(password)
    
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    username_df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    email_df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    if email_df.empty and username_df.empty:
        c.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", (username, email, password_hash))
        conn.commit()
        exitCode = authExitCodes.SUCCESS
        
    elif email_df.empty and not username_df.empty:
        exitCode = authExitCodes.USERNAME_EXISTS
          
    elif not email_df.empty and username_df.empty:
        exitCode = authExitCodes.EMAIL_EXISTS
        
    elif email_df.iloc[0]["username"] == username:
        exitCode = authExitCodes.ACCOUNT_EXISTS
        
    user_id = None
    if exitCode == authExitCodes.SUCCESS:
        user_id = c.lastrowid
        
    c.close()
    conn.close()
        
    return exitCode, user_id

def verifyUser(email:str, password: str) -> tuple[int, int]:
    exitCode = authExitCodes.UNKNOWN
    
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    user_id = None
    if df.empty:
        exitCode = authExitCodes.INVALID_DATA
        
    elif check_password_hash(df.iloc[0]["password_hash"], password):
        exitCode = authExitCodes.SUCCESS
        user_id = int(df.iloc[0]["id"])
        
    else:
        exitCode = authExitCodes.INVALID_PASSWORD
        
    c.close()
    conn.close()
        
    return exitCode, user_id

def getUserData(user_id) -> dict:
    conn = sql.connect("databases/users.db")
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    df = pd.DataFrame(c.fetchall(), columns=[desc[0] for desc in c.description])
    
    c.close()
    conn.close()
    
    return dict(df.iloc[0])