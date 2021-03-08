const RocketChatApi = require('rocketchat-api')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler')
const rocketChatClient = new RocketChatApi("https", "chatbot.active.agency", 443)
const session = {
    userId: "2aDCcJzHwaXfPvobs",
    authToken: "NMRk-oqZz0x4Lf0houOkMsR8VmXUu3uTJBgpXGwObbc"

}
const admin = {
    username: "ramesh",
    password: "ramesh123"
}

exports.userLogin = async (req, res) => {
    const { username, password } = req.body
    try {
        // console.log("🚀 ~ file: rocketChatController.js ~ line 7 ~ exports.userLogin= ~ req.body", req.body)
        const login = await rocketChatClient.login(username, password)
        console.log("🚀 ~ file: rocketChatController.js ~ line 9 ~ exports.userLogin= ~ login", login)
        rocketChatClient.setAuthToken(login.authToken)
        rocketChatClient.setUserId(login.userId)
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
        rocketChatClient.setAuthToken(login.authToken)
        rocketChatClient.setUserId(login.userId)
        resolve()
    } catch (error) {
        reject()
    }


})

exports.userLogout = async (req, res) => {

    try {
        console.log('chat logout-----------')
        const chat = await rocketChatClient.logout()
        return respSuccess(res, chat, chat.message)

    } catch (error) {
        console.log(error)
        return respError(res, error.message)
    }
}

exports.userDetails = async (req, res) => {

    try {
        console.log('get user details -----------')
        rocketChatClient.authentication.me((err, body) => {
            if (err)
                return respError(res, err)
            return respSuccess(res, body)
        })

    } catch (error) {
        // console.log(err)
        return respError(res, error)
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
        const chat = await inlinUserLogin({ username: admin.username, password: admin.password })
        const user = await rocketChatClient.users.create(userToAdd);
        const logout = await rocketChatClient.logout()
        rocketChatClient.setAuthToken(user.authToken)
        rocketChatClient.setUserId(user.userId)
        console.log("🚀 ~ file: rocketChatController.js ~ line 52 ~ exports.createUser= ~ user", user)
        return respSuccess(res, user)

    } catch (error) {
        console.log(error)
        return respError(res, error.message)
    }
}


exports.deleteUser = async (req, res) => {

    try {
        console.log('Delete user -----------')
        const user = await rocketChatClient.users.delete(req.body.userId);
        return respSuccess(res, user, 'Deleted Succesfully!')

    } catch (error) {
        // console.log(err)
        return respError(res, error)
    }
}

exports.userList = async (req, res) => {

    try {
        let list = await rocketChatClient.im.list({
            "offset": 0,
            "count": 0,
            "sort": undefined,
            "fields": undefined, "query": undefined/* { 'unreads': false } */
        })

        // console.log("🚀 ~ file: rocketChatController.js ~ line 130 ~ exports.userList= ~ list", list)
        for (let index = 0; index < list.ims.length; index++) {
            const element = list.ims[index];
            const info = await rocketChatClient.users.info({ username: element.usernames[1] })
            list.ims[index] = { ...info, ...list.ims[index] }
        }
        console.log("🚀 ~ file: rocketChatController.js ~ line 135 ~ exports.userList= ~ info", list)
        // rocketChatClient.im.list({
        //     "offset": 0,
        //     "count": 0,
        //     "sort": undefined,
        //     "fields": undefined, "query": undefined/* { 'unreads': false } */
        // }, (err, body) => {
        //     if (err) throw err;
        //     let result = body
        //     for (let index = 0; index < body.ims.length; index++) {
        //         const element = body.ims[index];
        //         rocketChatClient.users.info({ username: element.usernames[1] }, (err, body1) => {
        //             console.log(err, ' eeeeeeeeeeeee')
        //             console.log(body, ' kkkkkkkkkkkk')
        //             result.ims[index] = { ...body1, ...result.ims[index] }
        //             console.log(result, ' ------------------------------')
        //         });
        //     }
        //     console.log('1111111111111111111')
        //     // body.ims.map((val) => {
        //     //     console.log(val.usernames);
        //     // })
        return respSuccess(res, list)
        // })

    } catch (error) {
        // console.log(err)
        return respError(res, error.message)
    }
}

exports.openRoom = async (req, res) => {

    try {
        console.log(' chat room-------------')
        const { roomId } = req.body
        const room = await rocketChatClient.im.open(roomId)
        return respSuccess(res, room)
    } catch (error) {
        return respError(res, error.message)
    }

}

exports.sendMessage = async (req, res) => {

    try {
        console.log(req.body, ' send message-----')
        const { roomId, message } = req.body
        rocketChatClient.chat.postMessage({ roomId: roomId, text: message }, (err, body) => {
            if (err)
                return respError(res, err.message)
            return respSuccess(res, body)
        });

    } catch (err) {
        return respError(res, err.message)
    }

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

exports.getHistory = async (req, res) => {

    try {
        console.log(req.query, ' history message-----')
        const { roomId } = req.query
        console.log("🚀 ~ file: rocketChatController.js ~ line 189 ~ exports.getHistory= ~ roomId", roomId)

        rocketChatClient.im.history({ roomId }, (err, body) => {
            console.log(err, ' pppppppppppppppp')
            if (err)
                return respError(res, err)

            return respSuccess(res, body)
        });


    } catch (err) {

        return respError(res, err.message)
    }

}

exports.getUnreadMessages = async (req, res) => {

    try {
        console.log(req.query, ' Unread message-----')

    } catch (err) {

        return respError(res, err.message)
    }

}


/* 

    Normal function 

*/
exports.userChatLogin = async (data) => {
    const { username, password } = data
    try {
        const login = await rocketChatClient.login(username, password)
        rocketChatClient.setAuthToken(login.authToken)
        rocketChatClient.setUserId(login.userId)
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
        const chat = await inlinUserLogin({ username: admin.username, password: admin.password })
        const user = await rocketChatClient.users.create(userToAdd);
        const logout = await rocketChatClient.logout()
        rocketChatClient.setAuthToken(user.authToken)
        rocketChatClient.setUserId(user.userId)
        // console.log("🚀 ~ file: rocketChatController.js ~ line 52 ~ exports.createUser= ~ user", user)
        return user

    } catch (error) {
        // console.log(error)
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

