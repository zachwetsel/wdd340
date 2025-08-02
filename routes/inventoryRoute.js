// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.buildByInventoryId);
router.get("/cause-error", (req, res, next) => {
    try {
        throw new Error("This is an intentional 500 error.")
    } catch (err) {
        next(err)
    }
})

module.exports = router;