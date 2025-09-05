export class WebResponse<T, Pagination = undefined> {
  statusCode?: number;
  data?: T;
  pagination?: Pagination;
  message?: string;
  errors?: any;
}

export class Pagination {
  currentPage: number;
  totalPage: number;
  totalData: number;
}
