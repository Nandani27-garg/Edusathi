const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET /scholarships - Browse and filter scholarships
router.get('/', (req, res) => {
  const {
    state,
    education_level,
    category,
    max_income,
    gender,
    disability_status,
    min_percentage
  } = req.query;

  let query = 'SELECT * FROM scholarships WHERE 1=1';
  const params = [];

  // Filter by state
  if (state && state !== 'All') {
    query += " AND (state = ? OR state = 'All India')";
    params.push(state);
  }

  // Filter by category
  if (category && category !== 'All') {
    query += " AND (category = ? OR category = 'All')";
    params.push(category);
  }

  // Filter by gender
  if (gender && gender !== 'All') {
    query += " AND (gender = ? OR gender = 'All')";
    params.push(gender);
  }

  // Filter by annual family income limit
  if (max_income) {
    const incomeVal = parseInt(max_income, 10);
    if (!isNaN(incomeVal)) {
      query += ' AND max_income >= ?';
      params.push(incomeVal);
    }
  }

  // Filter by minimum marks percentage
  if (min_percentage) {
    const marksVal = parseFloat(min_percentage);
    if (!isNaN(marksVal)) {
      query += ' AND min_percentage <= ?';
      params.push(marksVal);
    }
  }

  // Filter by disability
  if (disability_status === 'Yes') {
    query += " AND disability_status = 'Yes'";
  }

  query += ' ORDER BY id ASC';

  const scholarships = db.query(query, params).map(s => {
    let docs = [];
    try {
      docs = JSON.parse(s.required_documents || '[]');
    } catch (e) {
      docs = [];
    }
    return {
      ...s,
      required_documents_list: docs
    };
  });

  res.render('scholarships', {
    activeTab: 'scholarships',
    scholarships,
    filters: {
      state: state || 'All',
      education_level: education_level || 'All',
      category: category || 'All',
      max_income: max_income || '',
      gender: gender || 'All',
      disability_status: disability_status || 'Either',
      min_percentage: min_percentage || ''
    }
  });
});

module.exports = router;
