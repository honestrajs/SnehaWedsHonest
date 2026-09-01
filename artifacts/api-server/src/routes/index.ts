import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weddingRouter from "./wedding";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weddingRouter);
router.use(storageRouter);

export default router;
