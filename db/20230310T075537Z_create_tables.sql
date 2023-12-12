/* Create user table */
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username VARCHAR(40) NOT NULL,
    password VARCHAR(40) NOT NULL,
    api_key VARCHAR(40),
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Create channel table */
CREATE TABLE channels(
    channel_id INTEGER PRIMARY KEY,
    channel_name VARCHAR(40),
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Create messages table */
CREATE TABLE messages(
    message_id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    channel_id INTEGER REFERENCES channels(channel_id),
    body TEXT,
    reply_id INTEGER DEFAULT NULL,
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Create last viewed message (for each user and channel) table */
CREATE TABLE last_viewed (
    user_id INTEGER REFERENCES users(user_id),
    channel_id INTEGER REFERENCES channels(channel_id),
    last_viewed_id INTEGER DEFAULT 0
); 

/* Create reactions table */
CREATE TABLE reactions (
    emoji VARCHAR(10),
    message_id REFERENCES messages(message_id), 
    user_id REFERENCES users(user_id)
); 
