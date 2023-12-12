/* Create users */
INSERT INTO users (username, password, api_key) VALUES ('Zaid', 'password1', 'rfcbpjzye3tl62w37hympz4mwbj14895esm4iqpi');
INSERT INTO users (username, password, api_key) VALUES ('Jeff', 'password2', 'lq43778yoyyvwrug57a3vuveh6glczg5wccp4s31');
INSERT INTO users (username, password, api_key) VALUES ('salute', 'password3', 'tpv9rgr120yemeefmtr8mctmpkdhnds0abmuw4vr');

/* Create channels */
INSERT INTO channels (channel_name) VALUES ('Music');
INSERT INTO channels (channel_name) VALUES ('Academics');
INSERT INTO channels (channel_name) VALUES ('Sports');

/* Create main channel messages (i.e., messages that are not replies to other messages)*/
INSERT INTO messages (user_id, channel_id, body) VALUES (1, 1, 'My name is Zaid and I love music!');
INSERT INTO messages (user_id, channel_id, body) VALUES (3, 1, 'My name is salute and I love music!');
INSERT INTO messages (user_id, channel_id, body) VALUES (2, 1, 'This should be the third message in the Music channel');

INSERT INTO messages (user_id, channel_id, body) VALUES (2, 2, 'My name is Jeff and I love school!');
INSERT INTO messages (user_id, channel_id, body) VALUES (1, 2, 'My name is Zaid and I do not care too much for school!');

INSERT INTO messages (user_id, channel_id, body) VALUES (3, 3, 'My name is salute and I do not care too much for sports!');

/* Create messages that are replies to other messages */
INSERT INTO messages (user_id, channel_id, body, reply_id) VALUES (2, 1, 'Your name is salute and you love music?', 2);
INSERT INTO messages (user_id, channel_id, body, reply_id) VALUES (3, 1, 'Yup. Follow me on SoundCluond please.', 2);
INSERT INTO messages (user_id, channel_id, body, reply_id) VALUES (1, 3, 'Same here.', 6);
INSERT INTO messages (user_id, channel_id, body, reply_id) VALUES (2, 3, 'Agree. Sports suck.', 6);

/*Initialize the last_viewed table for all combinations of pre-existing users and channels*/
INSERT INTO last_viewed (user_id, channel_id) VALUES (1, 1);
INSERT INTO last_viewed (user_id, channel_id) VALUES (1, 2);
INSERT INTO last_viewed (user_id, channel_id) VALUES (1, 3);
INSERT INTO last_viewed (user_id, channel_id) VALUES (2, 1);
INSERT INTO last_viewed (user_id, channel_id) VALUES (2, 2);
INSERT INTO last_viewed (user_id, channel_id) VALUES (2, 3);
INSERT INTO last_viewed (user_id, channel_id) VALUES (3, 1);
INSERT INTO last_viewed (user_id, channel_id) VALUES (3, 2);
INSERT INTO last_viewed (user_id, channel_id) VALUES (3, 3);


/* Create a few reactions: */
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('smile', 1, 3);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('heart', 2 , 2);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('smile', 3, 3);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('heart', 4, 1);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('sparkles', 5, 2);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('smile', 6, 3);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('heart', 7, 1);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('eyes', 8, 2);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('heart', 9, 3);
INSERT INTO reactions (emoji, message_id, user_id) VALUES ('fire', 10, 1);
