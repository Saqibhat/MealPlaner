from setup_db import *
from flask import Flask, render_template, request, redirect, url_for, flash, session, g, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os



#app = Flask(__name__)

app = Flask(__name__, 
           static_folder='../static',  # Peker opp ett nivå og inn i static
           template_folder='../templates')  # Peker opp ett nivå og inn i templates
app.debug = True
app.secret_key = 'some_secret'
DATABASE= "database.db"

#db -tilkobling

def get_db():
    if "db" not in g: 
        g.db= sqlite3.connect(DATABASE)
        g.db.row_factory= sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    db=g.pop("db", None)
    if db: 
        db.close()



@app.route("/")
def index(): 
    if "userid" not in session: 
        return redirect ("/login")
    return render_template("index.html", username=session["username"])

#authentication routes

@app.route("/login", methods=["GET", "POST"])
def login(): 
    if request.method == "POST": 
        username = request.form["username"]
        pw= request.form["password"]
        db=get_db()
        user= db.execute("SELECT * FROM users WHERE username= ?", (username,)).fetchone() 
        if user and check_password_hash(user["passwordhash"], pw):
            session["userid"] = user["userid"]
            session["username"]= user["username"]
            return redirect("/")
        return render_template("login.html", error= "Feil brukernavn  eller passord")
    return render_template("login.html")

@app.route("/register", methods= ["POST"])
def register():
    username= request.form["username"]
    password = request.form["password"]
    db= get_db()
    hash= generate_password_hash(password)
    try: 
        db.execute("INSERT INTO users(username, passwordhash) VALUES (?, ?)", (username, hash))
        db.commit()
        return redirect("/login")
    except: 
        return render_template("login.html", error= "Brukernavn finnes fra før")


@app.route("/logout", methods= ["POST"])
def logout(): 
    session.clear()
    return redirect("/login")



#måltids -API

@app.route("/api/meals", methods=['GET'])
def get_meals(): 
    if "userid" not in session: 
        return jsonify([])
    meal_type= request.args.get('type', '').lower() #convert to lowercase
    query = 'SELECT * FROM meals WHERE userid=?'
    params= [session['userid']]
    if meal_type:
        query +=' AND LOWER(type) =?' # case -insensitive comparison
        params.append(meal_type)

    db= get_db()
    meals= db.execute(query, params).fetchall()
    return jsonify([dict(meal) for meal in meals])



@app.route("/api/meals", methods= ["POST"])
def add_meal(): 
    if "userid" not in session: 
        return jsonify({'error': 'Unauthorized'}),401
    data= request.get_json()
    db=get_db()
    db.execute ("INSERT INTO meals (userid, title, type, description) VALUES(?, ?, ?, ?)", 
                (session["userid"], data["title"], data["type"], data["description"]))
    db.commit()
    return jsonify({'status':'success'}),201

#Ingrediens api

# Ingrediens-API (kun én versjon)

@app.route('/api/meals/<int:mealid>/ingredients', methods=['GET', 'POST'])
def handle_ingredients(mealid):
    if 'userid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    db = get_db()
    
    if request.method == 'GET':
        ingredients = db.execute(
            "SELECT i.* FROM ingredients i JOIN meals m ON i.mealid = m.mealid "
            "WHERE i.mealid = ? AND m.userid = ?",
            (mealid, session['userid'])
        ).fetchall()
        return jsonify([dict(ing) for ing in ingredients])
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data or 'name' not in data or 'amount' not in data or 'unit' not in data:
                return jsonify({'error': 'Missing required fields'}), 400

            try:
                amount = float(data['amount'])
            except ValueError:
                return jsonify({'error': 'Invalid amount value'}), 400

            meal = db.execute(
                "SELECT * FROM meals WHERE mealid = ? AND userid = ?",
                (mealid, session['userid'])
            ).fetchone()
            
            if not meal:
                return jsonify({'error': 'Meal not found'}), 404
            
            cur = db.execute(
                "INSERT INTO ingredients (mealid, name, amount, unit) VALUES (?, ?, ?, ?)",
                (mealid, data['name'], amount, data['unit'])
            )
            db.commit()
            return jsonify({
                'status': 'success',
                'ingredient_id': cur.lastrowid
            }), 201
        except sqlite3.Error as e:
            db.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        


        
@app.route("/api/ingredients/<int:ingredient_id>", methods=["PUT"])
def update_ingredient(ingredient_id):
    if "userid" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    required_fields = ['name', 'amount', 'unit']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        amount = float(data["amount"])
    except ValueError:
        return jsonify({"error": "Invalid amount value"}), 400
    
    db = get_db()
    
    try:
        # Check ingredient belongs to user
        ingredient = db.execute("""
            SELECT i.* FROM ingredients i
            JOIN meals m ON i.mealid = m.mealid
            WHERE i.ingredient_id = ? AND m.userid = ?
        """, (ingredient_id, session["userid"])).fetchone()
        
        if not ingredient:
            return jsonify({"error": "Ingredient not found"}), 404
        
        # Update ingredient
        db.execute("""
            UPDATE ingredients 
            SET name = ?, amount = ?, unit = ?
            WHERE ingredient_id = ?
        """, (data["name"], amount, data["unit"], ingredient_id))
        db.commit()
        
        # Return updated ingredient
        updated_ingredient = db.execute(
            "SELECT * FROM ingredients WHERE ingredient_id = ?",
            (ingredient_id,)
        ).fetchone()
        
        return jsonify({
            "status": "updated",
            "ingredient": dict(updated_ingredient)
        })
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500



@app.route("/api/ingredients/<int:ingredient_id>", methods=["DELETE"])
def delete_ingredient(ingredient_id):
    if "userid" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = get_db()
    try:
    # Sjekk at ingrediensen tilhører brukeren
        ingredient = db.execute("""
            SELECT i.* FROM ingredients i
            JOIN meals m ON i.mealid = m.mealid
            WHERE i.ingredient_id = ? AND m.userid = ?
        """, (ingredient_id, session["userid"])).fetchone()
        
        if not ingredient:
            return jsonify({"error": "Ingredient not found"}), 404
        
        db.execute("DELETE FROM ingredients WHERE ingredient_id = ?", (ingredient_id,))
        db.commit()
        return jsonify({"status": "deleted"})
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({"error": "Databasefeil: " + str(e)}), 500



@app.route("/api/meals/<int:mealid>", methods=["DELETE"])
def delete_meal(mealid): 
    if 'userid' not in session:
        return jsonify({'error': 'Unauthorize'}), 401
   
    db= get_db()
    db.execute('DELETE FROM meals WHERE mealid = ? AND userid = ?', (mealid, session['userid']))
    db.commit()
    return jsonify({'status': 'success'})



#update meal:
@app.route("/api/meals/<int:mealid>", methods=['PUT'])
def update_meal(mealid):
    if 'userid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    if not data or 'title' not in data or 'type' not in data:
        return jsonify({'error': 'Mangler påkrevde felt'}), 400


    db = get_db()
    db.execute("""
        UPDATE meals SET title=?, type=?, description=?
        WHERE mealid=? AND userid=?
    """, (data['title'], data['type'], data.get('description', ''), mealid, session['userid']))
    db.commit()
    return jsonify({'status': 'updated'})







#user meal plan routes 
@app.route('/api/user-meals', methods=['GET'])
def get_user_meals():
    if 'userid' not in session:
        return jsonify([])

    db = get_db()
    meals = db.execute("""
        SELECT mp.planid AS id, m.title, m.description, mp.day, mp.meal_type
        FROM meal_plan mp
        JOIN meals m ON mp.mealid = m.mealid
        WHERE mp.userid = ?
        ORDER BY mp.day, 
            CASE mp.meal_type 
                WHEN 'frokost' THEN 1
                WHEN 'lunsj' THEN 2
                WHEN 'middag' THEN 3
            END
    """, (session['userid'],)).fetchall()

    return jsonify([dict(meal) for meal in meals])







@app.route('/api/user-meals', methods= ['POST'])
def add_to_plan():
    if 'userid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    

    data = request.get_json()
    if not data or 'mealid' not in data or 'day' not in data or 'meal_type' not in data:
         return jsonify({'error':'Ugyldig forespørsel'}), 400
    db = get_db()
    try: 
        #sjekk om måltidet eksisterer og tilhærer brukeren
        meal =db.execute(
              "SELECT * FROM meals WHERE mealid = ? AND userid = ?",
            (data['mealid'], session['userid'])
        ).fetchone()

        if not meal:
            return jsonify({'error': 'Måltid ikke funnet'}), 404

        
        #first remove any existing meal for this day/type
        db.execute("""
            DELETE FROM meal_plan 
            WHERE userid = ? AND day = ? AND meal_type = ?
        """, (session['userid'], data['day'], data['meal_type']))

    #legg til nytt måltid
        db.execute("""
                    INSERT INTO meal_plan (userid, mealid, day, meal_type)
                    VALUES (?, ?, ?,?)
                    """, (session['userid'], data['mealid'], data['day'], data['meal_type']))
        db.commit()
        return jsonify({'status': 'success', 'id':db.execute("SELECT last_insert_rowid()").fetchone()[0]})
    
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({'error': 'Databasefeil:' + str(e)}), 500


@app.route('/api/user-meals/<int:plan_id>', methods=['DELETE'])
def remove_from_plan(plan_id):
    if 'userid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    db = get_db()
    try:
        # Sjekk om planen tilhører brukeren før sletting
        plan = db.execute(
            "SELECT * FROM meal_plan WHERE planid = ? AND userid = ?",
            (plan_id, session['userid'])
        ).fetchone()

        if not plan:
            return jsonify({'error': 'Plan not found or not owned by user'}), 404

        db.execute(
            "DELETE FROM meal_plan WHERE planid = ? AND userid = ?",
            (plan_id, session['userid'])
        )
        db.commit()
        return jsonify({'status': 'success'})
    except sqlite3.Error as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500








@app.route('/api/meals/<int:mealid>', methods=['GET'])
def get_meal(mealid):
    if 'userid' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    db = get_db()
    meal = db.execute("""
        SELECT * FROM meals 
        WHERE mealid = ? AND userid = ?
    """, (mealid, session['userid'])).fetchone()
    
    if not meal:
        return jsonify({'error': 'Meal not found'}), 404
        
    return jsonify(dict(meal))







if __name__== "__main__": 
    if not   os.path.exists(DATABASE):
        #from setup_db import create_tables, insert_test_data
        conn= sqlite3.connect(DATABASE)
        create_tables(conn)
        insert_test_data(conn)
        conn.close()
    app.run(debug= True)