const express = require("express")
const router = express.Router()

const { capturePayment, verifySignature } = require("../controller/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature)

module.exports = router