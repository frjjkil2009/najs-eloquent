import { IAutoload } from 'najs-binding';
import { Eloquent } from '../model/Eloquent';
import { EloquentMetadata } from '../model/EloquentMetadata';
import { IEloquentDriver } from './interfaces/IEloquentDriver';
import { Document, Model, Schema } from 'mongoose';
import { MongooseQueryBuilder } from '../query-builders/mongodb/MongooseQueryBuilder';
export declare class MongooseDriver<T extends Object = {}> implements IAutoload, IEloquentDriver {
    protected attributes: Document & T;
    protected metadata: EloquentMetadata;
    protected eloquentModel: Eloquent<T>;
    protected mongooseModel: Model<Document & T>;
    protected queryLogGroup: string;
    protected modelName: string;
    protected isGuarded: boolean;
    constructor(model: Eloquent<T>, isGuarded: boolean);
    getClassName(): string;
    initialize(data?: any): void;
    protected initializeModelIfNeeded(): void;
    protected getMongooseSchema(): Schema;
    protected createAttributesByData(data?: any): void;
    getRecord(): T;
    getAttribute(name: string): any;
    setAttribute(name: string, value: any): boolean;
    getId(): any;
    setId(id: any): void;
    newQuery(): MongooseQueryBuilder<T>;
    toObject(): Object;
    toJSON(): Object;
    is(model: any): boolean;
    formatAttributeName(name: string): string;
    getReservedNames(): string[];
    getDriverProxyMethods(): string[];
    getQueryProxyMethods(): string[];
    touch(): Eloquent<T>;
    save(): Promise<any>;
    delete(): Promise<any>;
    forceDelete(): Promise<any>;
    restore(): Promise<any>;
    fresh(): Promise<T | null>;
}
