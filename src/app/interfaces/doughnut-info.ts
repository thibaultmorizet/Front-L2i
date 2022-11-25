import { DoughnutDataset } from "./doughnut-dataset";

export interface DoughnutInfo {
  labels?: Array<string>;
  datasets?: Array<DoughnutDataset>;
}
