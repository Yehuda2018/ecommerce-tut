const Brand=require('../models/brandModel');
const asynHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createBrand = asynHandler(async(req, res)=>{
    try {
        const newBrand = await Brand.create(req.body);
        res.json ({
            newBrand
        })
    } catch(error) {
        throw new Error(error);
    }
})

const updateBrand = asynHandler(async(req, res)=>{
    const {id} = req.params;
    try {
        const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {new:true});
        res.json ({
            updateBrand
        })
    } catch(error) {
        throw new Error(error);
    }
})

const deleteBrand = asynHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deleteBrand = await Brand.findByIdAndDelete(id);
        res.json ({
            deleteBrand
        })
    } catch(error) {
        throw new Error(error);
    }
})

const getBrand = asynHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const getaBrand = await Brand.findById(id);
        res.json ({
            getaBrand
        })
    } catch(error) {
        throw new Error(error);
    }
})


const getAllBrand = asynHandler(async(req, res)=>{
    try {
        const getallBrand = await Brand.find();
        res.json ({
            getallBrand
        })
    } catch(error) {
        throw new Error(error);
    }
})


module.exports = { createBrand, updateBrand, deleteBrand, getBrand,getAllBrand}
