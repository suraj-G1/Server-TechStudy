const express = require('express');
const router = express.Router();

const {
    addProduct,
    getAllProduct,
    getProductDetails,
    deleteProduct
} = require('../controller/Product');

const {
    createRatingAndReview ,getAllRating,getAverageRating
} = require('../controller/RatingAndReview')
const {auth,isAdmin,isCustomer} = require('../middlewares/auth');


router.post('/addProduct',auth,isAdmin,addProduct);
router.get('/getProductDetails',auth,getProductDetails);
router.get('/getAllProduct',auth,getAllProduct);
router.delete('/deleteProduct',auth,isAdmin,deleteProduct);

router.post('/createRating',auth,isCustomer,createRatingAndReview);
router.get('/getAverageRating',getAverageRating);
router.get('/getAllRating',getAllRating);

module.exports = router;

