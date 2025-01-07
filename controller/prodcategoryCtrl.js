const Category=require('../models/prodcategoryModel');
const asynHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createCategory = asynHandler(async(req, res)=>{
    try {
        const newCategory = await Category.create(req.body);
        res.json ({
            newCategory
        })
    } catch(error) {
        throw new Error(error);
    }
})

const updateCategory = asynHandler(async(req, res)=>{
    const {id} = req.params;
    try {
        const updateCategory = await Category.findByIdAndUpdate(id, req.body, {new:true});
        res.json ({
            updateCategory
        })
    } catch(error) {
        throw new Error(error);
    }
})

const deleteCategory = asynHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deleteCategory = await Category.findByIdAndDelete(id);
        res.json ({
            deleteCategory
        })
    } catch(error) {
        throw new Error(error);
    }
})

const getCategory = asynHandler(async(req, res)=>{
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const getaCategory = await Category.findById(id);
        res.json ({
            getaCategory
        })
    } catch(error) {
        throw new Error(error);
    }
})


const getAllCategory = asynHandler(async(req, res)=>{
    try {
        const getallCategory = await Category.find();
        res.json ({
            getallCategory
        })
    } catch(error) {
        throw new Error(error);
    }
})


module.exports = { createCategory, updateCategory, deleteCategory, getCategory,getAllCategory}
