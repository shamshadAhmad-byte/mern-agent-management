const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const { protect, adminOnly } = require('../middleware/auth');


router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, mobile, and password'
      });
    }

    if (!mobile.countryCode || !mobile.number) {
      return res.status(400).json({
        success: false,
        message: 'Mobile must include countryCode and number'
      });
    }

    const existingAgent = await Agent.findOne({ email });

    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this email already exists'
      });
    }

    const agent = await Agent.create({
      name,
      email,
      mobile: {
        countryCode: mobile.countryCode,
        number: mobile.number
      },
      password,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: agent
    });
  } catch (error) {
    console.error('Create agent error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating agent',
      error: error.message
    });
  }
});


router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const agents = await Agent.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-password');

    const total = await Agent.countDocuments(query);

    res.status(200).json({
      success: true,
      count: agents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: agents
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agents',
      error: error.message
    });
  }
});

router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching agent',
      error: error.message
    });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, mobile, isActive, password } = req.body;

    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    if (name) agent.name = name;
    if (email) agent.email = email;
    if (mobile) {
      if (mobile.countryCode) agent.mobile.countryCode = mobile.countryCode;
      if (mobile.number) agent.mobile.number = mobile.number;
    }
    if (isActive !== undefined) agent.isActive = isActive;
    if (password) agent.password = password; 

    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      data: agent
    });
  } catch (error) {
    console.error('Update agent error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating agent',
      error: error.message
    });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    await agent.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting agent',
      error: error.message
    });
  }
});

router.get('/active/count', protect, adminOnly, async (req, res) => {
  try {
    const count = await Agent.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error counting agents',
      error: error.message
    });
  }
});

module.exports = router;