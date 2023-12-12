var cur_url = window.location.href;
var loginSignupPage = document.getElementById("login-signup-page");
var mainPage = document.getElementById("mainPage");
var lastSeenMessages = {};

let pathname = window.location.pathname; 
console.log("pathname: ", pathname);

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
// Login and Signup flows:
if (pathname == "/") {
    loginSignupPage.style.display = "block";
} 

function login() {
    username = document.getElementsByName("username")[0].value;
    password = document.getElementsByName("password")[0].value;

    fetch('/api/login', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    }).then((response) => {
        if (response.status === 300) {
            alert("Incorrect login credentials.")
        }
        else {
            return response.json().then(data => {
                alert("Successfully logged in!")
                document.cookie = "zkhatib_belay_auth_key=" + data['data']['api_key'];
/*                 document.cookie = "zkhatib_belay_user_id=" + data['data']['user_id']; */
                window.localStorage.setItem("zkhatib_token", data["token"])
                window.localStorage.setItem("zkhatib_belay_user_id", data['data']['user_id'])
                document.getElementsByName("username")[0].value = "";
                document.getElementsByName("password")[0].value = "";
                loginSignupPage.style.display = "none";
                mainPage.style.display = "flex";
                let welcomeUsername = document.getElementById("welcome-username");
                welcomeUsername.innerText = "Username: " + data['data']['username'];
                displayChannels();
            })
        } 
    })
}

function signup() {
    /* console.log("Are we making it here?") */
    username = document.getElementsByName("created-username")[0].value;
    password = document.getElementsByName("created-password")[0].value;
    retyped_password = document.getElementsByName("retyped-password")[0].value;
/*     console.log(username, password, retyped_password) */

    if (password != retyped_password) {
        alert("Your passwords don't match. Try again.");
        return;
    }

    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    }).then((response) => {
        if(response.status === 200) {
            document.getElementsByName("created-username")[0].value = "";
            document.getElementsByName("created-password")[0].value = "";
            document.getElementsByName("retyped-password")[0].value = "";
            initializeLastViewedUser(username)
            alert("You have successfully created an account! Please login with you credentials now.")
        }
    })
}



/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
// Change username, change password, and logout functions:
function changeUsername() {
    user_id = localStorage.getItem("zkhatib_belay_user_id");
    new_username = document.getElementsByName("change-username")[0].value;
    console.log(new_username)
    fetch('/api/changeusername', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`
        },
        body: JSON.stringify({
            user_id: user_id,
            new_username: new_username
        })
    }).then((response) => {
        if (response.status === 200) {
            alert("Username successfully changed!")
            let welcomeUsername = document.getElementById("welcome-username");
            welcomeUsername.innerText = "Username: " + new_username;
            document.getElementsByName("change-username")[0].value = "";
        }
    })
}

function changePassword() {
    user_id = localStorage.getItem("zkhatib_belay_user_id");
    new_password = document.getElementsByName("change-password")[0].value;

    fetch('/api/changepassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`
        },
        body: JSON.stringify({
            user_id: user_id,
            new_password: new_password
        })
    }).then((response) => {
        if (response.status === 200) {
            alert("Password successfully changed!")
            document.getElementsByName("change-password")[0].value = "";
        }
    })
}

function logout() {
    window.localStorage.removeItem("zkhatib_belay_user_id")
    window.localStorage.removeItem("zkhatib_token");
    mainPage.style.display = "none";
    loginSignupPage.style.display = "block";
    alert('You have successfully logged out of your account.')
    window.localStorage.removeItem("user_id");
}



/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
// Display current channels, create channel, load the messages initially in a selected channel, 
// and keep polling that channel (every 500 ms) for additional messages

var currentDisplayChannels;
function displayChannels() {
    user_id = localStorage.getItem('zkhatib_belay_user_id')
    clearInterval(currentDisplayChannels)
    currentDisplayChannels = setInterval(function() {
        fetch('/api/displaychannelnames', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
                'user_id': user_id
            }
        }).then((response) => {
            if(response.status === 200) {
                return response.json().then(data => {
                    let newChannelButton = document.getElementById("new-channel-button");
                    while (newChannelButton.previousSibling){
                        newChannelButton.parentNode.removeChild(newChannelButton.previousSibling);
                    }
                    console.log('getting channels')
                    for (var i=0; i < Object.keys(data).length; i++) {
                        ch_index = "message" + i
                        var ch_name = data[ch_index]['channel_name']
                        console.log(ch_name)
                        //lastSeenMessages[ch_name] = 0;
                        console.log('About to get into the channel template function')
                        let temp = channelTemplate(data[ch_index]);
                        console.log(temp)
                        newChannelButton.parentNode.insertBefore(temp, newChannelButton)
                        showUnreadCount(ch_name);
                    }
                })
            } else {
                return;
            }
        })
    },1000)
}

function showUnreadCount(channel_name) {
    user_id = localStorage.getItem("zkhatib_belay_user_id")
    console.log("Made it to showUnreadCount for channel: " + channel_name)
    fetch ('/api/getunreadcount', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id':user_id,
            'channel_name' : channel_name
        }
    }).then((response) => {
        if(response.status === 200) {
            return response.json().then(data => {
                let channelCount = document.getElementById('channelUnreadCount'+channel_name)
                channelCount.innerText = data
            })
        }
    })
}


// Creates a new channel
function newChannel() {
    user_id = localStorage.getItem("zkhatib_belay_user_id")
    channel_name = document.getElementsByName("new-channel")[0].value;
    if (channel_name == '') {
        alert('Channel name cannot be empty!')
        return;
    }
    fetch('/api/createchannel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id': user_id
        },
        body: JSON.stringify({
            channel_name: channel_name
        })
    }).then((reponse) => {
        if(reponse.status === 200) {
            initializeLastViewedChannel(channel_name)
            displayChannels();
        }
    })
}

// Creates a last_viewed row corresponding to the newly created channel for each user in the database
function initializeLastViewedChannel(channel_name) {
    user_id = localStorage.getItem('zkhatib_belay_user_id')
    console.log("Initializing rows in last_viewed table for new channel: " + channel_name )
    fetch('/api/initializelastviewedchannel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id
        },
        body: JSON.stringify({
            channel_name: channel_name
        })
    }).then((response) => {
        if(response.status === 200) {
            console.log('last_viewed rows created')
        }
    })
}

function initializeLastViewedUser(user_name) {
    user_id = localStorage.getItem('zkhatib_belay_user_id')
    console.log("Initializing rows in last_viewed table for new user: " + user_name )
    fetch('/api/initializelastvieweduser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id': user_id
        },
        body: JSON.stringify({
            user_name: user_name
        })
    }).then((response) => {
        if(response.status === 200) {
            console.log('last_viewed rows created')
        }
    })
}


// Dictionary to store number of replies to
var count_replies = {};

// Display messages upon clicking on a channel in the sidebar
function loadMessages(channel_name) {
    user_id = localStorage.getItem('zkhatib_belay_user_id')
    history.pushState(null, null, channel_name);
    console.log("Are we even loading messages for " + channel_name)
    fetch('/api/loadmessages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id,
            'channel_name': channel_name 
        }
    }).then((response) => {
        if (response.status === 200) {
            return response.json().then(data => {
                console.log("Here is what's returned to loadMessages")
                console.log(data)
                if(!data || Object.keys(data['content']).length == 0) {
                    console.log("Is this where we are?")
                } else {
                    console.log("We are about to jump into updateLastView with " + data['content'])
                    updateLastViewed(channel_name, data['content'])
                    initializeMessages(data)
                }                       
                getMessages(channel_name)
            })
        }
    });
}

// getMessages for current channel (runs every 500ms)
var currentChannelGetMessages;
function getMessages(channel_name) {
  clearInterval(currentChannelGetMessages);
  user_id = localStorage.getItem('zkhatib_belay_user_id')
  currentChannelGetMessages = setInterval(function() {
    console.log("Getting new messages for channel: ", channel_name);
    let messageIDs = document.querySelectorAll("#msgId");
    console.log(messageIDs)
    if (messageIDs.length  == 0) {
        console.log('Here I am')
        last_msg_ID = 0;
    } else {
        console.log('There I go')
        lastMsgDiv = messageIDs[messageIDs.length - 1];
        last_msg_ID = lastMsgDiv.innerText;
    }
    
    fetch('/api/getmessages', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id,
            'channel_name': channel_name,
            'last_msg_ID': last_msg_ID
        }
    }).then((response) => {
        if (response.status === 200) {
            return response.json().then(data => {
                if (data && data['content'] && Object.keys(data['content']).length != 0) {
                    console.log("About to jump into storeLastID")
                    updateLastViewed(channel_name, data['content']);
                    
                    console.log(data)
                    console.log('About to jump into append Words for channel '+ channel_name)
                    addMessages(data);
                } else {
                    console.log('What?')
                }
            })
        }
    })
  }, 500);
}
 

function postMessage() {
    let channel_name = document.getElementById("chatPageChannelName").innerText;
    let message = document.getElementById("postMessageTextArea").value;
    user_id = localStorage.getItem('zkhatib_belay_user_id')

    console.log("The user is posting a message to Channel: " + channel_name + " : " + message);
    console.log(channel_name, username, message);
    console.log('Did I get here?')
    fetch('/api/postmessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id
        },
        body: JSON.stringify({
            channel_name: channel_name,
            message: message
        })
    }).then((response) => {
        if (response.status === 200) {
            console.log("Posting mesaage")
            document.getElementById("postMessageTextArea").value = '';
        }
    })
}


// Update Last Viewed table for channel and logged in user
function updateLastViewed(channel_name, messages){
    user_id = localStorage.getItem("zkhatib_belay_user_id")
    console.log("We are now in updateLastViewed for channel: " + channel_name)
    console.log(messages)
    console.log(messages['message0']['message_id'])
    last_id = messages['message0']['message_id']
    fetch('/api/updatelastviewed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id
        },
        body: JSON.stringify({
            channel_name: channel_name,
            last_id: last_id,
            /* user_id: localStorage.getItem("user_id") */
        })
    }).then((response) => {
        if (response.status === 200) {
            console.log('Last viewed message updated for channel' + channel_name)
        }
    })

}



// Functions for posting retrieved messages in a given channel
function initializeMessages(messages) {
    console.log("Did we make it initializeMessages?")
    let moreMsgDiv = document.getElementById("messageContentContainer").firstChild;
    for (var i = 0; i < Object.keys(messages['count']).length; i++) {
        index = 'message' + i
        count_replies[messages["count"][index]['reply_id']] = messages["count"][index]['cnt'];
    }
    for (var i = 0; i < Object.keys(messages['content']).length; i++) {
        index = 'message' + i
        console.log('About to jump into message template')
        let temp = messageTemplate(messages["content"][index], count_replies);
        moreMsgDiv.parentNode.insertBefore(temp, moreMsgDiv.nextSibling.nextSibling);
    }
}

function addMessages(messages) {
    console.log('are we making it to append words?')
    if (!messages) {
        return;
    }
    var container = document.getElementById("messageContentContainer");
    for (var i = 0; i < Object.keys(messages['count']).length; i++) {
        index = 'message' + i
        count_replies[messages["count"][index]['reply_id']] = messages["count"][index]['cnt'];
    }
    for (var i = 0; i < Object.keys(messages['content']).length; i++) {
        index = 'message' + i
        console.log('About to jump into message template')
        let temp = messageTemplate(messages["content"][index], count_replies);
        container.append(temp);
    }
}




// Load replies for a given message
function loadReplies(message_id) {
    user_id = localStorage.getItem("zkhatib_belay_user_id")
    history.pushState(null, null, message_id);
    fetch('/api/loadreplies', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id,
            'message_id': message_id
        }
    }).then((response) => {
        if (response.status === 200) {
            return response.json().then(data=> {
                if (!data) {
                    return false;
                }
                console.log('we are about to jump into inserting replies')
                
                let container = document.getElementById("replyThreadContainer");
                let closeButton = document.getElementById('close-replies-button');

                for (var i = 0; i < Object.keys(data).length; i++){
                    msg_index = "message" + i
                    let temp = replyTemplate(data[msg_index]);
                    container.insertBefore(temp, closeButton);
                }
                return true
            })

        }
    })
}


function showReplies(message) {
    document.getElementById("replyThread").style.display = "block";
    document.getElementById("replyThreadTitle").innerText = message['username'] + ": " + message['body'];
    document.getElementById("threadReplyId").innerText = message['message_id'];
}

function hideReplies() {
    document.getElementById("replyThread").style.display = "none";
    document.getElementById("replyThreadTitle").innerText = "";
    let container = document.getElementById("replyThreadContainer");

    while (container.childElementCount > 2) {
        container.removeChild(container.firstChild);
    }
}


// Jquery, but could potentially do this in the replies template
$("#close-replies-button").click(function() {
    hideReplies();
    isReplyThreadOpen = false;
});

function postReply() {
    user_id = localStorage.getItem("zkhatib_belay_user_id")
    let channel_name = document.getElementById("chatPageChannelName").innerText;
    let reply_id = document.getElementById("threadReplyId").innerText;
    let message = document.getElementById("postReplyTextArea").value;

    fetch ('/api/postreply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id
        },
        body: JSON.stringify({
            channel_name: channel_name,
            message: message,
            reply_id: reply_id
        })
    }).then((response) => {
        if(response.status === 200) {
            return response.json().then(data => {
                console.log('Did we make it back here?')
                document.getElementById("postReplyTextArea").value = '';
                emptyReplyThreadChatArea();
                loadReplies(reply_id);
            })
        }
    })
}

// Called from within the messages template
function showReplies(message) {
    document.getElementById("replyThread").style.display = "block";
    document.getElementById("replyThreadTitle").innerText = message['username'] + ": " + message['body'];
    document.getElementById("threadReplyId").innerText = message['message_id'];
}

function hideReplies() {
    document.getElementById("replyThread").style.display = "none";
    document.getElementById("replyThreadTitle").innerText = "";
    let container = document.getElementById("replyThreadContainer");
    
    while (container.childElementCount > 2) {
        container.removeChild(container.firstChild);
    }
}



// Empty chat areas
function emptyChatArea() {
    let moreMessageDiv = document.getElementById("chat-page-more-message");
    while (moreMessageDiv.nextSibling) {
        moreMessageDiv.parentNode.removeChild(moreMessageDiv.nextSibling);
    }
    moreMessageDiv.style.display = "block";
    console.log("moreMessageDiv.style.display", moreMessageDiv.style.display);
}

function emptyReplyThreadChatArea() {
    let replyMessageDiv = document.getElementById("replyThreadContainer");
    console.log(replyMessageDiv);

    while (replyMessageDiv.childElementCount > 2) {
        replyMessageDiv.removeChild(replyMessageDiv.firstChild);
    }
}





/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
// Templates for channel list, messages, and replies
function channelTemplate(channel) {
    console.log("We made it to channel template for " + channel['channel_name'])
    let container = document.createElement("div");
    // Class used to "sidebar-channel-container"
    container.setAttribute("class", "channelNameContainer");

    let nameText = document.createElement("a");
    // Class below used to be "sidebar-channel":
    nameText.setAttribute("class", "nameChannel");
    nameText.setAttribute("id", "nameChannel-" + channel['channel_name']);
    console.log('Did we make it here?')
    nameText.onclick = function() {
        document.getElementById("chatPageChannelName").innerText = channel['channel_name'];
        window.push
        emptyChatArea();
        loadMessages(channel['channel_name']);
    }
    nameText.innerText = channel['channel_name'];
    container.appendChild(nameText);

    let p = document.createElement("p");
    p.setAttribute("id", "channelUnreadCount" + channel['channel_name']);
    p.setAttribute("class", "channelUnreadCount");
    //p.innerText = 0;
    container.appendChild(p);
    console.log('What about here?')

    return container
}

var isReplyThreadOpen = false;
function messageTemplate(message, count_replies) {
    console.log("We made it to message template")
    console.log("This is whats in the variable message:")
    console.log(message)
    console.log("This is what's in count_replies:")
    console.log(count_replies)

    let div = document.createElement("div");
    div.setAttribute("class", "messageContent");

    console.log('Where are we now?')
    let messageId = document.createElement("div");
    messageId.setAttribute("id", "msgId");
    messageId.setAttribute("hidden", true);
    console.log("What's going on:")
    console.log(message['body'])
    messageId.innerText = message['message_id'];
    div.appendChild(messageId);

    //Images: fix
    let url = getImageURLs(message['body']);
    if (url) {
        var msgImg = document.createElement("img");
        msgImg.setAttribute("src", url);
        msgImg.setAttribute("id", "messageImg");
        let p = document.createElement("p");
        var msg = message['body'].replace(url, "");
        p.innerText = message['username'] + ": " + msg;
        div.appendChild(p);
        div.append(msgImg);
    } else {
        let p1 = document.createElement("p");
        p1.setAttribute("class", "message-username");
        p1.innerText = message['username'];
        var br = document.createElement("br");
        let p2 = document.createElement("p");
        p2.setAttribute("class", "message-text");
        p2.innerText = message['body'];
        div.append(p1, p2);
    }

    let span = document.createElement("span");
    span.innerText = message['time_stamp'];
    div.appendChild(span);

    console.log("we have made it pretty far?")
    
    console.log(message['message_id']);
    console.log(count_replies);

    var button_smile =document.createElement("button");
    button_smile.setAttribute("class", "emoji-button");
    button_smile.innerText = "😊";
    div.appendChild(button_smile);
    button_smile.onclick = function() {
        button_smile.setAttribute("style", "background-color: yellow;");
        addEmoji('smile', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_smile.onmouseover = function() {
        showReactions('smile', message['message_id']);
    }

    let button_heart =document.createElement("button");
    button_heart.setAttribute("class", "emoji-button");
    button_heart.innerText = "❤️";
    div.append(button_heart);
    button_heart.onclick = function() {
        button_heart.setAttribute("style", "background-color: yellow;");
        addEmoji('heart', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_heart.onmouseover = function() {
        showReactions('heart', message['message_id']);
    }


    let button_fire =document.createElement("button");
    button_fire.setAttribute("class", "emoji-button");
    button_fire.innerText = "🔥";
    div.append(button_fire);
    button_fire.onclick = function() {
        button_fire.setAttribute("style", "background-color: yellow;");
        addEmoji('fire', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_fire.onmouseover = function() {
        showReactions('fire', message['message_id']);
    } 

    let button_sparkles =document.createElement("button");
    button_sparkles.setAttribute("class", "emoji-button");
    button_sparkles.innerText = "✨";
    div.append(button_sparkles);
    button_sparkles.onclick = function() {
        button_sparkles.setAttribute("style", "background-color: yellow;");
        addEmoji('sparkles', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_sparkles.onmouseover = function() {
        showReactions('sparkles', message['message_id']);
    }  

    let button_eyes =document.createElement("button");
    button_eyes.setAttribute("class", "emoji-button");
    button_eyes.innerText = "👀";
    div.append(button_eyes);
    button_eyes.onclick = function() {
        button_eyes.setAttribute("style", "background-color: yellow;");
        addEmoji('eyes', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_eyes.onmouseover = function() {
        showReactions('eyes', message['message_id']);
    } 

    let reaction_names = document.createElement("p")
    console.log('msg'+message['message_id'])
    reaction_names.setAttribute("id", 'msg'+message['message_id'])
    reaction_names.innerText = "Hover over emoji to view user reactions"
    div.append(reaction_names)
    let button_reply = document.createElement("button");
    button_reply.innerText = "Reply";
    div.appendChild(button_reply);

    button_reply.onclick = function() {
        if (isReplyThreadOpen) {
            hideReplies();
        }
        isLoad = loadReplies(message['message_id']);
        isReplyThreadOpen = true;
        showReplies(message);
    }

    if (count_replies[message['message_id']] === undefined) {
        return div;
    }

    let replyCount = count_replies[message['message_id']];
    if (replyCount) {
        let a = document.createElement("a");
        a.setAttribute("class", "replyCount");
        a.innerText = replyCount + " Replies";
        div.appendChild(a);
    }
    return div;
}

function replyTemplate(message) {
    let div = document.createElement("div");
    div.setAttribute("class", "replyThreadContent");

    let p = document.createElement("p");
    p.innerText = message['username'] + ": " + message['body'];
    div.appendChild(p);

    let span = document.createElement("span");
    span.innerText = message['time_stamp'];
    div.appendChild(span);


    var button_smile =document.createElement("button");
    button_smile.setAttribute("class", "emoji-button-reply");
    button_smile.innerText = "😊";
    div.appendChild(button_smile);
    button_smile.onclick = function() {
        button_smile.setAttribute("style", "background-color: yellow;");
        addEmoji('smile', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_smile.onmouseover = function() {
        showReactions('smile', message['message_id']);
    }

    let button_heart =document.createElement("button");
    button_heart.setAttribute("class", "emoji-button-reply");
    button_heart.innerText = "❤️";
    div.append(button_heart);
    button_heart.onclick = function() {
        button_heart.setAttribute("style", "background-color: yellow;");
        addEmoji('heart', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_heart.onmouseover = function() {
        showReactions('heart', message['message_id']);
    }


    let button_fire =document.createElement("button");
    button_fire.setAttribute("class", "emoji-button-reply");
    button_fire.innerText = "🔥";
    div.append(button_fire);
    button_fire.onclick = function() {
        button_fire.setAttribute("style", "background-color: yellow;");
        addEmoji('fire', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_fire.onmouseover = function() {
        showReactions('fire', message['message_id']);
    } 

    let button_sparkles =document.createElement("button");
    button_sparkles.setAttribute("class", "emoji-button-reply");
    button_sparkles.innerText = "✨";
    div.append(button_sparkles);
    button_sparkles.onclick = function() {
        button_sparkles.setAttribute("style", "background-color: yellow;");
        addEmoji('sparkles', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_sparkles.onmouseover = function() {
        showReactions('sparkles', message['message_id']);
    }  

    let button_eyes =document.createElement("button");
    button_eyes.setAttribute("class", "emoji-button-reply");
    button_eyes.innerText = "👀";
    div.append(button_eyes);
    button_eyes.onclick = function() {
        button_eyes.setAttribute("style", "background-color: yellow;");
        addEmoji('eyes', message['message_id'], localStorage.getItem("zkhatib_belay_user_id"))
    }
    button_eyes.onmouseover = function() {
        showReactions('eyes', message['message_id']);
    } 

    let reaction_names = document.createElement("p")
    console.log('msg'+message['message_id'])
    reaction_names.setAttribute("id", 'msg'+message['message_id'])
    reaction_names.innerText = "Hover over emoji to view user reactions:"
    div.append(reaction_names)
    return div;
}
//FIX: doesn't work properly (called in messageTemplate function)/
function getImageURLs(message) {
    const regex = /https\:\/\/[a-zA-Z0-9.\-/]*\/[a-zA-Z_.\-]*.(jpeg|jpg|gif|png)+/g;
    let array = [...message.matchAll(regex)];
    if (array == null || array[0] == null) {
        return null;
    }
    return array[0][0];
}



/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
/*-------------------------*/
// Emoji adding and showing functions
function addEmoji(emoji, message_id, user_id) {
    console.log("We made it to addEmoji (" + emoji + ") for user " + user_id + " on message " + message_id)
    user_id = localStorage.getItem("zkhatib_belay_user_id")
    fetch('/api/addemoji', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id
        },
        body: JSON.stringify({
            emoji: emoji,
            message_id: message_id,
            //user_id: user_id
        })
    }).then((response) => {
        if(response.status === 200) {
            alert('You added a' + emoji + "to a message!")
        }
    })

}

function showReactions(emoji, message_id) {
    console.log("We made it to showReactions for " + emoji +  " on message " + message_id)
    user_id = localStorage.getItem("zkhatib_belay_user_id")
    fetch('/api/showreactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getCookie("zkhatib_belay_auth_key")}`,
            'user_id' : user_id
        },
        body: JSON.stringify({
            emoji: emoji,
            message_id: message_id,
            //user_id: getCookie("zkhatib_belay_user_id")
        })
    }).then((response) => {
        if(response.status === 200) {
            return response.json().then(data => {
                console.log('We made it back to showReactions')
                console.log(data['message0']['username'])
                var list_names = data['message0']['username']
                for (var i = 1; i < Object.keys(data).length; i++){
                    msg_index = "message" + i
                    list_names = list_names + ', ' +data[msg_index]['username'];
                }
                reaction_list = document.getElementById("msg"+message_id)
                reaction_list.innerText = emoji + " reactions from: " + list_names
                

            })
        } else {
            reaction_list = document.getElementById("msg"+message_id)
            reaction_list.innerText = emoji + " reactions from: " + ""
                
        }
    })
}
