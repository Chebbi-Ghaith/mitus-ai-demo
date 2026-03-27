import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import sessionsRouter from "./sessions";
import dashboardRouter from "./dashboard";
import integrationsRouter from "./integrations";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(playersRouter);
router.use(sessionsRouter);
router.use(dashboardRouter);
router.use(integrationsRouter);

export default router;
