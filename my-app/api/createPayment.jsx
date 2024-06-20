import axios from "axios";
const createPaymentIntent = (data) => {
  return new Promise(function (resolve, reject) {
    axios
      .post("http://localhost:3000/payment-sheet", data)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export default createPaymentIntent;
