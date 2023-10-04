/*
  Get All Response
    when issuing a getAll, returns
    {
      key1: value,
      key2: value,
      ...
    }
*/
export type GetAllResponse = {
  [key: string]: string;
};