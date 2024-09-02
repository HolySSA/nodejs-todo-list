export default (err, req, res, next) => {
  console.log('에러 처리 미들웨어가 실행되었습니다.');
  console.error(err);

  // 데이터 유효성(joi)에서의 에러이므로
  if (err.name === 'ValidationError')
    return res.status(400).json({ errorMessage: err.message });

  return res
    .status(500)
    .json({ errorMessage: '서버에서 에러가 발생했습니다.' });
};
