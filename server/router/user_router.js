const express = require("express");
const router = express.Router();
const user_controller = require("../controller/user_controller");
const { requireAuth, userCurrent } = require("../middleware/userAuth");

//Get Requests
router.get('*', userCurrent);

router.get("/", user_controller.login_get);
//router.get("/requireauth", requireAuth);

router.get("/content", user_controller.content_get);

router.post("/content", user_controller.content_post);

router.get("/sighup", user_controller.sighUp_get);

router.get("/cart", user_controller.cart_get);

router.get("/login", user_controller.login_get);

router.get("/product", user_controller.product_get);

router.get("/logout", user_controller.logout_get);
//Post Requests
router.post("/sighup", user_controller.sighUp_post);

router.post("/login", user_controller.login_post);



module.exports = router;
