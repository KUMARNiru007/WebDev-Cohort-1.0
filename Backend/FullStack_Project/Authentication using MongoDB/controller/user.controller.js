import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

const registerUser = async (req,res) => {
    //get data
    //validate
    //check if user already exist
    //if not create a new user in database
    //create a verification token
    //save in database
    //send token as email to user
    //send success status to user

    const {name,email,password} = req.body 
    // we get data from the postman body 
    if(!name || !email || !password){
        return res.status(400).json({
            message: "All fields are required"
        })
    }
  try {
    const existingUser = await User.findOne({email})
   if(existingUser){
     return res.status(400).json({
        message: "user already exists"
     })   
   }


  const user = await User.create({
    name,
    email,
    password,
   })
   console.log(user)


  if(!user){
   res.status(400).json({
        message: "user not registered"
     })
  }

  const token = crypto.randomBytes(32).toString("hex")

  console.log(token)


  user.verificationToken = token
  await user.save()

  //send email
  const transporter = await nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
    },
  });
  
  const mailOption = {
    from: process.env.MAILTRAP_SENDEREMAIL , // sender address
    to: user.email , // list of receivers
    subject: "verify you email", // Subject line
    text: `Please click on the following link:  ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
  
  }

  try {
    await transporter.sendMail(mailOption);
    console.log("Verification email sent successfully");

} catch (error) {
    console.log("Error sending email:",error);
    return res.status(400).json({
        message: "Error sending verification email",
        error,
    });
}
   res.status(201).json({
    message: "User registered",
    success: true
   })


  }
  catch (error) {
    res.status(400).json({
      message: "User not registered",
      error ,
      success: false

  })

  }
}

const verifyUser = async (req,res) => {
  //get token from url 
  //validate token
  // find user based on token
  // if not
  // isVerified to true
  // remove verification token
  //save
  //return response

  const{token} = req.params
  console.log(token)

  if(!token){
    return res.status(400).json({
      message: "Invaid token"
    })
  }

  const user = await User.findOne({verificationToken :token})

  if(!user){
    return res.status(400).json({
      message: "Invaid token"
    })
  }
  
  user.isVerified = true

  user.verificationToken = undefined
  
  await user.save()

  res.status(201).json({
    message: "User verified",
    success: true

  })

}

const login = async (req,res) => {
  const {email,password} =req.body

  if(!email || !password){
    return res.status(400).json({
      message: "all fields are required"
    })
  }
  try {
    //User - whole document moongoose model

    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        message: "Inavalid email or password"
      })
    }

      const isMatch = await bcrypt.compare(password, user.password)
      console.log(isMatch)

      if(!isMatch){
        return res.status(400).json({
          message: "Invalid email or password"
        })
      }




      const token = jwt.sign(
        {id: user._id , role: user.role},

        process.env.JWT_KEY, 
        {
          expiresIn : '24h',
        }
      )
      //token send to user from backend via cookies 

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
      } 


      res.cookie("token", token ,cookieOptions) 

      res.status(200).json({
        succes:true,
        message: "Login successful",
        token,
        user:{
          id: user._id,
          name:user.name,
          role:user.role,
        }

      })


    }  catch (error) {
      res.status(400).json({
        succes: false,
        message: "Login unsuccessful", })

  }
}
 
const getMe = async (req,res) => {
  try {
    const data = req.user
    console.log("data",data)
   const user = await User.findById(req.user.id).select('password')
     console.log("Reached at profile error")

     if(!user){
      return res.status(400).json({
        succes:false,
        message:"User not found"
      })
     }

    return  res.status(200).json({
      success:true,
      user,
      message: "user found"
     })
  


  } catch(error){
    console.log("Error in get me", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",})

  }
}

const logoutUser = async (req,res) => {
  try {
    res.cookie('token', '' , {}) //expires: new Date (0) // immediately make it clear
     return  res.status(200).json({
        success:true,
        message: "Logged out successfully"
       })
    
  } catch(error) {
    return res.status(500).json({
      success: false,
      message: "Logged out failed",})

  }
}

const forgotPassword = async (req,res) => {
  //get email
  //find user based on email
  // reset token + reset expiry => Date.now() + 10 *60 *1000 => user.save()
  //send mail => design url
  try {
    
  } catch {

  }
}
const resetPassword = async (req,res) => {
  try {

    //collect token from params
    // password from req.body
    const {token} = req.params
    const {password} = req.body

    try {
     const user = User.findOne({
      resetPAsswordToken: token,
      resetPasswordExpires:{$gt: Date.now()} // greater that now Date
     })

     //set password in user
     // resetToken , resetExpiry
     //save 
    }
    catch(error){

    }
  } catch(error) {

  }

}

export {
  registerUser,
  verifyUser,
  login,
  getMe,
  logoutUser,
  resetPassword,
  forgotPassword,
};