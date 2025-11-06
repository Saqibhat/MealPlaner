import sqlite3
from werkzeug.security import generate_password_hash

def create_tables(conn):
    tables = [
        """
        CREATE TABLE IF NOT EXISTS users (
            userid INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            passwordhash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS meals (
            mealid INTEGER PRIMARY KEY AUTOINCREMENT,
            userid INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL CHECK(type IN ('frokost', 'lunsj', 'middag', 'snack')),
            prep_time INTEGER,
            difficulty TEXT CHECK(difficulty IN ('enkel', 'middels', 'vanskelig')),
            FOREIGN KEY(userid) REFERENCES users(userid) ON DELETE CASCADE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS meal_plan (
            planid INTEGER PRIMARY KEY AUTOINCREMENT,
            userid INTEGER NOT NULL,
            mealid INTEGER NOT NULL,
            day TEXT NOT NULL CHECK(day IN ('man', 'tir', 'ons', 'tor', 'fre', 'lør', 'søn')),
            meal_type TEXT NOT NULL CHECK(meal_type IN ('frokost', 'lunsj', 'middag')),
            FOREIGN KEY(userid) REFERENCES users(userid) ON DELETE CASCADE,
            FOREIGN KEY(mealid) REFERENCES meals(mealid) ON DELETE CASCADE,
            UNIQUE(userid, day, meal_type)
        )
        """,
        """

        CREATE TABLE IF NOT EXISTS ingredients(
            ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
            mealid INTEGER NOT NULL,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            unit TEXT NOT NULL,
            FOREIGN KEY(mealid) REFERENCES meals(mealid) ON DELETE CASCADE
        )
        """
    ]

    cur = conn.cursor()
    for t in tables:
        cur.execute(t)
    conn.commit()
    cur.close()
    print("Tabeller opprettet.")

def insert_test_data(conn):
    cur = conn.cursor()
    # Testbrukere
    users = [
        ("sara", generate_password_hash("Test123")),
        ("ola", generate_password_hash("Passord123"))
    ]
    cur.executemany("INSERT INTO users (username, passwordhash) VALUES (?, ?)", users)
    conn.commit()

    # Hent bruker-IDer
    cur.execute("SELECT userid FROM users WHERE username = 'sara'")
    sara_id = cur.fetchone()[0]

    # Måltider
    meals = [
        (sara_id, "Havregrøt", "Med bær og nøtter", "frokost", 10, "enkel"),
        (sara_id, "Kyllingsalat", "Med avokado", "lunsj", 15, "enkel"),
        (sara_id, "Laks med grønnsaker", "Ovnsbakt", "middag", 30, "middels")
    ]
    cur.executemany("INSERT INTO meals (userid, title, description, type, prep_time, difficulty) VALUES (?, ?, ?, ?, ?, ?)", meals)
    conn.commit()

    # Hent måltids-IDer
    cur.execute("SELECT mealid FROM meals WHERE userid = ?", (sara_id,))
    meal_ids = [row[0] for row in cur.fetchall()]

    # Ingredienser ID-er
    ingredients=[
        (meal_ids[0], "Havregryn",1, "dl"),
        (meal_ids[0], "Melk", 2, "dl"),
        (meal_ids[1], "Kyllingfilet", 200, "g"),
        (meal_ids[1], "Avokado", 1, "stk"),
        (meal_ids[2], "Laks", 300, "g"),
        (meal_ids[2], "Brokkoli", 150, "g")

    ]
    cur.executemany("""
        INSERT INTO ingredients (mealid, name, amount, unit)
        VALUES (?, ?, ?, ?)
    """, ingredients)
    conn.commit()

    # Ukeplan (man–søn)
    days = ['man', 'tir', 'ons', 'tor', 'fre', 'lør', 'søn']
    meal_types = ['frokost', 'lunsj', 'middag']
    plan = []
    for i, day in enumerate(days):
        for j, meal_type in enumerate(meal_types):
            mealid = meal_ids[j % len(meal_ids)]  # Fordel måltider
            plan.append((sara_id, mealid, day, meal_type))
    cur.executemany("INSERT INTO meal_plan (userid, mealid, day, meal_type) VALUES (?, ?, ?, ?)", plan)
    conn.commit()
    print("Testdata lagt inn.")
    cur.close()


def check_meals(conn):
    cur = conn.cursor()
   # cur.execute("SELECT * FROM meals WHERE type IN ('lunsj', 'Lunsj', 'LUNSJ')")
    cur.execute("SELECT mealid, title, type FROM meals WHERE LOWER(type) = 'lunsj'")
    lunsj_meals = cur.fetchall()
    print(f"Fant {len(lunsj_meals)} lunsj-måltider:")
    for meal in lunsj_meals:
        #print(f"ID: {meal['mealid']}, Tittel: {meal['title']}, Type: {meal['type']}")
        print(f"ID: {meal[0]}, Tittel: {meal[1]}, Type: {meal[2]}")


if __name__ == "__main__":
    conn = sqlite3.connect("database.db")
    conn.execute("PRAGMA foreign_keys = ON")
    create_tables(conn)
    insert_test_data(conn)
    check_meals(conn)
    conn.close()
