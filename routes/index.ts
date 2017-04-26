import  * as express from "express";
import { Request, Response } from "express";
import controller from '../controllers';

let router = express.Router();
/* GET home page. */
router
    .get('/', function(req:Request, res:Response) {
      res.render('index', { title: 'chatbot-demo' });
    })
    //facebook hooks
    .get('/fb/hook', controller.subscribe)

    .post('/fb/hook', controller.receive)
    

export default router;
