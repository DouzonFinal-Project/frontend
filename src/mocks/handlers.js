// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // 로그인 API Mock
  rest.post('/v1/login', (req, res, ctx) => {
    const { username } = req.body;
    return res(
      ctx.status(200),
      ctx.json({
        token: 'dummy-token',
        user: { id: 1, name: username || '홍길동' },
      })
    );
  }),

  // // 출결 조회 API Mock
  // rest.get('/v1/attendance', (req, res, ctx) => {
  //   return res(
  //     ctx.status(200),
  //     ctx.json([
  //       { date: '2025-08-01', status: '출석', reason: '' },
  //       { date: '2025-08-02', status: '결석', reason: '병가' },
  //     ])
  //   );
  // }),

  // 추가 API 핸들러를 여기 더 작성 가능
];
