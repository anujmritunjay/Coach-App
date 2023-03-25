const UserModel = require('./../model/userModel')
const helper = require('./../utils/helper')
const jwt = require('jsonwebtoken');
const template = require('./../utils/accountVerificationTemplate');

const createToken = (userId)=>{;
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });
}

exports.signup = async(req, res, next) => {
  try {
    if(req.body.password && req.body.confirmPassword){
        if(req.body.password === req.body.confirmPassword){
            const user = await UserModel.create(req.body)
            if(user){
                const token = await user.accountVerifactionToken()
                const link = `http://localhost:8080/auth/account-verification?token=${token}`;
                const mailObj = {
                    to: user.email,
                    subject: `Welcome to Coach App`,
                    html: template.accountVerificationTemplate({
                        userDetail: user,
                        link: link,
                      }),  
                }
                await user.save({ validateBeforeSave: false });
                const response = await helper.sendEmail(mailObj);
              res.send(user)
            }else{
              res.json({
                  status: "Failed",
                  message: "Failed to create user"
              })
            }
        }else{
            res.json({
                status: "Failed",
                message: "Password and confirm Password did not matched."
            })
          }
    }else{
        res.json({
            status: "Failed",
            message: "Please Provide password and Confirm Password."
        })
      }
    next();
  } catch (error) {
     res.send(error)
  }
};

exports.accountVerify = async(req, res, next)=>{
    try {
      const { token } = req.body
      if(token){
        const user = await UserModel.findOne({accountVerificationToken : token})
        if(user && user._id){
            user.isAccountVerifed = true;
            user.accountVerificationToken = null;
            await user.save();
            res.json({
                status: 'success',
                message: 'Your account is verified!.'
            })
        }else{
            res.json({
                status: 'Failed',
                message: 'No user founded with provided token!.'
            })
        }
      }else{
        res.json({
            status: 'Failed',
            message: 'No token provided.'
        })
      }
     next();   
    } catch (error) {
        res.send(error)
    }
}


exports.forgotPassword = async(req, res, next)=>{
    const { emailOrPhone } = req.body
    console.log('emailOrPhone: ', emailOrPhone);
    if(emailOrPhone){
        const user = await UserModel.findOne({$or: [
            { email: emailOrPhone },
            { phoneNumber: emailOrPhone }
        ]})
        if(user && user._id){
            const token = await helper.generateRandom();
            user.forgotPasswordToken = token;
            await user.save();
            const link = `http://localhost:8080/auth/forgot-password?token=${token}`;
            const mailObj = {
                to: user.email,
                subject: `Welcome to Coach App`,
                html: template.accountVerificationTemplate({
                    userDetail: user,
                    link: link,
                    }),  
            }
            const response = await helper.sendEmail(mailObj);
            res.json({
                status: "Success",
                message: "Please check you e-mail."
            })

        }else{
            res.json({
                    status: "Failed",
                    message: "User not found!."
            })
        }
    }
    next();
}

exports.changePassword = async (req, res, next)=>{
   try {
      const { token, password, confirmPassword } = req.body
      if(token){
        const user = await UserModel.findOne({forgotPasswordToken : token})
        if(user && user._id){
            if(password && confirmPassword && (password === confirmPassword)){
                user.password = password
                user.forgotPasswordToken = null;
                await user.save();
                res.json({
                    status: "Failed",
                    message: "You password changed successfully."
                })
            }else{
                res.json({
                    stauts: "Failed",
                    message: "Password and confirm Password did not matched!."
                })
            }
        }else{
            res.json({
                status: 'Failed',
                message: 'No user founded with provided token!.'
            })
        }
      }else{
        res.json({
            status: 'Failed',
            message: 'No token provided.'
        })
      }
     next();   
    } catch (error) {
        res.send(error)
    }
}

exports.login = async(req, res, next) => {
    try {
      const { emailOrPhone, password } = req.body
      if(password && emailOrPhone){
        const user = await UserModel.findOne({$or: [
            { email: emailOrPhone },
            { phoneNumber: emailOrPhone }
        ]}).select("+password")
        if(user && user._id){
            if(user.isAccountVerifed){
                console.log('user.isAccountVerifed: ', user.isAccountVerifed);
                if(user && (await user.correctPassword(password, user.password))){
                    const token = createToken(user._id);
                    user.password = undefined;
                    res.json({
                        user: user,
                        token: token
                    })
        
                }else{
                    res.json({
                        status: "Failed",
                        message: "Invalid Credentials."
                    })
                }
            }else{
                res.json({
                    stauts: "Failed",
                    message: "Your account is not verified. Kindly check your email for verification link."
                })
            }
        }else{
            res.json({
                status: "Failed",
                message: "Invalid Credentials."
            })
        }
      }else{
          res.json({
              status: "Failed",
              message: "Email/Phone or Password is missing."
          })
        }
      next();
    } catch (error) {
       res.send(error)
    }
  };

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (
          req.headers.authorization &&
          req.headers.authorization.startsWith('Bearer')
        ) {
          token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.json({
                status: "Failed",
                message: "Missing Authentication"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const currentUser = await UserModel.findById(decoded.userId);
        if (!currentUser) {
            res.json({
                status: "Failed",
                message: "'The user belonging to this token does no longer exist.'"
            })
        }
        req.user = currentUser;
        next();
        
    } catch (error) {
        res.send(error)
    }
   
  };
  
  