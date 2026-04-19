// Root component ของ WebAdmin — render AuthRouter เพียงอย่างเดียว ไม่มี logic เพิ่มเติม
//
// หลักการทำงาน:
// 1. render AuthRouter ซึ่งกำหนด routes ทั้งหมดของ WebAdmin
// 2. ไม่มี logic เพิ่มเติม — App เป็นแค่ entry point wrapper

import AuthRouter from "./app/router/authRouter";

function App() {
  return <AuthRouter />;
}

export default App;