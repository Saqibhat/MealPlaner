import sqlite3
def get_user_by_name(conn, username): 
    cur= conn.cursor()
    cur.execute("SELECT userid, username FROM users WHERE username=?", (username, ))
    row = cur.fetchone()
    if row: 
        return{"userid":row[0], "username": row[1]}
    return None
def get_hash_for_login(conn, username):
    cur=conn.cursor()
    cur.execute("SELECT passwordhash FROM users WHERE username=?", (username,))
    row= cur.fetchone()
    return row[0] if row else None
def add_user(conn, username, pw_hash):
    try:
        cur= conn.cursor()
        cur.execute("INSERT INTO users( username, passwordhash) VALUES (?,?)",(username, pw_hash))
        conn.commit()
        return cur.lastrowid
    except:
        return-1
    




