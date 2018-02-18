import { QueryLogItem } from './QueryLog';
import * as Moment from 'moment';
export declare type QueryLogItem = {
    query: any;
    when: Moment.Moment;
    group: string;
};
export declare type QueryLogTransform = (item: QueryLogItem) => QueryLogItem;
export declare type QueryLogSpecs = {
    isEnabled(): boolean;
    enable(): QueryLogSpecs;
    disable(): QueryLogSpecs;
    clear(): QueryLogSpecs;
    push(query: any): QueryLogSpecs;
    push(query: any, group: string): QueryLogSpecs;
    pull(): QueryLogItem[];
    pull(group: string): QueryLogItem[];
    pull(since: Moment.Moment): QueryLogItem[];
    pull(transform: QueryLogTransform): QueryLogItem[];
    pull(group: string, since: Moment.Moment): QueryLogItem[];
    pull(group: string, transform: QueryLogTransform): QueryLogItem[];
    pull(since: Moment.Moment, group: string): QueryLogItem[];
    pull(since: Moment.Moment, until: Moment.Moment): QueryLogItem[];
    pull(since: Moment.Moment, transform: QueryLogTransform): QueryLogItem[];
    pull(transform: QueryLogTransform, since: Moment.Moment): QueryLogItem[];
    pull(transform: QueryLogTransform, group: string): QueryLogItem[];
    pull(group: string, since: Moment.Moment, until: Moment.Moment): QueryLogItem[];
    pull(group: string, since: Moment.Moment, transform: QueryLogTransform): QueryLogItem[];
    pull(since: Moment.Moment, until: Moment.Moment, group: string): QueryLogItem[];
    pull(since: Moment.Moment, transform: QueryLogTransform, group: string): QueryLogItem[];
    pull(group: string, since: Moment.Moment, until: Moment.Moment, transform: QueryLogTransform): QueryLogItem[];
    pull(since: Moment.Moment, until: Moment.Moment, transform: QueryLogTransform, group: string): QueryLogItem[];
    pull(transform: QueryLogTransform, since: Moment.Moment, until: Moment.Moment, group: string): QueryLogItem[];
};
export declare const QueryLog: QueryLogSpecs;