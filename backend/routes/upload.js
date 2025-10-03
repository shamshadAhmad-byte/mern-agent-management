const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const Agent = require('../models/Agent');
const List = require('../models/List');
const { protect, adminOnly } = require('../middleware/auth');
const upload =require('../middleware/multer');


const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error('Error parsing Excel file: ' + error.message);
  }
};

const validateData = (data) => {
  const errors = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, errors: ['File is empty or invalid'] };
  }

  const firstRow = data[0];
  const requiredFields = ['FirstName', 'Phone'];
  
  for (const field of requiredFields) {
    if (!(field in firstRow)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  data.forEach((row, index) => {
    if (!row.FirstName || row.FirstName.trim() === '') {
      errors.push(`Row ${index + 1}: FirstName is required`);
    }
    
    if (!row.Phone || row.Phone.toString().trim() === '') {
      errors.push(`Row ${index + 1}: Phone is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

const distributeItems = (items, agents) => {
  const distribution = [];
  const agentCount = agents.length;
  const itemsPerAgent = Math.floor(items.length / agentCount);
  const remainder = items.length % agentCount;

  let currentIndex = 0;

  agents.forEach((agent, agentIndex) => {
    const itemsForThisAgent = itemsPerAgent + (agentIndex < remainder ? 1 : 0);
    
    for (let i = 0; i < itemsForThisAgent && currentIndex < items.length; i++) {
      distribution.push({
        ...items[currentIndex],
        assignedTo: agent._id
      });
      currentIndex++;
    }
  });

  return distribution;
};

router.post('/', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    let parsedData;

    if (fileExt === '.csv') {
      parsedData = await parseCSV(filePath);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      parsedData = parseExcel(filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Invalid file format'
      });
    }

    const validation = validateData(parsedData);
    
    if (!validation.valid) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Data validation failed',
        errors: validation.errors
      });
    }

    const agents = await Agent.find({ isActive: true }).select('_id name email');

    if (agents.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'No active agents available for distribution'
      });
    }

    const uploadBatch = uuidv4();

    const itemsToDistribute = parsedData.map(row => ({
      firstName: row.FirstName?.trim() || '',
      phone: row.Phone?.toString().trim() || '',
      notes: row.Notes?.trim() || ''
    }));

    const distributedItems = distributeItems(itemsToDistribute, agents);

    const listsToInsert = distributedItems.map(item => ({
      ...item,
      uploadBatch,
      uploadedBy: req.user.id,
      status: 'pending'
    }));

    const insertedLists = await List.insertMany(listsToInsert);

    fs.unlinkSync(filePath);

    const distributionSummary = agents.map(agent => {
      const agentItems = insertedLists.filter(
        item => item.assignedTo.toString() === agent._id.toString()
      );
      return {
        agentId: agent._id,
        agentName: agent.name,
        agentEmail: agent.email,
        itemCount: agentItems.length
      };
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded and distributed successfully',
      data: {
        uploadBatch,
        totalItems: insertedLists.length,
        agentsCount: agents.length,
        distribution: distributionSummary
      }
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading and processing file',
      error: error.message
    });
  }
});

router.get('/lists', protect, adminOnly, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      agentId, 
      uploadBatch, 
      status 
    } = req.query;

    const query = {};
    
    if (agentId) {
      query.assignedTo = agentId;
    }
    
    if (uploadBatch) {
      query.uploadBatch = uploadBatch;
    }
    
    if (status) {
      query.status = status;
    }

    const lists = await List.find(query)
      .populate('assignedTo', 'name email mobile')
      .populate('uploadedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await List.countDocuments(query);

    res.status(200).json({
      success: true,
      count: lists.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: lists
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lists',
      error: error.message
    });
  }
});

router.get('/batches', protect, adminOnly, async (req, res) => {
  try {

    const batches = await List.aggregate([
      {
        $group: {
          _id: '$uploadBatch',
          totalItems: { $sum: 1 },
          uploadDate: { $first: '$createdAt' },
          uploadedBy: { $first: '$uploadedBy' }
        }
      },
      {
        $sort: { uploadDate: -1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploader'
        }
      },
      {
        $unwind: {
          path: '$uploader',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          uploadBatch: '$_id',
          totalItems: 1,
          uploadDate: 1,
          uploaderEmail: '$uploader.email',
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upload batches',
      error: error.message
    });
  }
});

router.get('/distribution/:batchId', protect, adminOnly, async (req, res) => {
  try {
    const { batchId } = req.params;

    const distribution = await List.aggregate([
      {
        $match: { uploadBatch: batchId }
      },
      {
        $group: {
          _id: '$assignedTo',
          itemCount: { $sum: 1 },
          items: { $push: '$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      {
        $unwind: '$agent'
      },
      {
        $project: {
          agentId: '$_id',
          agentName: '$agent.name',
          agentEmail: '$agent.email',
          itemCount: 1,
          items: 1
        }
      },
      {
        $sort: { agentName: 1 }
      }
    ]);

    if (distribution.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const totalItems = distribution.reduce((sum, d) => sum + d.itemCount, 0);

    res.status(200).json({
      success: true,
      data: {
        uploadBatch: batchId,
        totalItems,
        agentsCount: distribution.length,
        distribution
      }
    });
  } catch (error) {
    console.error('Get distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching distribution details',
      error: error.message
    });
  }
});

router.delete('/batch/:batchId', protect, adminOnly, async (req, res) => {
  try {
    const { batchId } = req.params;

    const result = await List.deleteMany({ uploadBatch: batchId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: `Batch deleted successfully. ${result.deletedCount} items removed.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message
    });
  }
});

module.exports = router;