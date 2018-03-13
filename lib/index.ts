import { EloquentMongoose } from './eloquent/EloquentMongoose'
import { EloquentMongooseSpec } from './specs/EloquentMongooseSpec'

export const Mongoose = EloquentMongoose

export const Eloquent = {
  Mongoose<T, R>(): EloquentMongooseSpec<T, R> {
    return <any>EloquentMongoose
  }
}
export default Eloquent
export { QueryLog } from './query-builders/QueryLog'

export { EloquentBase } from './eloquent/EloquentBase'
export { EloquentMetadata } from './eloquent/EloquentMetadata'

export { IMongooseProvider } from './interfaces/IMongooseProvider'
export { IEloquentMetadata } from './interfaces/IEloquentMetadata'
export { IBasicQueryConditionGrammar, IBasicQueryGrammar } from './interfaces/IBasicQueryGrammar'
export { IEloquent } from './interfaces/IEloquent'
export { IQueryFetchResult } from './interfaces/IQueryFetchResult'

export { EloquentMongooseSpec } from './specs/EloquentMongooseSpec'
