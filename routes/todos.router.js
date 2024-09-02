import express from 'express';
import joi from 'joi';
import Todo from '../schemas/toso.schema.js';

const router = express.Router();

/*
 * 1. `value` 데이터는 **필수적으로 존재**해야한다.
 * 2. `value` 데이터는 **문자열 타입**이어야한다.
 * 3. `value` 데이터는 **최소 1글자 이상**이어야한다.
 * 4. `value` 데이터는 **최대 50글자 이하**여야한다.
 * 5. 유효성 검사에 실패했을 때, 에러가 발생해야한다.
 */
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/** 할 일 등록 API **/
router.post('/todos', async (req, res, next) => {
  try {
    // 클라이언트로부터 value 데이터 가져오기
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    // value 데이터 유효성 검사
    if (!value)
      return res
        .status(400)
        .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다!' }); // 400: client 에러

    // 해당하는 마지막 order 데이터 조회 - findOne() : 한 개의 데이터만 조회
    const todoMaxOrder = await Todo.findOne().sort('-order').exec(); // 내림차순 정렬에서 첫 번째 데이터
    // todoMaxOrder 존재 시 현재 해야할 일+1, 존재 X 시 1로 할당
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;
    // 해야할 일 등록
    const todo = new Todo({ value, order });
    await todo.save(); // 데이터 베이스(MongoDB) 저장
    // 해야할 일 클라이언트에게 반환(return)
    return res.status(201).json({ todo: todo });
  } catch (error) {
    // router 다음에 있는 에러 처리 미들웨어를 실행시킨다.
    next(error);
  }
});

/** 할 일 조회 API **/
router.get('/todos', async (req, res, next) => {
  // 해야할 일 목록 조회
  const todos = await Todo.find().sort('-order').exec();
  // 해야할 일 목록 조회 결과 클라이언트에게 반환
  return res.status(200).json({ todos });
});

/** 할 일 순서 변경(Update-Fatch), 완료/해제, 내용 변경 API **/
router.patch('/todos/:todoId', async (req, res, next) => {
  // 데이터 가져오기
  const { todoId } = req.params;
  const { order, done, value } = req.body; // 순서, 완료여부, 내용

  // 현재 나의 order가 무엇인지 조회하고 파악
  const curTodo = await Todo.findById(todoId).exec();
  if (!curTodo)
    return res
      .status(404)
      .json({ errorMessage: '해당 해야할 일이 존재하지 않습니다.' });

  // 해당 순서 존재 시
  if (order) {
    // 바꿀 순서 존재?
    const targetTodo = await Todo.findOne({ order: order }).exec();
    // 바꿀 순서에 해당하는 데이터 존재 시
    if (targetTodo) {
      targetTodo.order = curTodo.order;
      await targetTodo.save(); // 바뀐 타겟 데이터 MongoDB 저장
    }

    // 바꿀 데이터가 존재하거나 말거나 현재 데이터는 요청한 order로 변경
    curTodo.order = order;
  }

  // 완료했는지 안했는지 검사 후 할당
  if (done !== undefined) {
    curTodo.doneAt = done ? new Date() : null;
  }

  // 데이터 내용 변경 요청 시 데이터(value) 확인 후 할당
  if (value) curTodo.value = value;

  // 전달받은 명령 저장
  await curTodo.save();

  return res.status(200).json({});
});

/** 할 일 삭제 API **/
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo)
    return res
      .status(404)
      .json({ errorMessage: '존재하지 않는 해야할 일 정보입니다.' });

  // deleteOne : 데이터 `한 개` 삭제
  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;
