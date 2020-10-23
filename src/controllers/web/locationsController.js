const { location } = require('../../modules')

module.exports.getAllStates = async (req, res) => {

    try {
        const data = await location.getAllStates()
        console.log(data, 'data-------')
        res.send(data)
        
    } catch (error) {

        res.send(error.message)
        
    }
}