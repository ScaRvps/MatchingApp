import { User } from './User';
export class UserParams {
    pageNumber = 1;
    pageSize = 5;
    minAge = 18;
    maxAge = 99;
    gender: string;
    orderBy = "lastActive";

    constructor(user: User) {
        this.gender = user.gender === 'male' ? 'female' : 'male';
    }
}