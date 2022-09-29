import { Article } from "./article";

export interface Format {
    id?: number;
    format_name?: string;
    articles?: Array<Article>;
    count_articles?: number;
    filter_is_selected?: Boolean;

}
