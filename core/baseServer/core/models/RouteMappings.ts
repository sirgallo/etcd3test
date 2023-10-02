import { ICustomMessage, CustomMessage } from '@core/models/ILog';


export interface BaseRoute {
  key: string;
  name: string;
  subRouteMappings?: subRouteMappings;
}

interface SubRouteMap {
  key: string;
  name: string;
  customConsoleMessages?: CustomMessage<Record<string, ICustomMessage<Function>>>[];
}

type subRouteMappings = Record<string, SubRouteMap>;