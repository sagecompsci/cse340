const invModel = require("../models/inventory-model")
const utilities = require("../utilities/index")
const jwt = require("jsonwebtoken")

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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: "Management",
        nav,
        errors: null,
        classificationList: classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id){
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

invCont.updateInventory = async function (req, res) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getByInventoryId(inv_id)
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id,
    })
}

invCont.editInventory = async function (req, res) {
    let nav = await utilities.getNav()
    const {inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id} = req.body
    const editResult = await invModel.editInventory(inv_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

    const itemName = `${inv_make} ${inv_model}`
    if (editResult) {
        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/")
    } else{
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        })
    }
}


invCont.deleteInventoryConfirm = async function (req, res) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getByInventoryId(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
        title: "Edit " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
    })
}

invCont.deleteInventory = async function (req, res) {
    const inv_id = parseInt(req.body.inv_id)

    const deleteResult = await invModel.deleteInventory(inv_id)

    if (deleteResult) {
        req.flash("notice", `The inventory item was successfully deleted.`)
        res.redirect("/inv/")
    } else{
        req.flash("notice", "Sorry, the delete failed.")
        res.redirect(`/inv/delete/${inv_id}`)
    }
}

invCont.checkAccountType = async function (req, res, next){
        if (req.cookies.jwt) {
            const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)

            if (decoded.account_type === 'Employee' || decoded.account_type === 'Admin') {
                next()
            }
        }
        else {
            req.flash("notice", "Log in as an employee or admin")
            res.redirect("/account/login")
        }
}



module.exports = invCont