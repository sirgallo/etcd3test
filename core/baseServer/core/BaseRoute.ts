import { 
  Response, Router, Request, NextFunction 
} from 'express';


export interface RouteOpts {
  method: string;
  customMsg: any;
}


/*
  All routes need to extend this class
*/
export abstract class BaseRoute {
  protected name: string;
  protected router: Router;
  protected rootpath: string;
  
  constructor(rootpath: string) {
    this.rootpath = rootpath;
    this.router = Router();
  }

  protected async pipeRequest(opts: RouteOpts, req: Request, res: Response, next: NextFunction, params: any): Promise<boolean> {
    const validated = await this.validateRoute(req, res, next);
    if (validated) { 
      await this.performRouteAction(opts, req, res, next, params);
      return true;
    } else {
      res
      .status(403)
      .send({ err: 'unauthorized on route' });

      return false;
    }
  }

  abstract validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean>;
  abstract performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, params: any);
}