// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")
const invValidate = require("../utilities/inventory-validation")

router.get("/", utilities.handleErrors(invController.buildManagementView))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build by inventory id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))

//route to build add classification form
router.get("/add-classification", utilities.handleErrors(invController.classificationForm))

router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassification,
    utilities.handleErrors(invController.addClassification))

// route to build add inventory item form
router.get("/add-inventory", utilities.handleErrors(invController.inventoryForm))

router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventory,
    utilities.handleErrors(invController.addInventory)
)


module.exports = router;