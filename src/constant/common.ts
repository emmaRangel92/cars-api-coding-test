export enum APIPrefix {
  Version = 'api/v1'
}

export type MockType<T> = {
  [P in keyof T]: jest.Mock<unknown>
};