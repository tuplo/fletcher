import { delay } from './delay';

describe('delay', () => {
  it('delays execution of given function', () => {
    jest.useFakeTimers();
    const fnSpy = jest.fn();

    delay(30_000, fnSpy);
    expect(fnSpy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(30_000);
    expect(fnSpy).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
