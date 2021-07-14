const RocketChatApi = require('rocketchat-api')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler')
const axios = require("axios")
const moment = require('moment')
const { rocketChatDomain, rocketChatAdminLogin } = require('../../utils/globalConstants')
const chatDomain = `https://${rocketChatDomain}` //"https://chatbot.active.agency"
// const chatDomain = "http://192.168.1.52:3000"
const { getSellerProfile } = require('../../modules/sellersModule')

const rocketChatClient = new RocketChatApi("https", rocketChatDomain, 443)
// const rocketChatClient = new RocketChatApi("http", "192.168.1.52", 3000)
const { Chat } = require('../../modules')
const { updateChatSession, getChat, createChat, createChatSession } = Chat
const { verifyJwtToken } = require("../../../sso-tools/jwt_verify");
const { response } = require('express')
// let session = {
//     userId: "2aDCcJzHwaXfPvobs",
//     authToken: "NMRk-oqZz0x4Lf0houOkMsR8VmXUu3uTJBgpXGwObbc",
//     username: ""

// }
const admin = {
    username: rocketChatAdminLogin.username,
    password: rocketChatAdminLogin.password
}

exports.setChatSession = (data) => {
    rocketChatClient.setAuthToken(data.authToken)
    rocketChatClient.setUserId(data.userId)
    return true
}

exports.userLogin = async (req, res) => {
    const { username, password, userId, buyerId, sellerId, name, email } = req.body
    try {
        console.log("🚀 ~ file: rocketChatController.js ~ line 35 ~ exports.userLogin= ~ req.body", req.body)
        const chatLogin = await getChat({ userId })
        console.log("🚀 ~ file: rocketChatController.js ~ line 39 ~ exports.userLogin= ~ chatLogin", chatLogin)
        let activeChat = {}
        if (chatLogin) {

            console.log(' -------------- old chat Login ----------- ')
            activeChat = await this.userChatLogin({ username, password: "active123", customerUserId: userId })

        } else {
            console.log('------------------- new Chat user creating--------------')
            const chatUser = await this.createChatUser({ name, email, username: username.toString() })
            if (chatUser) {
                console.log("chatUser-> ", chatUser);
                const chatDetails = await createChat({ userId }, { details: chatUser, sellerId, buyerId, userId })
                activeChat = await this.userChatLogin({ username: chatUser.user && chatUser.user.username || "", password: "active123", customerUserId: userId })
            }
            // else{
            //     let newChatLogin = await getChat({ userId })
            //     console.log("NewChatLogin Res-> ", newChatLogin)
            //     if(newChatLogin)
            //         activeChat = await this.userChatLogin({ username, password: "active123", customerUserId: userId })
            //     else{
            //         console.log("NewChatLogin ELSE->")
            //     }
            // }

        }



        // const login = await rocketChatClient.login(username, password)
        // // await this.setChatSession({ authToken: login.authToken, userId: login.userId })
        // // rocketChatClient.setAuthToken(login.authToken)
        // // rocketChatClient.setUserId(login.userId)
        // const session = {
        //     authToken: login.authToken,
        //     userId: login.userId,
        //     username: login.me.username
        // }
        // await updateChatSession({ userId: customerUserId }, { session: { ...session } })
        console.log(activeChat, ' kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
        return respSuccess(res, activeChat, "Logged In!")
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
        resolve(login)
    } catch (error) {
        reject()
    }


})

exports.userChatSessionLogout = async (req) => {

    // try {
    //     console.log(req, 'chat logout-----------')
    //     const {
    //         chatAthToken, chatUserId, chatUsername
    //     } = req
    //     const url = `${chatDomain}/api/v1/logout`
    //     const result = await axios.post(url, {},
    //         {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Auth-Token': chatAthToken,
    //                 'X-User-Id': chatUserId
    //             }
    //         })
    //     console.log(result.data, ' cccccccccccccccccccc log outttttttttt')
    //     return result

    // } catch (error) {
    //     console.log(error)
    //     return false
    // }
}


exports.setLanguage = async (req, res) => {

    try {
        const {
            chatAthToken, chatUserId, chatUsername, userID
        } = req
        const { lang, fromWhere, roomId } = req.body
        console.log("🚀 ~ file: rocketChatController.js ~ line 103 ~ exports.setLanguage= ~ req.body", req.body)
        const chatUpdate = await createChatSession({ userId: userID }, { language: lang, isLanguageSet: false })
        if (fromWhere) {
            this.updateLanguage(req, roomId)
        }
        // console.log(lang, ' set language  room-------------')
        // const url = `${chatDomain}/api/v1/autotranslate.saveSettings`
        // // const data = {
        // //     language: "kn"
        // // }
        // const result = await axios.post(url, {
        //     userId: chatUserId,
        //     data: { language: lang }
        // },
        //     {
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'X-Auth-Token': chatAthToken,
        //             'X-User-Id': chatUserId
        //         }
        //     })
        // console.log(JSON.stringify(result.data), ' lllllllllllllllllll')
        return respSuccess(res, chatUpdate)
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
            "email": `${username}@gmail.com`,
            "username": username,
            "password": "active123",
            "sendWelcomeEmail": false,
            "joinDefaultChannels": false,
            "verified": true,
            "requirePasswordChange": false,
            "roles": ["user"]
        };
        console.log(userToAdd, chatDomain, ' 11111111111111111111111111')
        const adminLogin = await inlinUserLogin({ username: admin.username, password: admin.password })
        // console.log("🚀 ~ file: rocketChatController.js ~ line 135 ~ exports.createUser= ~ adminLogin", adminLogin)

        const url = `${chatDomain}/api/v1/users.create`

        try {
            const result = await axios.post(url, userToAdd,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': adminLogin.authToken,
                        'X-User-Id': adminLogin.userId
                    }
                })
            return respSuccess(res, result.data)
        }
        catch (err) {
            console.log("Create-User ERROR", err);
        }

        // const user = await rocketChatClient.users.create(userToAdd);
        // const logout = await rocketChatClient.logout()
        // rocketChatClient.setAuthToken(user.authToken)
        // rocketChatClient.setUserId(user.userId)


    } catch (error) {
        console.error("Error-block axios Create-user", error)
        return respError(res, error.message)
    }
}


exports.userList = async (req, res) => {
    try {
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const { chatUserType } = req.query

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
            // if (element.usernames[chatUserType] == chatUsername) { ////buyer
            //     break;
            // }
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
        console.log("🚀 ~ file: rocketChatController.js ~ line 244 ~ exports.getHistory= ~ req.query", req.query)
        await this.updateLanguage(req, roomId)
        let _temp = {};

        const url = `${chatDomain}/api/v1/im.history?roomId=${roomId}&offset=${offset}&count=${limit}`
        // console.log("111111111111111111111111111111111",url)
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

        return respSuccess(res, { messages: _temp })
        // });


    } catch (err) {

        console.log("Error-> ", err);
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
        console.log(req.body, chatDomain, ' send message-----')
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const { roomId, message, language } = req.body

        const url = `${chatDomain}/api/v1/chat.postMessage`
        const urlTransalte = `${chatDomain}/api/v1/autotranslate.translateMessage`

        const result = await axios.post(url, { roomId: roomId, text: message },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        if (language && language !== 'en') {

            const resultTranslate = await axios.post(urlTransalte, {
                messageId: result.data.message._id,
                targetLanguage: language
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': chatAthToken,
                        'X-User-Id': chatUserId
                    }
                })
            // console.log("🚀 ~ file: rocketChatController.js ~ line 366 ~ exports.sendMessage= ~ resultTranslate", resultTranslate)
        }
        // console.log(result.data.message._id, ' send meeeee1111111111111 ----------------')
        // rocketChatClient.chat.postMessage({ roomId: roomId, text: message }, (err, body) => {
        //     if (err)
        //         return respError(res, err.message)
        //     console.log(body, '--------------------------')
        return respSuccess(res, result.data)
        // });

    } catch (err) {
        console.log(err, ' rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
        return respError(res, err.message)
    }

}

exports.updateChatStatus = async (req) => { // Logout API
    try {
        console.log(' logout chat status updated-----')
        const {
            chatAthToken, chatUserId, chatUsername
        } = req
        const url = `${chatDomain}/api/v1/users.setStatus`
        // const url = `${chatDomain}/api/v1/users.setActiveStatus `
        // const data={
        //     activeStatus: false,
        //     userId: chatUserId
        // }
        const data = {
            message: "My status update",
            status: "offline"
        }

        const result = await axios.post(url, data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        return result

    } catch (error) {

    }
}


exports.updateLanguage = async (req, roomId) => {
    const {
        chatAthToken, chatUserId, chatUsername, userID
    } = req
    const Details = await getChat({ userId: userID/* , isLanguageSet: false */ })
    if (Details && Details.language) {

        const url = `${chatDomain}/api/v1/autotranslate.saveSettings`

        const result = await axios.post(url, {
            roomId: roomId,
            field: "autoTranslateLanguage",
            value: Details.language
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        const result_1 = await axios.post(url, {
            roomId: roomId,
            field: "autoTranslate",
            value: true
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        await createChatSession({ userId: userID }, { isLanguageSet: true }) // updateing to mongo
    }

}


exports.checkSellerChat = async (req, res) => {

    try {
        const { sellerId } = req.query
        let checkChat = await getChat({ sellerId })
        console.log(checkChat, '111111111111111111111--------------------')
        if (!checkChat) {
            const seller = await getSellerProfile(sellerId)
            const user = seller[0]
            const chatUser = await this.createChatUser({ name: user.name, email: user.email, username: user.mobile[0].mobile.toString() })
            checkChat = await createChat({ details: chatUser, sellerId: user._id, buyerId: user.buyer || null, userId: user.userId || null })
            // checkChat = await this.userChatLogin({ username: creatChat.details.user.username, password: "active123", customerUserId: user._id })
        }
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

    // try {
    //     console.log(' send message-----')
    //     const { roomId, message } = req.body
    //     rocketChatClient.chat.search({ roomId: roomId, text: message }, (err, body) => {
    //         if (err)
    //             return respError(res, err.message)
    //         return respSuccess(res, body)
    //     });

    // } catch (err) {
    //     return respError(res, err.message)
    // }

}


exports.getNotification = async (req, res) => {

    // try {
    //     console.log(req.query, ' Unread message-----')
    //     rocketChatClient.notify.room.onChanged({ roomId: "2aDCcJzHwaXfPvobsHT8e8ftpESBm4e7YP" }, (err, body) => {
    //         if (err)
    //             return respError(res, err.message)
    //         return respSuccess(res, body)
    //     });
    // } catch (err) {

    //     return respError(res, err.message)
    // }

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
        const chatDetails = await updateChatSession({ userId: customerUserId }, {
            session: {
                ...session
            }
        })
        await this.chatUpdateChatStatus({
            chatAthToken: login.authToken,
            chatUserId: login.userId,
            chatUsername: login.me.username
        })
        // console.log(customerUserId, session, ' ssssssssssssss')
        return { ...login, language: chatDetails.isLanguageSet ? chatDetails.language : '' }
    } catch (error) {
        // console.log(error)
        return error.message
        // respError(res, error.message, "Invalid credentials")
    }

}


exports.chatUpdateChatStatus = async (data) => {
    const {
        chatAthToken, chatUserId, chatUsername
    } = data
    try {
        // console.log("🚀 ~ file: rocketChatController.js ~ line 578 ~ exports.chatUpdateChatStatus= ~ data", data)
        const url = `${chatDomain}/api/v1/users.setStatus`
        const data = {
            message: "My status update",
            status: "online"
        }

        const result = await axios.post(url, data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAthToken,
                    'X-User-Id': chatUserId
                }
            })
        return result

    } catch (error) {

    }
}

exports.createChatUser = async (data) => {

    try {
        const { name, email, username } = data
        const userToAdd = {
            "name": name,
            "email": `${username}@gmail.com`,
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

    // try {
    //     console.log('------- chat logout-----------')
    //     const chat = await rocketChatClient.logout()
    //     return true
    //     // return respSuccess(res, chat, chat.message)

    // } catch (error) {
    //     console.log(error)
    //     return false
    //     // return respError(res, error.message)
    // }
}

exports.userLogout = async (req, res) => {

    // try {
    //     console.log('chat logout-----------')
    //     const {
    //         chatAthToken, chatUserId, chatUsername
    //     } = req
    //     // const chat = await rocketChatClient.logout()
    //     const url = `${chatDomain}/api/v1/logout`
    //     const result = await axios.post(url, {},
    //         {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Auth-Token': chatAthToken,
    //                 'X-User-Id': chatUserId
    //             }
    //         })
    //     return true

    // } catch (error) {
    //     console.log(error)
    //     return false
    // }
}


exports.chatLogout = async (req, res) => { // Logout API
    try {
        // const token = req.headers.authorization.split('|')[1];
        // console.log(token, ' logout chat status updated-----')
        // if (token !== 'undefined') {
        const {
            chatUserId,
            chatAuthToken,
            chatUsername
        } = req.body
        // const decoded = await verifyJwtToken(token);
        // const { deviceId, userId } = decoded;
        // const chatDetails = await getChat({ userId })
        // if (chatDetails) {



        const url = `${chatDomain}/api/v1/users.setStatus`
        const data = {
            message: "My status update",
            status: "offline"
        }
        console.log(url, 'Chat logged ut successfuly------------------')

        const result = await axios.post(url, data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': chatAuthToken,
                    'X-User-Id': chatUserId
                }
            })
        respSuccess(res, ' Chat logged out Successfully')

        // }
        // }

    } catch (error) {
        console.log("🚀 ~ file: rocketChatController.js ~ line 769 ~ exports.chatLogout= ~ error", error)
        respError(res, error)
    }
}

