import { Photo } from './Photo';

export interface Member {
  id: number;
  userName: string;
  photoUrl: string;
  age: number;
  nickName: string;
  created: Date;
  lastActive: Date;
  gender: string;
  introduction: string;
  lookingFor: string;
  interests: string;
  city: string;
  country: string;
  photos: Photo[];
}
