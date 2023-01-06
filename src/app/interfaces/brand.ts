import { Video } from './video';

export interface Brand {
    id?: number;
    name?: string;
    videos?: Array<Video>;
}
