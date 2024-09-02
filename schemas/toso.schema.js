import mongoose from 'mongoose'; // mongoose 임포트

const TodoSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true, // value 필드는 필수 요소.
  },
  order: {
    type: Number,
    required: true, // order 필드 또한 필수 요소.
  },
  doneAt: {
    type: Date, // doneAt 필드는 Date 타입.
    required: false, // doneAt 필드는 필수 요소 X.
  },
});

// 프론트엔드 서빙
TodoSchema.virtual('todoId').get(function () {
  return this._id.toHexString();
});
TodoSchema.set('toJSON', {
  virtuals: true,
});

// TodoSchema를 바탕으로 Todo모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model('Todo', TodoSchema);
