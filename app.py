from flask import Flask, render_template, request, jsonify
from functools import wraps
import configparser
import io
import datetime
from datetime import timedelta
import json
import string
import random
import sqlite3
from flask import * # Flask, g, redirect, render_template, request, url_for


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0



# Database management functions:
def dict_from_row(row):
    return dict(zip(row.keys(), row)) 
        

def dict_from_list_from_row(list):
    messages = {}
    for i in range (len(list)):
        messages.update({"message" + str(i):dict_from_row(list[i])})
    return messages

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/belay.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    # print("query_db")
    # print(cursor)
    rows = cursor.fetchall()
    # print(rows)
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None


#Helper functions
session_tokens = set()
def generate_session_token():
    session_token =  ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(6))
    while (session_token in session_tokens):
        session_token =  ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(6))
    session_tokens.add(session_token)
    return session_token

@app.route('/')
def index(chat_id=None):
    return app.send_static_file('index.html')


"""
-------------------------
-------------------------
-------------------------
"""
# Login and signup API's
@app.route('/api/login', methods = ['POST'])
def login():
    username = request.get_json()['username']
    password = request.get_json()['password']
    row = query_db('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], one = True)
    row_dict = row
    if row is not None:
        row_dict = dict_from_row(row)
    else:
        return {}, 300
    token = generate_session_token()
    return {"data": row_dict, "token": token}, 200

@app.route('/api/signup', methods=['POST'])
def signup ():
    username = request.get_json()['username']
    password = request.get_json()['password']
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    query_db("INSERT INTO users(username, password, api_key) VALUES(?, ?, ?)", [username, password, api_key])
    return {}, 200



"""
-------------------------
-------------------------
-------------------------
"""
# Change username and change password API's
@app.route('/api/changeusername', methods=['POST'])
def changeusername():
    user_id = request.get_json()['user_id']
    new_username = request.get_json()['new_username']
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        query_db("UPDATE users SET username = ? WHERE user_id = ?", [new_username, user_id])
        return {}, 200
    return {}, 300

@app.route('/api/changepassword', methods=['POST'])
def changepassword():
    user_id = request.get_json()['user_id']
    new_password = request.get_json()['new_password']
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        query_db("UPDATE users SET password = ? WHERE user_id = ?", [new_password, user_id])
        return {}, 200
    return {}, 300




@app.route('/api/displaychannelnames', methods=['GET'])
def displaychannelnames ():
    user_id = request.headers.get('user_id')
    print(user_id)
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        channels = query_db("SELECT * FROM channels")
        channels_dict = channels
        if channels is not None:
            channels_dict = dict_from_list_from_row(channels)
        return jsonify(channels_dict), 200
    else:
        return {}, 300

@app.route('/api/loadmessages', methods=['GET'])
def loadmessages():
    print("Are we even making it to loadmessages????")
    user_id = request.headers.get('user_id')
    channel_name = request.headers.get('channel_name')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        channel_id_query = query_db('SELECT channel_id FROM channels WHERE channel_name = ?', [channel_name], one=True)
        channel_id_dict = dict_from_row(channel_id_query)
        ch_id = channel_id_dict['channel_id']
        msg_query = query_db("SELECT u.username, m.message_id, m.time_stamp, m.body FROM messages m LEFT JOIN users u ON m.user_id = u.user_id WHERE m.channel_id = ? AND m.reply_id IS NULL ORDER BY m.message_id DESC", [ch_id])
        msg_dict = msg_query
        if msg_query is None:
            messages = {}
            return jsonify(messages), 200
        msg_dict = dict_from_list_from_row(msg_query)
        messages = {"content": dict_from_list_from_row(msg_query)}

        count_query = query_db("SELECT reply_id, COUNT(*) AS cnt FROM messages WHERE channel_id = ? GROUP BY reply_id", [ch_id])
        count_dict = count_query
        count_dict = dict_from_list_from_row(count_query)   
        messages["count"] = count_dict
        return jsonify(messages), 200
    else:
        return {}, 300


@app.route('/api/getmessages', methods=['GET'])
def getmessages():
    #print("----- calling getmessage method!")
    user_id = request.headers.get('user_id')
    channel_name = request.headers.get('channel_name')
    #print('for channel')
    #print(channel_name)
    last_id = request.headers.get('last_msg_ID')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):        
        channel_id_query = query_db('SELECT channel_id FROM channels WHERE channel_name = ?', [channel_name], one=True)
        channel_id_dict = dict_from_row(channel_id_query)
        #print(channel_id_dict)
        channel_id = channel_id_dict['channel_id']
        msg_query = query_db("SELECT u.username, m.message_id, m.time_stamp, m.body FROM messages m LEFT JOIN users u ON m.user_id = u.user_id WHERE m.channel_id = ? AND m.reply_id IS NULL AND m.message_id > ? ORDER BY m.message_id DESC", [channel_id, last_id])
        #print(msg_query)
        message_dict = msg_query
        #print(message_dict)
        if msg_query is None:
            messages = {}
            return jsonify(messages), 200
        #print('Are we making it to here?')
        message_dict = dict_from_list_from_row(msg_query)
        messages = {"content": message_dict}

        count_query = query_db("SELECT reply_id, COUNT(*) AS cnt FROM messages WHERE channel_id = ? GROUP BY reply_id", [channel_id])
        count = dict_from_list_from_row(count_query)
        messages["count"] = count
        return jsonify(messages), 200
    else:
        return {}, 300


@app.route('/api/loadreplies', methods=['GET'])
def loadreplies():
    user_id = request.headers.get('user_id')
    message_id = request.headers.get('message_id')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        msg_query = query_db("SELECT u.username, m.message_id, m.time_stamp, m.body FROM messages m LEFT JOIN users u ON m.user_id = u.user_id WHERE m.reply_id = ? ORDER BY m.message_id", [message_id])
        message_dict = msg_query
        if msg_query is not None:
            message_dict = dict_from_list_from_row(msg_query)
        messages = message_dict
        #print(messages)
        return jsonify(messages), 200
    else:
        return {}, 300


@app.route('/api/createchannel', methods=['POST'])
def createchannel ():
    user_id = request.headers.get('user_id')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        channel_name = request.get_json()['channel_name']
        query_db("INSERT INTO channels(channel_name) VALUES (?)", [channel_name])
        return {}, 200
    else:
        return {}, 300

@app.route('/api/postmessage', methods=['POST'])
def postmessage():
    user_id = request.headers.get('user_id')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        channel_name = request.get_json()['channel_name']
        message = request.get_json()['message']
        channel_id_query = query_db('SELECT channel_id FROM channels WHERE channel_name = ?', [channel_name], one=True)
        channel_id_dict = dict_from_row(channel_id_query)
        channel_id = channel_id_dict['channel_id']
        query_db("INSERT INTO messages(user_id, channel_id, body) VALUES(?, ?, ?)", [user_id, channel_id, message])
        return {}, 200
    else:
        return {}, 300


@app.route('/api/postreply', methods=['POST'])
def postreply():
    user_id = request.headers.get('user_id')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        channel_name = request.get_json()['channel_name']
        channel_id_query = query_db('SELECT channel_id FROM channels WHERE channel_name = ?', [channel_name], one=True)
        channel_id_dict = dict_from_row(channel_id_query)
        channel_id = channel_id_dict['channel_id']
        message = request.get_json()['message']
        reply_id = request.get_json()['reply_id']
        query_db("INSERT INTO messages(user_id, channel_id, body, reply_id) VALUES(?, ?, ?, ?)", [user_id, channel_id, message, reply_id])
        return {}, 200
    else:
        return {}, 300


# Add emoji APIs
@app.route('/api/addemoji', methods=['POST'])
def addemoji():
    user_id = request.headers.get('user_id')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        emoji = request.get_json()['emoji'] 
        message_id = request.get_json()['message_id']
        row = query_db('SELECT * FROM reactions WHERE emoji = ? AND message_id = ? AND user_id = ?', [emoji, message_id, user_id])
        if row is None:
            query_db("INSERT INTO reactions(emoji, message_id, user_id) VALUES(?, ?, ?)", [emoji, message_id, user_id])
        return {}, 200
    else:
        return {}, 300

@app.route('/api/showreactions', methods=['POST'])
def showreactions():
    print('calling show reactions')
    user_id = request.headers.get('user_id')
    print('user id is ' +  user_id)
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        emoji = request.get_json()['emoji']
        message_id = request.get_json()['message_id']
        #user_id = request.get_json()['user_id']
        usernames = query_db('SELECT username FROM (SELECT emoji, message_id, users.user_id, username FROM reactions INNER JOIN users ON reactions.user_id = users.user_id) WHERE message_id = ? AND emoji = ?', [message_id, emoji])
        if usernames is None:
            return {}, 300
        user_dict = dict_from_list_from_row(usernames)
        #print(user_dict)
        return jsonify(user_dict), 200
    else:
        return {}, 301


@app.route('/api/getunreadcount', methods=['GET'])
def getunreadcount():
    user_id = request.headers.get('user_id')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):
        channel_name = request.headers.get('channel_name')
        channel_id_query = query_db('SELECT channel_id FROM channels WHERE channel_name = ?', [channel_name], one=True)
        channel_id_dict = dict_from_row(channel_id_query)
        channel_id = channel_id_dict['channel_id']
        #print(channel_id)
        last_id_query = query_db('SELECT last_viewed_id FROM last_viewed WHERE user_id = ? AND channel_id = ?', [user_id, channel_id], one=True)
        last_id_dict = dict_from_row(last_id_query)
        last_id = last_id_dict['last_viewed_id']
        count_query = query_db("SELECT COUNT(*) AS count FROM messages m LEFT JOIN users u ON m.user_id = u.user_id WHERE m.channel_id = ? AND m.reply_id IS NULL AND m.message_id > ?", [channel_id, last_id], one=True)
        count = count_query['count']
        return jsonify(count), 200
    else:
        return {}, 300

@app.route('/api/updatelastviewed', methods=['POST'])
def updatelastviewed():
    #print('calling updatelastviewed')
    user_id = request.headers.get('user_id')
    api_key = dict_from_list_from_row(query_db('SELECT api_key FROM users WHERE user_id = ?', [user_id]))   
    if("Bearer "+ api_key['message0']['api_key']== request.headers.get('Authorization')):    
        channel_name = request.get_json()['channel_name']
        channel_id_query = query_db('SELECT channel_id FROM channels WHERE channel_name = ?', [channel_name], one=True)
        channel_id_dict = dict_from_row(channel_id_query)
        channel_id = channel_id_dict['channel_id']
        last_id = request.get_json()['last_id']
        #user_id = request.get_json()['user_id']
        query_db('UPDATE last_viewed SET last_viewed_id = ? WHERE user_id = ? AND channel_id = ?', [last_id, user_id, channel_id])
        return {}, 200
    else:
        return {},300

@app.route('/api/initializelastviewedchannel', methods = ['POST'])
def initializelastviewedchannel():
    #print('calling initializelastviewed')
    channel_name = request.get_json()['channel_name']
    channel_id_query = query_db('SELECT channel_id FROM channels WHERE channel_name = ?', [channel_name], one=True)
    channel_id_dict = dict_from_row(channel_id_query)
    channel_id = channel_id_dict['channel_id']
    user_ids = query_db('SELECT user_id FROM users')
    for user_id_row in user_ids:
        user_id_dict = dict_from_row(user_id_row)
        query_db("INSERT INTO last_viewed (user_id, channel_id) VALUES (?, ?)", [user_id_dict['user_id'], channel_id])
    return {}, 200

@app.route('/api/initializelastvieweduser', methods = ['POST'])
def initializelastvieweduser():
    #print('calling initializelastvieweduser')
    user_name = request.get_json()['user_name']
    user_id_query = query_db('SELECT user_id FROM users WHERE username = ?', [user_name], one=True)
    user_id_dict = dict_from_row(user_id_query)
    user_id = user_id_dict['user_id']
    channel_ids = query_db('SELECT channel_id FROM channels')
    for channel_id_row in channel_ids:
        channel_id_dict = dict_from_row(channel_id_row)
        query_db("INSERT INTO last_viewed (user_id, channel_id) VALUES (?, ?)", [user_id, channel_id_dict['channel_id']])
    return {}, 200
