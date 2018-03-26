import { EloquentBase } from './EloquentBase'
import { OrderDirection, SubCondition } from '../interfaces/IBasicQueryGrammar'
import { IMongooseProvider } from '../interfaces/IMongooseProvider'
import { MongooseQueryBuilder } from '../query-builders/MongooseQueryBuilder'
import { Document, Schema, Model } from 'mongoose'
import collect, { Collection } from 'collect.js'
import { make } from 'najs-binding'
import { NotFoundError } from '../errors/NotFoundError'
import { SoftDelete } from '../../drivers/mongoose/SoftDelete'
import { EloquentMetadata } from './EloquentMetadata'
Schema.prototype['setupTimestamp'] = require('mongoose-timestamps-moment').setupTimestamp

export abstract class EloquentMongoose<T> extends EloquentBase<Document & T> {
  protected collection: string
  protected schema: Schema
  protected model: Model<Document & T>

  abstract getSchema(): Schema

  getId(): any {
    return this.attributes._id
  }

  setId(value: any): any {
    this.attributes._id = value
  }

  static Class(): any {
    return <any>EloquentMongoose
  }

  getModelName(): string {
    return this.getClassName()
  }

  // -------------------------------------------------------------------------------------------------------------------
  protected initializeModelIfNeeded() {
    const modelName: string = this.getModelName()
    const mongooseProvider: IMongooseProvider = this.getMongooseProvider()
    // prettier-ignore
    if (mongooseProvider.getMongooseInstance().modelNames().indexOf(modelName) !== -1) {
      return
    }

    const schema = this.getSchema()
    const sampleInstance = make<EloquentBase<Document & T>>(this.getClassName(), ['do-not-initialize'])
    if (EloquentMetadata.hasTimestamps(sampleInstance)) {
      schema.set('timestamps', EloquentMetadata.timestamps(sampleInstance))
    }
    if (EloquentMetadata.hasSoftDeletes(sampleInstance)) {
      schema.plugin(SoftDelete, EloquentMetadata.softDeletes(sampleInstance))
    }
    mongooseProvider.createModelFromSchema<Document & T>(modelName, schema)
  }

  protected initialize(data: Document & T | Object | undefined): EloquentMongoose<T> {
    this.initializeModelIfNeeded()
    this.model = this.getMongooseProvider()
      .getMongooseInstance()
      .model(this.getModelName())
    this.schema = this.model.schema
    return super.initialize(data)
  }

  protected getMongooseProvider(): IMongooseProvider {
    return make<IMongooseProvider>('MongooseProvider')
  }

  protected isNativeRecord(data: Document & T | Object | undefined): boolean {
    return data instanceof this.model
  }

  protected initializeAttributes(): void {
    this.attributes = new this.model()
  }

  protected setAttributesByObject(data: Object): void {
    this.attributes = new this.model()
    this.attributes.set(data)
  }

  protected setAttributesByNativeRecord(nativeRecord: Document & T): void {
    this.attributes = nativeRecord
  }

  protected getReservedPropertiesList() {
    return super
      .getReservedPropertiesList()
      .concat(Object.getOwnPropertyNames(EloquentMongoose.prototype), ['collection', 'model', 'schema'])
  }

  getAttribute(name: string): any {
    return this.attributes[name]
  }

  setAttribute(name: string, value: any): boolean {
    this.attributes[name] = value
    return true
  }

  newQuery(): any {
    this.registerIfNeeded()
    this.initializeModelIfNeeded()
    const softDeleteSettings: any = EloquentMetadata.hasSoftDeletes(this) ? EloquentMetadata.softDeletes(this) : false
    return new MongooseQueryBuilder(this.getModelName(), softDeleteSettings).setQueryLogGroup(this.getQueryLogGroup())
  }

  protected getQueryLogGroup(): string {
    return 'all'
  }

  newInstance(document?: Document & T | Object): EloquentMongoose<T> {
    const instance = make<EloquentMongoose<T>>(this.getClassName())
    return instance.initialize(document)
  }

  newCollection(dataset: Array<Document & T>): Collection<EloquentMongoose<T>> {
    return collect(dataset.map(item => this.newInstance(item)))
  }

  toObject(): Object {
    return Object.assign({}, this.attributes.toObject(), this.getAllValueOfAccessors())
  }

  toJson(): Object {
    const result = this.attributes.toJSON({
      getters: true,
      virtuals: true,
      versionKey: false
    })
    result['id'] = result['_id']
    delete result['_id']
    return Object.assign(result, this.getAllValueOfAccessors())
  }

  is(document: this): boolean {
    return this.attributes.equals(document.attributes)
  }

  fireEvent(event: string): this {
    this.model.emit(event, this)
    return this
  }

  touch() {
    if (EloquentMetadata.hasTimestamps(this)) {
      const opts = EloquentMetadata.timestamps(this)
      this.attributes.markModified(opts.updatedAt)
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  async save(): Promise<any> {
    return this.attributes.save()
  }

  async delete(): Promise<any> {
    if (EloquentMetadata.hasSoftDeletes(this)) {
      return this.attributes['delete']()
    }
    return this.attributes.remove()
  }

  async forceDelete(): Promise<any> {
    return this.attributes.remove()
  }

  async restore(): Promise<any> {
    if (EloquentMetadata.hasSoftDeletes(this)) {
      return this.attributes['restore']()
    }
  }

  async fresh(): Promise<this | undefined | null> {
    if (this.attributes.isNew) {
      // tslint:disable-next-line
      return null
    }
    const query = this.newQuery()
    return query.where(query.getPrimaryKey(), this.attributes._id).find()
  }

  // -------------------------------------------------------------------------------------------------------------------
  queryName(name: string): MongooseQueryBuilder {
    return this.newQuery().queryName(name)
  }
  static queryName(name: string): MongooseQueryBuilder {
    return Reflect.construct(this, []).queryName(name)
  }

  select(field: string): MongooseQueryBuilder
  select(fields: string[]): MongooseQueryBuilder
  select(...fields: Array<string | string[]>): MongooseQueryBuilder
  select(...fields: Array<string | string[]>): MongooseQueryBuilder {
    return this.newQuery().select(...fields)
  }
  static select(field: string): MongooseQueryBuilder
  static select(fields: string[]): MongooseQueryBuilder
  static select(...fields: Array<string | string[]>): MongooseQueryBuilder
  static select(...fields: Array<string | string[]>): MongooseQueryBuilder {
    return Reflect.construct(this, []).select(...fields)
  }

  distinct(field: string): MongooseQueryBuilder
  distinct(fields: string[]): MongooseQueryBuilder
  distinct(...fields: Array<string | string[]>): MongooseQueryBuilder
  distinct(...fields: Array<string | string[]>): MongooseQueryBuilder {
    return this.newQuery().distinct(...fields)
  }
  static distinct(field: string): MongooseQueryBuilder
  static distinct(fields: string[]): MongooseQueryBuilder
  static distinct(...fields: Array<string | string[]>): MongooseQueryBuilder
  static distinct(...fields: Array<string | string[]>): MongooseQueryBuilder {
    return Reflect.construct(this, []).distinct(...fields)
  }

  orderBy(field: string): MongooseQueryBuilder
  orderBy(field: string, direction: OrderDirection): MongooseQueryBuilder
  orderBy(field: string, direction: OrderDirection = 'asc'): MongooseQueryBuilder {
    return this.newQuery().orderBy(field, direction)
  }
  static orderBy(field: string): MongooseQueryBuilder
  static orderBy(field: string, direction: OrderDirection): MongooseQueryBuilder
  static orderBy(field: string, direction: OrderDirection = 'asc'): MongooseQueryBuilder {
    return Reflect.construct(this, []).orderBy(field, direction)
  }

  orderByAsc(field: string): MongooseQueryBuilder {
    return this.newQuery().orderByAsc(field)
  }
  static orderByAsc(field: string): MongooseQueryBuilder {
    return Reflect.construct(this, []).orderByAsc(field)
  }

  orderByDesc(field: string): MongooseQueryBuilder {
    return this.newQuery().orderByDesc(field)
  }
  static orderByDesc(field: string): MongooseQueryBuilder {
    return Reflect.construct(this, []).orderByDesc(field)
  }

  limit(records: number): MongooseQueryBuilder {
    return this.newQuery().limit(records)
  }
  static limit(records: number): MongooseQueryBuilder {
    return Reflect.construct(this, []).limit(records)
  }

  where(conditionBuilder: SubCondition): MongooseQueryBuilder
  where(field: string, value: any): MongooseQueryBuilder
  where(field: string, operator: Operator, value: any): MongooseQueryBuilder
  where(arg0: string | SubCondition, arg1?: Operator | any, arg2?: any): MongooseQueryBuilder {
    return this.newQuery().where(<any>arg0, arg1, arg2)
  }
  static where(conditionBuilder: SubCondition): MongooseQueryBuilder
  static where(field: string, value: any): MongooseQueryBuilder
  static where(field: string, operator: Operator, value: any): MongooseQueryBuilder
  static where(arg0: string | SubCondition, arg1?: Operator | any, arg2?: any): MongooseQueryBuilder {
    return Reflect.construct(this, []).where(<any>arg0, arg1, arg2)
  }

  orWhere(conditionBuilder: SubCondition): MongooseQueryBuilder
  orWhere(field: string, value: any): MongooseQueryBuilder
  orWhere(field: string, operator: Operator, value: any): MongooseQueryBuilder
  orWhere(arg0: string | SubCondition, arg1?: Operator | any, arg2?: any): MongooseQueryBuilder {
    return this.newQuery().orWhere(<any>arg0, arg1, arg2)
  }
  static orWhere(conditionBuilder: SubCondition): MongooseQueryBuilder
  static orWhere(field: string, value: any): MongooseQueryBuilder
  static orWhere(field: string, operator: Operator, value: any): MongooseQueryBuilder
  static orWhere(arg0: string | SubCondition, arg1?: Operator | any, arg2?: any): MongooseQueryBuilder {
    return Reflect.construct(this, []).orWhere(<any>arg0, arg1, arg2)
  }

  whereIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return this.newQuery().whereIn(field, values)
  }
  static whereIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return Reflect.construct(this, []).whereIn(field, values)
  }

  whereNotIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return this.newQuery().whereNotIn(field, values)
  }
  static whereNotIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return Reflect.construct(this, []).whereNotIn(field, values)
  }

  orWhereIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return this.newQuery().orWhereIn(field, values)
  }
  static orWhereIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return Reflect.construct(this, []).orWhereIn(field, values)
  }

  orWhereNotIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return this.newQuery().orWhereNotIn(field, values)
  }
  static orWhereNotIn(field: string, values: Array<any>): MongooseQueryBuilder {
    return Reflect.construct(this, []).orWhereNotIn(field, values)
  }

  whereNull(field: string) {
    return this.newQuery().whereNull(field)
  }
  static whereNull(field: string) {
    return Reflect.construct(this, []).whereNull(field)
  }

  whereNotNull(field: string) {
    return this.newQuery().whereNotNull(field)
  }
  static whereNotNull(field: string) {
    return Reflect.construct(this, []).whereNotNull(field)
  }

  orWhereNull(field: string) {
    return this.newQuery().orWhereNull(field)
  }
  static orWhereNull(field: string) {
    return Reflect.construct(this, []).orWhereNull(field)
  }

  orWhereNotNull(field: string) {
    return this.newQuery().orWhereNotNull(field)
  }
  static orWhereNotNull(field: string) {
    return Reflect.construct(this, []).orWhereNotNull(field)
  }

  withTrashed() {
    return this.newQuery().withTrashed()
  }
  static withTrashed() {
    return Reflect.construct(this, []).withTrashed()
  }

  onlyTrashed() {
    return this.newQuery().onlyTrashed()
  }
  static onlyTrashed() {
    return Reflect.construct(this, []).onlyTrashed()
  }

  async all(): Promise<any> {
    return this.newQuery().all()
  }
  static async all(): Promise<any> {
    return Reflect.construct(this, []).all()
  }

  async get(): Promise<any>
  async get(field: string): Promise<any>
  async get(fields: string[]): Promise<any>
  async get(...fields: Array<string | string[]>): Promise<any>
  async get(...fields: Array<string | string[]>): Promise<any> {
    return this.newQuery()
      .select(...fields)
      .get()
  }
  static async get(): Promise<any>
  static async get(field: string): Promise<any>
  static async get(fields: string[]): Promise<any>
  static async get(...fields: Array<string | string[]>): Promise<any>
  static async get(...fields: Array<string | string[]>): Promise<any> {
    return Reflect.construct(this, [])

      .select(...fields)
      .get()
  }

  async find(): Promise<any>
  async find(id: any): Promise<any>
  async find(id?: any): Promise<any> {
    if (typeof id !== 'undefined') {
      const query = this.newQuery()
      return query.where(query.getPrimaryKey(), id).find()
    }
    return this.newQuery().find()
  }
  static async find(id: any): Promise<any>
  static async find(id?: any): Promise<any> {
    if (typeof id !== 'undefined') {
      const query = this.prototype.newQuery()
      return query.where(query.getPrimaryKey(), id).find()
    }
    return Reflect.construct(this, []).find()
  }

  async first(): Promise<any> {
    return this.newQuery().first()
  }
  static async first(): Promise<any> {
    return Reflect.construct(this, []).first()
  }

  pluck(value: string): Promise<Object>
  pluck(value: string, key: string): Promise<Object>
  pluck(value: string, key?: string): Promise<Object> {
    return this.newQuery().pluck(value, key)
  }
  static async pluck(value: string): Promise<Object>
  static async pluck(value: string, key: string): Promise<Object>
  static async pluck(value: string, key?: string): Promise<Object> {
    return Reflect.construct(this, []).pluck(value, key)
  }

  async count(): Promise<number> {
    return this.newQuery().count()
  }
  static async count(): Promise<number> {
    return Reflect.construct(this, []).count()
  }

  native(handler: (native: any) => any): Promise<any> {
    return this.newQuery().native(handler)
  }
  static native(handler: (native: any) => any): Promise<any> {
    return Reflect.construct(this, []).native(handler)
  }

  async findById(id: any): Promise<any> {
    return this.find(id)
  }
  static async findById(id: any): Promise<any> {
    return this.find(id)
  }

  async findOrFail(id: any): Promise<any> {
    const value = await this.find(id)
    if (!value) {
      throw new NotFoundError(this.getClassName())
    }
    return value
  }
  static async findOrFail(id: any): Promise<any> {
    const value = await this.find(id)
    if (!value) {
      throw new NotFoundError(this.prototype.getClassName())
    }
    return value
  }
}
