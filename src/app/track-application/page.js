'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackApplication() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [searchType, setSearchType] = useState('application');

  // Sample tracking data
  const sampleApplications = {
    'BC123456': {
      type: 'Birth Certificate',
      applicantName: 'राम कुमार शर्मा',
      applicationDate: '2024-01-15',
      status: 'Under Review',
      statusColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      currentStage: 'Document Verification',
      expectedCompletion: '2024-01-22',
      stages: [
        { name: 'Application Submitted', completed: true, date: '2024-01-15' },
        { name: 'Payment Verified', completed: true, date: '2024-01-16' },
        { name: 'Document Verification', completed: false, date: '2024-01-20' },
        { name: 'Final Approval', completed: false, date: '2024-01-22' },
        { name: 'Certificate Ready', completed: false, date: '2024-01-23' }
      ],
      remarks: 'आपके दस्तावेज सत्यापन के लिए भेजे गए हैं। कृपया 2-3 दिन प्रतीक्षा करें।'
    },
    'RC789012': {
      type: 'Residence Certificate',
      applicantName: 'सुनीता पाटिल',
      applicationDate: '2024-01-10',
      status: 'Approved',
      statusColor: 'text-green-600',
      bgColor: 'bg-green-100',
      currentStage: 'Certificate Ready for Download',
      expectedCompletion: '2024-01-18',
      stages: [
        { name: 'Application Submitted', completed: true, date: '2024-01-10' },
        { name: 'Payment Verified', completed: true, date: '2024-01-11' },
        { name: 'Document Verification', completed: true, date: '2024-01-15' },
        { name: 'Final Approval', completed: true, date: '2024-01-17' },
        { name: 'Certificate Ready', completed: true, date: '2024-01-18' }
      ],
      remarks: 'आपका निवास प्रमाणपत्र तैयार है। आप इसे डाउनलोड कर सकते हैं।',
      downloadLink: '/download-certificate?id=RC789012'
    },
    'WA345678': {
      type: 'Water Connection',
      applicantName: 'अजय कुमार',
      applicationDate: '2024-01-05',
      status: 'Rejected',
      statusColor: 'text-red-600',
      bgColor: 'bg-red-100',
      currentStage: 'Application Rejected',
      expectedCompletion: 'N/A',
      stages: [
        { name: 'Application Submitted', completed: true, date: '2024-01-05' },
        { name: 'Payment Verified', completed: true, date: '2024-01-06' },
        { name: 'Document Verification', completed: true, date: '2024-01-08' },
        { name: 'Site Verification', completed: false, date: '2024-01-10' },
        { name: 'Final Approval', completed: false, date: 'N/A' }
      ],
      remarks: 'आवेदन अस्वीकार कर दिया गया है। कारण: अपूर्ण दस्तावेज। कृपया नए दस्तावेज के साथ पुनः आवेदन करें।'
    }
  };

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      alert('कृपया आवेदन संख्या दर्ज करें।');
      return;
    }

    try {
      const response = await fetch(`/api/track-application?applicationId=${trackingNumber}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        // Transform API data to match UI format
        const application = result.data[0];
        const transformedResult = {
          type: application.type || 'Application',
          applicantName: application.childName || application.applicantName || application.ownerName || 'N/A',
          applicationDate: new Date(application.submissionDate || application.registrationDate || application.applicationDate).toLocaleDateString('en-CA'),
          status: getStatusDisplay(application.status),
          statusColor: getStatusColor(application.status),
          bgColor: getStatusBgColor(application.status),
          currentStage: getCurrentStage(application.status),
          expectedCompletion: getExpectedCompletion(application),
          stages: generateStages(application),
          remarks: application.remarks || getDefaultRemarks(application.status),
          downloadLink: application.status === 'certificate_ready' || application.status === 'approved' ? `/download-certificate?id=${trackingNumber}` : null
        };
        setTrackingResult(transformedResult);
      } else {
        // Fallback to sample data for demo
        if (sampleApplications[trackingNumber]) {
          setTrackingResult(sampleApplications[trackingNumber]);
        } else {
          setTrackingResult(null);
          alert('आवेदन नंबर नहीं मिला। कृपया सही नंबर डालें।');
        }
      }
    } catch (error) {
      console.error('Tracking error:', error);
      // Fallback to sample data for demo
      if (sampleApplications[trackingNumber]) {
        setTrackingResult(sampleApplications[trackingNumber]);
      } else {
        alert('आवेदन खोजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'submitted': 'Submitted',
      'under_review': 'Under Review',
      'field_verification': 'Field Verification',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'certificate_ready': 'Certificate Ready'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'submitted': 'text-blue-600',
      'under_review': 'text-yellow-600',
      'field_verification': 'text-orange-600',
      'approved': 'text-green-600',
      'rejected': 'text-red-600',
      'certificate_ready': 'text-green-600'
    };
    return colorMap[status] || 'text-gray-600';
  };

  const getStatusBgColor = (status) => {
    const bgColorMap = {
      'submitted': 'bg-blue-100',
      'under_review': 'bg-yellow-100',
      'field_verification': 'bg-orange-100',
      'approved': 'bg-green-100',
      'rejected': 'bg-red-100',
      'certificate_ready': 'bg-green-100'
    };
    return bgColorMap[status] || 'bg-gray-100';
  };

  const getCurrentStage = (status) => {
    const stageMap = {
      'submitted': 'Application Submitted',
      'under_review': 'Document Verification',
      'field_verification': 'Field Verification',
      'approved': 'Final Approval Completed',
      'rejected': 'Application Rejected',
      'certificate_ready': 'Certificate Ready for Download'
    };
    return stageMap[status] || 'Processing';
  };

  const getExpectedCompletion = (application) => {
    if (application.status === 'approved' || application.status === 'certificate_ready') {
      return 'Completed';
    }
    if (application.status === 'rejected') {
      return 'N/A';
    }
    // Calculate expected completion based on submission date
    const submissionDate = new Date(application.submissionDate || application.registrationDate);
    const expectedDate = new Date(submissionDate);
    expectedDate.setDate(expectedDate.getDate() + 15); // Add 15 days
    return expectedDate.toLocaleDateString('en-CA');
  };

  const generateStages = (application) => {
    const baseStages = [
      { name: 'Application Submitted', completed: true, date: new Date(application.submissionDate || application.registrationDate).toLocaleDateString('en-CA') },
      { name: 'Payment Verified', completed: application.paymentStatus === 'paid' || ['under_review', 'field_verification', 'approved', 'certificate_ready'].includes(application.status), date: '' },
      { name: 'Document Verification', completed: ['approved', 'certificate_ready'].includes(application.status), date: '' },
      { name: 'Final Approval', completed: ['approved', 'certificate_ready'].includes(application.status), date: application.approvalDate ? new Date(application.approvalDate).toLocaleDateString('en-CA') : '' },
      { name: 'Certificate Ready', completed: application.status === 'certificate_ready', date: '' }
    ];

    // Add field verification stage for residence certificates
    if (application.type === 'Residence Certificate') {
      baseStages.splice(2, 0, {
        name: 'Field Verification',
        completed: ['approved', 'certificate_ready'].includes(application.status),
        date: application.fieldVerification?.completedDate ? new Date(application.fieldVerification.completedDate).toLocaleDateString('en-CA') : ''
      });
    }

    return baseStages;
  };

  const getDefaultRemarks = (status) => {
    const remarksMap = {
      'submitted': 'आपका आवेदन प्राप्त हो गया है और प्रक्रिया शुरू की गई है।',
      'under_review': 'आपके दस्तावेज सत्यापन के लिए भेजे गए हैं। कृपया 2-3 दिन प्रतीक्षा करें।',
      'field_verification': 'फील्ड वेरिफिकेशन का काम चल रहा है। जल्द ही पूरा हो जाएगा।',
      'approved': 'आपका आवेदन स्वीकृत हो गया है। प्रमाणपत्र तैयार किया जा रहा है।',
      'rejected': 'आवेदन अस्वीकार कर दिया गया है। कृपया विवरण के लिए संपर्क करें।',
      'certificate_ready': 'आपका प्रमाणपत्र तैयार है। आप इसे डाउनलोड कर सकते हैं।'
    };
    return remarksMap[status] || 'आपके आवेदन की समीक्षा की जा रही है।';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Under Review':
        return '🔍';
      case 'Approved':
        return '✅';
      case 'Rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
        <Link href="/" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
          ← वापस होम पर जाएं
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">आवेदन ट्रैकिंग</h1>
        <p className="text-gray-600">Track Your Application Status | अपने आवेदन की स्थिति जानें</p>
      </div>

      {/* Sample Applications Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-blue-800 mb-3">डेमो के लिए उपलब्ध आवेदन नंबर | Sample Application Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <p className="font-medium text-gray-800">Birth Certificate</p>
            <p className="text-blue-600 font-bold">BC123456</p>
            <p className="text-sm text-gray-600">Status: Under Review</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="font-medium text-gray-800">Residence Certificate</p>
            <p className="text-green-600 font-bold">RC789012</p>
            <p className="text-sm text-gray-600">Status: Approved</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="font-medium text-gray-800">Water Connection</p>
            <p className="text-red-600 font-bold">WA345678</p>
            <p className="text-sm text-gray-600">Status: Rejected</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">आवेदन खोजें | Search Application</h2>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                आवेदन/रसीद नंबर डालें *
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="BC123456, RC789012, WA345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                आवेदन संख्या आपको SMS/Email द्वारा भेजी गई है
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="btn-primary w-full md:w-auto"
              >
                खोजें | Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Result */}
      {trackingResult && (
        <div className="space-y-6">
          {/* Application Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {getStatusIcon(trackingResult.status)} {trackingResult.type}
                </h2>
                <p className="text-gray-600">आवेदक: {trackingResult.applicantName}</p>
                <p className="text-gray-600">आवेदन संख्या: {trackingNumber}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${trackingResult.bgColor} ${trackingResult.statusColor}`}>
                  {trackingResult.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">आवेदन दिनांक</p>
                <p className="font-medium">{trackingResult.applicationDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">वर्तमान चरण</p>
                <p className="font-medium">{trackingResult.currentStage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">अपेक्षित पूर्णता</p>
                <p className="font-medium">{trackingResult.expectedCompletion}</p>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">प्रगति ट्रैकिंग | Progress Timeline</h3>
            
            <div className="space-y-4">
              {trackingResult.stages.map((stage, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    stage.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stage.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className={`font-medium ${
                          stage.completed ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {stage.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{stage.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks and Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">टिप्पणी | Remarks</h3>
            <div className={`p-4 rounded-lg ${trackingResult.bgColor} border`}>
              <p className={`${trackingResult.statusColor} font-medium`}>
                {trackingResult.remarks}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              {trackingResult.downloadLink && (
                <Link 
                  href={trackingResult.downloadLink}
                  className="btn-primary text-center"
                >
                  प्रमाणपत्र डाउनलोड करें | Download Certificate
                </Link>
              )}
              
              {trackingResult.status === 'Rejected' && (
                <Link 
                  href={`/${trackingResult.type.toLowerCase().replace(' ', '-')}`}
                  className="btn-secondary text-center"
                >
                  नया आवेदन करें | Apply Again
                </Link>
              )}

              <button
                onClick={() => alert('सहायता के लिए संपर्क करें: 1800-XXX-XXXX')}
                className="btn-secondary"
              >
                सहायता | Help
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">सहायता संपर्क | Help & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">ग्राम पंचायत कार्यालय</h4>
                <p className="text-sm text-gray-600">फोन: 1800-XXX-XXXX</p>
                <p className="text-sm text-gray-600">ईमेल: help@grampanchayat.gov.in</p>
                <p className="text-sm text-gray-600">समय: सोमवार - शुक्रवार, 10:00 AM - 5:00 PM</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">ऑनलाइन सहायता</h4>
                <p className="text-sm text-gray-600">चैट सपोर्ट: उपलब्ध</p>
                <p className="text-sm text-gray-600">FAQ: देखें सहायता अनुभाग</p>
                <p className="text-sm text-gray-600">व्हाट्सऐप: +91-XXXXX-XXXXX</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">त्वरित कार्य | Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/birth-certificate" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">👶</div>
            <p className="text-sm font-medium">नया आवेदन</p>
          </Link>
          <Link href="/download-certificate" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📥</div>
            <p className="text-sm font-medium">डाउनलोड</p>
          </Link>
          <Link href="/complaint" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm font-medium">शिकायत</p>
          </Link>
          <Link href="/help" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">❓</div>
            <p className="text-sm font-medium">सहायता</p>
          </Link>
        </div>
      </div>
    </div>
  );
}