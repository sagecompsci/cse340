const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
}

baseController.throwError = async function(){
    let err = new Error('Internal Server Error')
    err.status = 500;
    throw err
}

module.exports = baseController