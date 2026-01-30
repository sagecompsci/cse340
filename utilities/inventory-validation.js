const utilities = require(".")
const {body, validationResult} = require("express-validator")
const invModel = require("../models/inventory-model.js")
const validate = {}

validate.classificationRules = () => {
    return [
        body("classification_name")
            .isAlpha()
            .notEmpty()
            .withMessage("Enter a valid classification name")
            .custom(async (classification_name) => {
                if (classification_name.indexOf(" ") >= 0){
                    throw new Error("Classification name cannot have spaces.")}
            }),
    ]
}

validate.checkClassification = async(req, res, next) => {
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
        })
        return
    }
    next()
}


validate.inventoryRules = () => {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a make."),

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a model."),

        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({min: 4, max: 4})
            .withMessage("Please provide a valid year."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a description."),

        body("inv_image")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a valid image URL."),

        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a valid thumbnail URL."),

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Please provide a price."),

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Please provide miles."),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a color."),
    ]
}

validate.checkInventory = async(req, res, next) => {
    const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inventory/add-inventory", {
            errors,
            title: "Add Inventory Item",
            classificationList: await utilities.buildClassificationList(classification_id),
            nav,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}
module.exports = validate