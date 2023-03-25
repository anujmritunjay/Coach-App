const nodemailer = require("nodemailer");
const sendEmail = async (mailObj)=>{
    try {
        console.log('Hello from the sending email function')
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        },
      });
      return new Promise((resolve) => {
        transporter.sendMail({ ...mailObj, from: '"Coach App" <mritunjay.projects@gmail.com>' }, (err, info) => {
          if (err) {
            resolve({ success: false, data: err })
          } else {
            resolve({ success: true, data: info })
          }
        });
      })
    } catch (error) {
        console.log(error)
    }
}

const generateRandom = async() =>{
    var uniqid = require('uniqid'); 
    const token = uniqid()
    return token;
}

module.exports = {
    sendEmail,
    generateRandom
}