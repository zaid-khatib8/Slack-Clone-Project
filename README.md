# Final Project: Belay (a Slack clone)

40 points
## NOTE: I collaborated with a peer in the course, Keval Hutheesing, and used the following resources to aid with various aspects of this project:
- Full Stack Realtime Chat App Tutorial: https://www.youtube.com/watch?v=MJzbJQLGehs
- jQuery tutorial: https://www.w3schools.com/jquery/
- Building Slack UI with pure HTML5, CSS3 and JavaScript: https://dev.to/sirneij/building-slack-ui-with-pure-html5-css3-and-javascript-the-power-of-css-grids-and-flexbox-4ban
- How to Use Fetch with Flask in JavaScript/Python: https://www.youtube.com/watch?v=exRAM1ZWm_s&t=9s

**DUE: Friday, March 10 by 5:30pm**

Create your own repo at: https://classroom.github.com/a/XbBPcBk8

## Introduction

As a capstone project for Web Development, we're going to combine the various front-end and back-end 
techniques we've learned over the course to produce a modern, database-backed single-page 
application. Specifically, we'll be building our own (significantly smaller in scope) version of the 
popular workplace messaging app Slack. We'll call our version 
[Belay](https://en.wikipedia.org/wiki/Belaying).

## Core Behavior

- Belay lets users send and read real-time chat messages that are organized into rooms called 
  Channels. Users see a list of all the channels on the server and can click one to enter that 
  channel. Inside, they see all the messages posted to that channel by any user, and can post their 
  own messages. All messages belong to a channel and all channels are visible to all users; we don't 
  need to implement private rooms or direct messages.
- Any user can create a new channel by supplying a display name. Channel names must be unique. If 
  you wish, You may choose to limit what characters are allowed in channel names.
- Like Slack, messages may be threaded as Replies in response to a message in a channel. Messages in 
  the channel will display how many replies they have if that number is greater than zero. We don't
  support nested threads; messages either belong directly to a channel or are replies in a thread to 
  a message that does, but replies can't have nested replies of their own.

## Submissions and Grading

Graders will have Python 3.11+ with Flask installed, and a local install of SQLite3 (which comes 
with Python). Because graders must use the same environment to evaluate submissions from multiple 
students, please do not require any additional programs or packages to be installed. In your 
submission, include a README with instructions for how to configure and run your app:
- Graders will start your app with a `flask run` command from the command line. Graders will have 
  their FLASK_APP environment variable set to "app," so name your Flask file `app.py`.
- Graders will have the packages in `requirements.txt` installed with `pip3 install
  -r requirements.txt`. If you feel strongly that you need a package not listed there, ask on the 
  course Slack.
- Graders will try to access your app in their browser at the URL that Flask prints to the command 
  line, e.g. `* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)`
- Make sure that your app starts successfully under these circumstances. We'll do our best to make 
  your app run even if it doesn't, but with a points penalty.

You can use any techniques or tools to complete your project, whether or not we studied them in 
class. In particular, note that there is no requirement that you use React (though it may make the 
project easier to complete). You could do the whole project with vanilla Javascript, you could use
React, or you could use some other framework we didn't study in class, like 
[Vue.js](https://vuejs.org/) or [Svelte](https://svelte.dev/). As always, remember to include in 
your submission any classmates you collaborated with and any materials you consulted.

## Requirements and Rubric (40 points total)

### Unauthenticated UI: (3 points)
- Unanthenticated users can create a new account
- Unauthenticated users can sign in with their username and password
- Unauthenticed users who try to access a room cannot see any messages in that room, and are sent to 
  the signup/login page instead

### Authenticated UI: (10 points)
- Authenticated users can log out, change their username, and change their password
- Can see a list of all channels. For each channel, can see how many unread messages the user has
- Visiting a channel marks all messages in it as read, and all new messages posted to that channel 
  while the user is in it are marked as read too
- Check for new messages in the channel at least once every 500 ms. Stop checking if the user leaves 
  the channel. (Hint: use SetInterval)
- Check for new unread messages in other channels at least once every second. Use only one HTTP 
  request to get counts for all channels 
- For each message with replies, display the number of replies to that message just below the 
  message content
- All messages in a room have a Reply button or icon that opens the replies pane
- Parse image URLs that appear in messages and display the images at the end of
  the message. Hint: you may use the web to help you find an appropriate regular
  expression.
- Users can add an emoji reaction to any message or reply
- Hovering over a reaction displays all the users who had that reaction

### Single-Page State (5 points)
- Only serve one HTML request—handle all other requests through the API
- Push the channel name (for messages) or parent message id (for replies) to the history and 
  navigation bar when the user navigates to a channel or thread. Users can use the Back button to 
  navigate to a previous channel or thread
- Loading the unique URL of a channel or thread should open the app to that
  channel or thread.
- If an unauthenticated user follows a link to a channel or thread, show them the login or signup 
  screens, but if they log in or sign up, send them to the original page they requested.
- Save the user's auth key in localStorage or in a cookie. Include your CNETID
  as part of your storage keys so your storage won't conflict with
  those of other students on the graders' machines. e.g.
  `window.localStorage.setItem('trevoraustin_belay_auth_key', 'abcdefg')`

### Responsive Styling: (8 points)
Wide Screen:
- Show the list of channels down the left-hand side of the screen, and the channel 
  the user is looking at (or a placeholder for no channel) on the right-hand side
- Clicking on the name of a channel loads that channel's messages into the right-hand column
- The current channel is highlighted in the channel list
- The names of other channels change have a subtle visual change on hover
- When viewing a reply thread, display the thread as a third column, narrowing the 
  column with messages
- Users can click an icon or button to dismiss the thread panel
- On narrow screens, the page has a one-column layout with a menu bar. Users see the channel list,
  the messages in one channel, or the replies to one message at a time, and not the other two
- When viewing replies, users can see the parent message they are replying to.
  They can click a button or link to navigate to the channel containing the
  parent message
- When viewing messages in a channel on a narrow screen, users have a button or
  link they can click to navigate back to the channel list.


### Database (8 points)
- Store channels, messages, and user account information in a SQLite3 database
- Create the database and its tables with migrations Start the name(s) of your migration file(s) with 
  [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamps so that the file system will 
  list them in the order they were created. Check those migrations into version control for your 
  assignment, alongside the actual database file
- Create a table for channels that stores a unique id and the channel name.
- Create a table for messages that stores, at a minimum, what channel the message is in, the id of 
  the user that wrote the message, and its text contents
- Store Replies in the Messages table. Implement a way of distinguishing regular messages in a 
  channel from replies to a message (e.g. with a `replies_to` column that is null for normal 
  messages but contains a messsage_id for Replies)
- Create a table for reactions that stores, at a minimum, the emoji, the id of the message or 
  comment it is a reaction to, and the id of the user who made the reaction
- Create a [join table](https://stackoverflow.com/questions/16549971/join-tables-in-sqlite-with-many-to-many)
  to capture the many-to-many relationship between Users and which Messages they have seen. (Hint: 
  store the *latest* timestamp or message id seen for each user in each channel—you don't have to 
- Sanitize all database inputs using prepared statements

### API (6 points)
- Give API endpoints a unique path namespace to distinguish them from your HTML
  path(s) e.g. `/api/endpoint1`, `/api/encpoint2` etc.
- Authentication endpoint that accepts a username and password, and returns a session token
- Authenticate to other endpoints via session token in the request header (not
  as a URL param or in a request body)
- Use GET requests for API calls that don't change data on the server, and POST requests for API 
  calls that **do** change data on the server
- Endpoints to create and get channels and messages, and to update a user's last read message in a 
  channel
- Endpoint to return unread message counts for the user for each channel in a single request
