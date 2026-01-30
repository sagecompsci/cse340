const invModel = require("../models/inventory-model")
const utilities = require("../utilities/index")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
        errors: null,
    })
}

invCont.buildByInventoryId = async function (req, res) {
    const inventory_id = req.params.inventoryId
    const data = await invModel.getByInventoryId(inventory_id)
    const display = await utilities.buildDetailView(data)
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
        title: data.inv_make + ` ` + data.inv_model,
        nav,
        display,
        errors: null,
    })
}

invCont.buildManagementView = async function(req, res){
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
        title: "Management",
        nav,
        errors: null,
    })
}

invCont.classificationForm = async function(req, res){
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
    })
}

invCont.addClassification = async function(req, res){
    const {classification_name} = req.body

    const classificationResult = await invModel.addClassification(classification_name)

    if (classificationResult) {
        req.flash("notice", "You have successfully added a classification.")
    } else {
        req.flash("notice", "Sorry, adding a classification failed.")
    }

    let nav = await utilities.getNav()
    res.status(201).render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
    })
}


invCont.inventoryForm = async function (req, res){
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: "Add Inventory Item",
        nav,
        classificationList: classificationList,
        errors: null,
    })
}

invCont.addInventory = async function (req, res) {
    let classificationList = await utilities.buildClassificationList()
    let nav = await utilities.getNav()
    const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id} = req.body
    const inventoryResult = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

    if (inventoryResult) {
        req.flash("notice", "You have successfully added an inventory item.")
        res.status(201).render("./inventory/add-inventory", {
            title: "Add Inventory Item",
            classificationList: classificationList,
            nav,
            errors: null,
        })
    } else{
        req.flash("notice", "Sorry, adding a new inventory item failed.")
        res.status(500).render("./inventory/add-inventory", {
            title: "Add Inventory Item",
            nav,
            errors: null,
            classificationList: classificationList,
        })
    }

}
module.exports = invCont