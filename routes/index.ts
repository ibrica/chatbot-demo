import  * as express from "express";
import controller from '../controllers';

let router = express.Router();
/* Routes */
router
    .get('/', controller.index)
    //facebook hooks
    .get('/fb/hook', controller.subscribe)

    .post('/fb/hook', controller.receive)

    //web demo
    .post('/web/message', controller.web)
    

export default router;
