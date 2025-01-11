const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");

const asyncHandler = require("express-async-handler");
const {generateToken} = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailCtrl")
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const createUser= asyncHandler(async (req, res) =>{
    const email = req.body.email;
    const findUser = await User.findOne({email:email});
    if (!findUser){
        // create a new User
        const newUser = await User.create(req.body);
        res.json(newUser);

    } else {
        // user already exists
        throw new Error("User already exists");
    }
});

const loginUserCtrl=asyncHandler(async(req, res) =>{
    const { email, password } = req.body;

    // check if user exists or not
    const findUser = await User.findOne({ email });

    if (findUser && await findUser.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
            refreshToken:refreshToken
        },
        {new:true}
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge: 72*60*60*1000
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    } else {
        throw new Error("Invalid Credentials")
    }
    
})

// save user address

const saveAddress = asyncHandler(async (req, res, next)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address:req?.body?.address
            },
            {new:true}
        )
        res.json(updatedUser);
    } catch(error){
        throw new Error(error);
    }
})

// GEt all users
const getallUser = asyncHandler(async (req, res)=>{
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch(error) {
        throw new Error(error);
    }
})

// get singe user

const getaUser = asyncHandler(async (req, res) =>{
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findById(id);
        res.json({
            user
        })
    }
    catch (error){
        throw new Error(error);
    }
})

// update a user

const updateUser = asyncHandler(async (req, res)=>{
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
        id,
        {
            firstname:req?.body?.firstname,
            lastname:req?.body?.lastname,
            email:req?.body?.email,
            mobile:req?.body?.mobile
        },
        {
           new:true 
        });
       res.json({
            updatedUser
       });
    }
    catch (error){
        throw new Error(error);
    }
})

const deleteUser = asyncHandler(async (req, res) =>{
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findByIdAndDelete(id);
        res.json({
            user
        })
    }
    catch (error){
        throw new Error(error);
    }
})

const blockUser = asyncHandler(async (req, res)=>{
    const { id } = req.params;
    validateMongoDbId(id);
    console.log('block user ' + id)
    try{
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked:true,
            },
            {
                new:true 
            });
            res.json({
                message:"User Blocked"
            })
    } catch(error){

    }
});

const unblockUser = asyncHandler(async (req, res)=>{
    const { id } = req.params;
    validateMongoDbId(id);
    try{
        const unblock = await User.findByIdAndUpdate(
            id,
            {
                isBlocked:false,
            },
            {
                new:true 
            });
            res.json({
                message:"User Unblocked"
            })
    } catch(error){

    }
});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res)=>{
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({ refreshToken });
    if (!user)  throw new Error("No refresh token present in db or not matched");
    
        jwt.verify(refreshToken, process.env.JWT_SECRET,(err,decoded)=>{
            if (err || user.id!==decoded.id){
                throw new Error("There is something wrong with refersh token");
            }
            const accessToken = generateToken(user?._id);
            res.json({ accessToken });
        });
    
});

//logout functionality

const logout = asyncHandler(async (req, res)=>{
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly:true,
            secure:true
        })
        return res.sendStatus(204); // no content
    }
    await User.findByIdAndUpdate(user._id, {
        refreshToken:""
    })
    res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true
    })
    return res.sendStatus(204); // no content
})    

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const {password} = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const userWithUpdatedPassword = await user.save();
        res.json(userWithUpdatedPassword);
    } else {
        res.json(user);
    }
})

const forgotPasswordToken = asyncHandler(async(req, res)=>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) throw new Error("User not found with this email")
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetUrl = `<a href='http://localhost:4000/api/user/reset-password/${token}'>Click Here</a> Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes form now. `
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            htm: resetUrl
        }
        sendEmail(data);
        res.json(token);
    } catch(error) {
        throw new Error(error);
    }
})

const resetPassword = asyncHandler(async(req, res)=>{
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt:Date.now()}
    })
    if (!user) throw new Error(" Token Expired, Please try again later");
    user.password = password;;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();
    res.json(user);
})

// admin login
const loginAdmin=asyncHandler(async(req, res) =>{
    const { email, password } = req.body;

    // check if user exists or not
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role!=="admin") throw new Error("Not Authorised");
    if (findAdmin && await findAdmin.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateuser = await User.findByIdAndUpdate(
        findAdmin.id,
        {
            refreshToken:refreshToken
        },
        {new:true}
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge: 72*60*60*1000
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id)
        });
    } else {
        throw new Error("Invalid Credentials")
    }
    
})

const getWishList = asyncHandler(async(req,res)=>{
    const {_id} = req.user;
    try{
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch(error){
        throw new Error(error)
    }
})

const userCart = asyncHandler(async(req,res)=>{
    const { cart } = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
    
    try {
        let products = [];
        const user = await User.findById(_id);
        // check if user already have products in cart
        const alreadyExistCart = await Cart.findOne({orderby:user._id})
        if (alreadyExistCart){
           await alreadyExistCart.deleteOne();
        }
        for(let i=0; i<cart.length;i++){
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal =0;
        for(let i=0;i<products.length;i++){
            cartTotal=cartTotal+products[i].price * products[i].count;
        }
        //console.log(products, cartTotal);
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby:user?._id
        }).save();
        res.json(newCart);
    } catch (error) {
        throw new Error(error)
    }
})

const getUserCart = asyncHandler(async(req,res)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const cart = await Cart.findOne({orderby:_id}).populate(
            "products.product"
            //,"_id title price"
        );
        res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})

const emptyCart = asyncHandler(async(req,res)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const user = await User.findOne({_id});
        const cart = await Cart.findOneAndDelete({orderby:user._id});
        res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})

const applyCoupon = asyncHandler(async(req,res)=>{
    const {coupon} = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
    const validCoupon = await Coupon.findOne({name:coupon})
    if (validCoupon===null){
        throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({_id});
  
    //const cart = await Cart.findOne({orderby:user._id.toString()}).populate(
    //    "products.product"
        //,"_id title price"
   /// );
    const cart = await Cart.findOne({orderby: user._id})
    
    let cartTotal = cart.cartTotal;
    
    let totalAfterDiscount = (
        cartTotal -
        (cartTotal*validCoupon.discount)/100
    ).toFixed(2);
    
    await Cart.findOneAndUpdate(
        {orderby:user._id},
        {totalAfterDiscount},
        {new:true}
    );
    res.json(totalAfterDiscount)
})


const createOrder = asyncHandler(async(req,res)=>{
    const { COD, couponApplied } = req.body;
    const {_id} = req.user;
    validateMongoDbId(_id);
    if (!COD) throw new Error("Create cash order failed");
    try {
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({orderby:user._id});
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount){
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal;
        }
        //uuidv4();
        let newOrder = await new Order({
            products:userCart.products,
            paymentIntent:{
                id:uuidv4(),
                method:"COD",
                amount:finalAmount,
                status:"Cash on Delivery",
                created: Date.now(),
                currency:"usd"
            },
            orderby:user._id,
            orderStatus:"Cash on Delivery"
            
        }).save();

        let update = userCart.products.map(item=>{
            return {
                updateOne:{
                    filter:{_id: item.product._id},
                    update:{ $inc:{ quantity:-item.count, sold:+item.count}}
                }
            }
        })
        console.log(update)
        const updated = await Product.bulkWrite(update, {});
        res.json({message:"success"});
    }
    catch (error){
        throw new Error(error);
    }
    
})  

const getOrders = asyncHandler(async(req,res)=>{
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const userorder = await Order.findOne({orderby:_id}).populate("products.product").exec();
        res.json(userorder);
    } catch(error){
        throw new Error(error);
    }
})

const updateOrderStatus = asyncHandler(async(req,res)=>{
    const {status} = req.body;
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const updateOrder = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus:status,
                paymentIntent:{
                    status:status
                }
            },
            {new:true}
        );
        res.json(updateOrder);
    } catch(error){
        throw new Error(error);
    }
})


module.exports = {
     createUser, 
     loginUserCtrl,
     getallUser,
     getaUser,
     deleteUser,
     updateUser,
     unblockUser,
     blockUser,
     handleRefreshToken,
     logout,
     updatePassword,
     forgotPasswordToken,
     resetPassword,
     loginAdmin,
     getWishList,
     saveAddress,
     userCart,
     getUserCart,
     emptyCart,
     applyCoupon,
     createOrder,
     getOrders,
     updateOrderStatus
    };