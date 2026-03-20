const express = require('express');
const router = express.Router();

const Inventory = require('../schemas/inventory');

// GET ALL INVENTORY có join product
router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory.find().populate('product');
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET INVENTORY BY ID có join product
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('product');

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD STOCK
router.post('/add-stock', async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product và quantity phải hợp lệ' });
    }

    const inventory = await Inventory.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy inventory của product này' });
    }

    inventory.stock += quantity;
    await inventory.save();

    res.status(200).json({
      message: 'Tăng stock thành công',
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REMOVE STOCK
router.post('/remove-stock', async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product và quantity phải hợp lệ' });
    }

    const inventory = await Inventory.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy inventory của product này' });
    }

    if (inventory.stock < quantity) {
      return res.status(400).json({ message: 'Stock không đủ để giảm' });
    }

    inventory.stock -= quantity;
    await inventory.save();

    res.status(200).json({
      message: 'Giảm stock thành công',
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RESERVATION: giảm stock, tăng reserved
router.post('/reservation', async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product và quantity phải hợp lệ' });
    }

    const inventory = await Inventory.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy inventory của product này' });
    }

    if (inventory.stock < quantity) {
      return res.status(400).json({ message: 'Stock không đủ để reservation' });
    }

    inventory.stock -= quantity;
    inventory.reserved += quantity;
    await inventory.save();

    res.status(200).json({
      message: 'Reservation thành công',
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SOLD: giảm reserved, tăng soldCount
router.post('/sold', async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product và quantity phải hợp lệ' });
    }

    const inventory = await Inventory.findOne({ product });

    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy inventory của product này' });
    }

    if (inventory.reserved < quantity) {
      return res.status(400).json({ message: 'Reserved không đủ để sold' });
    }

    inventory.reserved -= quantity;
    inventory.soldCount += quantity;
    await inventory.save();

    res.status(200).json({
      message: 'Sold thành công',
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;