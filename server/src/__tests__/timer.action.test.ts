import { TimerAction } from '../actions/timer.action';

global.fetch = jest.fn();

describe('TimerAction', () => {
  let timerAction: TimerAction;

  beforeEach(() => {
    timerAction = new TimerAction();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('checkTimeReached', () => {
    it("doit retourner TRUE si l'heure actuelle correspond", async () => {
      const date = new Date('2023-02-01T13:30:00Z');
      jest.setSystemTime(date);

      const result = await timerAction.checkTimeReached({ hour: 14, minute: 30 }, null);

      expect(result).toBe(true);
    });

    it("doit retourner FALSE si l'heure ne correspond pas", async () => {
      const date = new Date('2023-02-01T09:00:00Z');
      jest.setSystemTime(date);

      const result = await timerAction.checkTimeReached({ hour: 14, minute: 30 }, null);

      expect(result).toBe(false);
    });
  });

  describe('checkDayOfWeek', () => {
    it('doit retourner TRUE si on est le bon jour (ex: Lundi)', async () => {
      const monday = new Date('2024-01-01T12:00:00Z');
      jest.setSystemTime(monday);

      const result = await timerAction.checkDayOfWeek({ dayOfWeek: 1 });
      expect(result).toBe(true);
    });

    it('doit retourner FALSE si on est le mauvais jour (ex: Mardi)', async () => {
      const tuesday = new Date('2024-01-02T12:00:00Z');
      jest.setSystemTime(tuesday);

      const result = await timerAction.checkDayOfWeek({ dayOfWeek: 1 });
      expect(result).toBe(false);
    });
  });
});
