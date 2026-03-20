var express = require('express');
var router = express.Router();
let slugify = require('slugify');

let productSchema = require('../schemas/products');
let inventorySchema = require('../schemas/inventory');

// GET ALL PRODUCTS
// /api/v1/products
router.get('/', async function (req, res, next) {
  let titleQ = req.query.title ? req.query.title : '';
  let maxPrice = req.query.maxPrice ? req.query.maxPrice : 1E4;
  let minPrice = req.query.minPrice ? req.query.minPrice : 0;

  let data = await productSchema.find({})
    .populate({ path: 'category', select: 'name images' });

  let result = data.filter(function (e) {
    return (!e.isDeleted) &&
      e.title.toLowerCase().includes(titleQ.toLowerCase()) &&
      e.price > minPrice &&
      e.price < maxPrice;
  });

  res.send(result);
});

// GET PRODUCT BY SLUG
router.get('/slug/:slug', async function (req, res, next) {
  let slug = req.params.slug;
  let result = await productSchema.findOne({ slug: slug });

  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    });
  }
});

// GET PRODUCT BY ID
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productSchema.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({
        message: "ID NOT FOUND"
      });
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    });
  }
});

// CREATE PRODUCT + CREATE INVENTORY
router.post('/', async function (req, res, next) {
  try {
    let newObj = new productSchema({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-',
        lower: true,
        locale: 'vi',
      }),
      price: req.body.price,
      description: req.body.description,
      category: req.body.categoryId,
      images: req.body.images
    });

    await newObj.save();

    await inventorySchema.create({
      product: newObj._id,
      stock: 0,
      reserved: 0,
      soldCount: 0
    });

    res.status(201).send({
      message: 'CREATE PRODUCT SUCCESS',
      product: newObj
    });
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

// UPDATE PRODUCT
router.put('/:id', async function (req, res, next) {
  try {
    let result = await productSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!result) {
      return res.status(404).send({
        message: "ID NOT FOUND"
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    });
  }
});

// SOFT DELETE PRODUCT
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await productSchema.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).send({
        message: "ID NOT FOUND"
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    });
  }
});

module.exports = router;