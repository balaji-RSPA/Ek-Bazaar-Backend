const RocketChatApi = require('rocketchat-api')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler')
const axios = require("axios")
const moment = require('moment')
const chatDomain = "https://chatbot.active.agency"
const { getSellerProfile } = require('../../modules/sellersModule')

const rocketChatClient = new RocketChatApi("https", "chatbot.active.agency", 443)
// const rocketChatClient = new RocketChatApi("http", "192.168.1.30", 3000)
const { Chat } = require('../../modules')
const { updateChatSession, getChat, createChat } = Chat
// let session = {
//     userId: "2aDCcJzHwaXfPvobs",
//     authToken: "NMRk-oqZz0x4Lf0houOkMsR8VmXUu3uTJBgpXGwObbc",
//     username: ""

// }
const admin = {
    username: "ramesh",
    password: "ramesh123"
}

exports.setChatSession = (data) => {
    rocketChatClient.setAuthToken(data.authToken)
    rocketChatClient.setUserId(data.userId)
    console.log(' chat session set')
    return true
}

exports.userLogin = async (req, res) => {
    const { username, password, customerUserId } = req.body
    try {
        // console.log("🚀 ~ file: rocketChatController.js ~ line 7 ~ exports.userLogin= ~ req.body", req.body)
        const login = await rocketChatClient.login(username, password)
        console.log("🚀 ~ file: rocketChatController.js ~ line 9 ~ exports.userLogin= ~ login", login)
        // await this.setChatSession({ authToken: login.authToken, userId: login.userId })
        // rocketChatClient.setAuthToken(login.authToken)
        // rocketChatClient.setUserId(login.userId)
        const session = {
            authToken: login.authToken,
            userId: login.userId,
            username: login.me.username
        }
        await updateChatSession({ userId: customerUserId }, { session: { ...session } })
        return respSuccess(res, login, "Logged In!")
        // return (login, "Logged In!")
    } catch (error) {
        console.log(error)
        respError(res, error.message, "Invalid credentials")
    }

}

const inlinUserLogin = (req) => new Promise(async (resolve, reject) => {

    const { username, password } = req
    try {
        const login = await rocketChatClient.login(username, password)
        // rocketChatClient.setAuthToken(login.authToken)
        // rocketChatClient.setUserId(login.userId)
        console.log(login, ' admin internal login')
        resolve(login)
    } catch (error) {
        reject()
    }


})

exports.userChatSessionLogout = async (req) => {

    try {
        console.log(req, 'chat logout-----------')
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const url = `${chatDomain}/api/v1/logout`
        const result = await axios.post(url, {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        console.log(result.data, ' cccccccccccccccccccc log outttttttttt')
        return result

    } catch (error) {
        console.log(error)
        return false
    }
}


exports.setLanguage = async (req, res) => {

    try {
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const { lang } = req.body
        console.log(lang, ' set language  room-------------')
        const url = `${chatDomain}/api/v1/users.setPreferences`
        const data = {
            language: "kn"
        }
        const result = await axios.post(url, {
            userId: chatUserId,
            data: { language: lang }
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        console.log(JSON.stringify(result.data), ' lllllllllllllllllll')
        return respSuccess(res, result.data)
    } catch (error) {
        console.log(error)
        return respError(res, error.message)
    }

}


exports.createUser = async (req, res) => {

    try {
        const { name, email, username } = req.body
        const userToAdd = {
            "name": name,
            "email": email,
            "username": username,
            "password": "active123",
            "sendWelcomeEmail": false,
            "joinDefaultChannels": false,
            "verified": true,
            "requirePasswordChange": false,
            "roles": ["user"]
        };
        const adminLogin = await inlinUserLogin({ username: admin.username, password: admin.password })
        // console.log("🚀 ~ file: rocketChatController.js ~ line 135 ~ exports.createUser= ~ adminLogin", adminLogin)

        const url = `${chatDomain}/api/v1/users.create`

        const result = await axios.post(url, userToAdd,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': adminLogin.authToken,
                    'X-User-Id': adminLogin.userId
                }
            })
        // console.log(result.data, ' new usereerererer------------')

        // const user = await rocketChatClient.users.create(userToAdd);
        // const logout = await rocketChatClient.logout()
        // rocketChatClient.setAuthToken(user.authToken)
        // rocketChatClient.setUserId(user.userId)
        return respSuccess(res, result.data)

    } catch (error) {
        console.log(error)
        return respError(res, error.message)
    }
}


exports.userList = async (req, res) => {
    try {
        const {
            chatAthToken, chatUserId, chatUsername
        } = req

        const url = `${chatDomain}/api/v1/im.list`
        const list = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': chatAthToken,
                'X-User-Id': chatUserId
            }
        })

        list.data.ims = [...list.data.ims].reverse()

        for (let index = 0; index < list.data.ims.length; index++) {
            const element = list.data.ims[index];
            const uid = chatUsername !== element.usernames[1] ? element.usernames[1] : element.usernames[0]

            const userInfoUrl = `${chatDomain}/api/v1/users.info?username=${uid}`

            const userInfo = await axios.get(userInfoUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })

            list.data.ims[index] = { ...userInfo.data, ...list.data.ims[index] }
            // console.log(element, ' iiiiiiiiiiiiiiiiiiiii')
            if (element.lastMessage && element.lastMessage.rid) {
                const url = `${chatDomain}/api/v1/subscriptions.getOne?roomId=${element.lastMessage.rid}`
                const resp = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': chatAthToken,
                        'X-User-Id': chatUserId
                    }
                })
                list.data.ims[index] = { ...resp.data, ...list.data.ims[index] }
            }
        }
        console.log(list.data, ' list ................')
        return respSuccess(res, list.data)
        // })

    } catch (error) {
        // console.log(err)
        return respError(res, error.message)
    }
}


exports.getHistory = async (req, res) => {

    try {
        console.log(' history message-----')
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const { roomId, limit, offset } = req.query
        let _temp = {};

        const url = `${chatDomain}/api/v1/im.history?roomId=${roomId}`
        const history = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': chatAthToken,
                'X-User-Id': chatUserId
            }
        })
        const arr = history.data.messages.reverse()


        // rocketChatClient.im.history({ roomId, offset, count: limit }, async (err, body) => {
        //     if (err)
        //         return respError(res, err)
        for await (data of arr) {
            let _key = moment(data.ts).format('YYYY-MM-DD');
            if (_temp[_key] || _temp[_key] !== undefined) {
                _temp[_key].push(data);
            }
            else {
                _temp[_key] = [];
                _temp[_key].push(data);
            }


        }
        // console.log(_temp, ' kkkkkk')
        return respSuccess(res, { messages: _temp })
        // });


    } catch (err) {

        return respError(res, err.message)
    }

}

exports.markAsRead = async (req, res) => {

    try {
        console.log(' markAsread  room-------------')
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const { roomId } = req.body
        console.log("🚀 ~ file: rocketChatController.js ~ line 184 ~ exports.markAsRead= ~ roomId", roomId)
        const url = `${chatDomain}/api/v1/subscriptions.read`
        const result = await axios.post(url, {
            rid: roomId
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        return respSuccess(res, result.data)
    } catch (error) {
        console.log(error)
        return respError(res, error.message)
    }

}


exports.sendMessage = async (req, res) => {

    try {
        console.log(req.body, ' send message-----')
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const { roomId, message } = req.body

        const url = `${chatDomain}/api/v1/chat.postMessage`

        const result = await axios.post(url, { roomId: roomId, text: message },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        // console.log(result.data, ' send meeeee ----------------')
        // rocketChatClient.chat.postMessage({ roomId: roomId, text: message }, (err, body) => {
        //     if (err)
        //         return respError(res, err.message)
        //     console.log(body, '--------------------------')
        return respSuccess(res, result.data)
        // });

    } catch (err) {
        return respError(res, err.message)
    }

}

exports.checkSellerChat = async (req, res) => {

    try {
        const { sellerId } = req.query
        console.log("🚀 ~ file: rocketChatController.js ~ line 329 ~ exports.checkSellerChat= ~ sellerId", sellerId)
        let checkChat = await getChat({ sellerId })
        console.log("🚀 ~ file: rocketChatController.js ~ line 332 ~ exports.checkSellerChat= ~ checkChat", checkChat)
        if (!checkChat) {
            const seller = await getSellerProfile(sellerId)
            const user = seller[0]
            const chatUser = await this.createChatUser({ name: user.name, email: user.email, username: user.mobile[0].mobile.toString() })
            checkChat = await createChat({ details: chatUser, sellerId: user._id, buyerId: user.buyer || null, userId: user.userId || null })
            // checkChat = await this.userChatLogin({ username: creatChat.details.user.username, password: "active123", customerUserId: user._id })
        }
        console.log("🚀 ~ file: rocketChatController.js ~ line 330 ~ exports.checkSellerChat= ~ checkChat", checkChat)
        respSuccess(res, checkChat)
    } catch (error) {

        respError(res, error.message)

    }

}

exports.openRoom = async (req, res) => {

    // try {
    //     console.log(' chat room-------------')
    //     const { roomId } = req.body
    //     const room = await rocketChatClient.im.open(roomId)
    //     return respSuccess(res, room)
    // } catch (error) {
    //     return respError(res, error.message)
    // }

}


exports.deleteUser = async (req, res) => {

    // try {
    //     console.log('Delete user -----------')
    //     const user = await rocketChatClient.users.delete(req.body.userId);
    //     return respSuccess(res, user, 'Deleted Succesfully!')

    // } catch (error) {
    //     // console.log(err)
    //     return respError(res, error)
    // }
}

exports.userDetails = async (req, res) => {

    // try {
    //     console.log('get user details -----------')
    //     rocketChatClient.authentication.me((err, body) => {
    //         if (err)
    //             return respError(res, err)
    //         return respSuccess(res, body)
    //     })

    // } catch (error) {
    //     // console.log(err)
    //     return respError(res, error)
    // }
}



exports.searchMessage = async (req, res) => {

    try {
        console.log(' send message-----')
        const { roomId, message } = req.body
        rocketChatClient.chat.search({ roomId: roomId, text: message }, (err, body) => {
            if (err)
                return respError(res, err.message)
            return respSuccess(res, body)
        });

    } catch (err) {
        return respError(res, err.message)
    }

}


exports.getNotification = async (req, res) => {

    try {
        console.log(req.query, ' Unread message-----')
        rocketChatClient.notify.room.onChanged({ roomId: "2aDCcJzHwaXfPvobsHT8e8ftpESBm4e7YP" }, (err, body) => {
            if (err)
                return respError(res, err.message)
            return respSuccess(res, body)
        });
    } catch (err) {

        return respError(res, err.message)
    }

}


/* 

    Normal function 

*/
exports.userChatLogin = async (data) => {
    const { username, password, customerUserId } = data
    try {
        const login = await rocketChatClient.login(username, password)
        console.log("🚀 ~ file: rocketChatController.js ~ line 345 ~ exports.userChatLogin= ~ login", login)
        // rocketChatClient.setAuthToken(login.authToken)
        // rocketChatClient.setUserId(login.userId)
        // await this.setChatSession({ authToken: login.authToken, userId: login.userId })
        const session = {
            authToken: login.authToken,
            userId: login.userId,
            username: login.me.username
        }
        await updateChatSession({ userId: customerUserId }, {
            session: {
                ...session
            }
        })
        console.log(customerUserId, session, ' ssssssssssssss')
        return login
    } catch (error) {
        // console.log(error)
        return error.message
        // respError(res, error.message, "Invalid credentials")
    }

}

exports.createChatUser = async (data) => {

    try {
        const { name, email, username } = data
        const userToAdd = {
            "name": name,
            "email": email,
            "username": username,
            "password": "active123",
            "sendWelcomeEmail": false,
            "joinDefaultChannels": false,
            "verified": true,
            "requirePasswordChange": false,
            "roles": ["user"]
        };
        const adminLogin = await inlinUserLogin({ username: admin.username, password: admin.password })


        const url = `${chatDomain}/api/v1/users.create`

        const result = await axios.post(url, userToAdd,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': adminLogin.authToken,
                    'X-User-Id': adminLogin.userId
                }
            })
        console.log(result.data, ' new usereerererer------------')

        // const user = await rocketChatClient.users.create(userToAdd);
        // console.log(user, ' creat user ------------------------------------------')
        // const logout = await rocketChatClient.logout()

        // // await this.setChatSession({ authToken: user.authToken, userId: user.userId })
        // // rocketChatClient.setAuthToken(user.authToken)
        // // rocketChatClient.setUserId(user.userId)
        // // console.log("🚀 ~ file: rocketChatController.js ~ line 52 ~ exports.createUser= ~ user", user)
        return result.data

    } catch (error) {
        console.log(error)
        return 0
    }
}

exports.userChatLogout = async () => {

    try {
        console.log('------- chat logout-----------')
        const chat = await rocketChatClient.logout()
        return true
        // return respSuccess(res, chat, chat.message)

    } catch (error) {
        console.log(error)
        return false
        // return respError(res, error.message)
    }
}

exports.userLogout = async (req, res) => {

    try {
        console.log('chat logout-----------')
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        // const chat = await rocketChatClient.logout()
        const url = `${chatDomain}/api/v1/logout`
        const result = await axios.post(url, {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        return true

    } catch (error) {
        console.log(error)
        return false
    }
}

