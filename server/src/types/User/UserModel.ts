import { Collection } from 'mongodb';
import { User } from './User';

export type UserModel = Collection<User>;
