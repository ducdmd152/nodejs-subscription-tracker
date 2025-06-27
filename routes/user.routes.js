import {Router} from "express";
import {authenticate, authorize} from "../middlewares/auth.middleware.js";
import {getUser, getUsers} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get('/', authenticate, authorize(0), getUsers);

userRouter.get('/:id', authenticate, authorize(0), getUser);

userRouter.post("/", (req, res) => {
    return res.send({
        title: "Created user"
    })
})

userRouter.put("/:id", (req, res) => {
    return res.send({
        title: "Update user "
    })
})


userRouter.delete("/:id", (req, res) => {
    return res.send({
        title: "Delete user "
    })
})

export default userRouter;