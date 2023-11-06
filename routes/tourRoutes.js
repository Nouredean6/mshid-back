
const express = require('express');
const router = express.Router();
const {upload} =require('../utils/fileUplaod');
const { createTour, getTours, getTour, deleteTour, updateTour} = require('../controllers/tourControllers');

router.post('/',upload.single("image"), createTour );
router.patch("/:id", upload.single("image"), updateTour);
router.get("/", getTours);
router.get("/:id", getTour);
router.delete("/:id", deleteTour);


module.exports = router;