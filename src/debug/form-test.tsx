// Debug test to check exact frontend form submission
import React, { useState } from 'react';
import { sweetSpotService } from '../services/sweetSpotService';

const testFormData = {
  niche: "KEY NICHE",
  account: "Test Account Debug",
  keywords: "debug test",
  audience: 12345,
  revenueStream: "Course",
  pricing: "Rp1,000,000"
};

async function debugFormSubmission() {
  console.log('🐛 Debug: Testing form submission...');
  console.log('📤 Form data:', testFormData);
  
  try {
    const result = await sweetSpotService.createEntry(testFormData);
    console.log('✅ Debug: Success!', result);
    return result;
  } catch (error) {
    console.error('❌ Debug: Error!', error);
    throw error;
  }
}

// Test the service directly
if (typeof window !== 'undefined') {
  window.debugFormSubmission = debugFormSubmission;
  console.log('Debug function available as window.debugFormSubmission()');
}

export default debugFormSubmission;
