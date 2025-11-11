'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, UserPlus, XCircle, CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface CapturedImage {
    image: any;
    descriptor: any;
    timestamp: string;
};

export default function EmployeeRegistrationForm() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    
    const [formData, setFormData] = useState({
        prefix: '',
        firstname: '',
        lastname: '',
        sex: '',
        birthdate: '',
        cid: '',
        email: '',
        // department: '',
        position_id: '',
        position_level: '',
        face_descriptor: '',
        profile_image: '',
    });

    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            console.log('Loading face-api.js models...');

            await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
            await faceapi.nets.faceExpressionNet.loadFromUri('/models');

            setModelsLoaded(true);
        } catch (err) {
            console.error('Error loading models:', err);
            alert('Failed to load face recognition models');
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });

            console.log(videoRef.current);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsCameraActive(true);

                videoRef.current.addEventListener('loadeddata', () => {
                    detectFaces();
                });
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());

            setStream(null);
            setIsCameraActive(false);
            setFaceDetected(false);
        }
    };

    const detectFaces = async () => {
        if (!modelsLoaded || !videoRef.current) return;

        try {
            /** Simulate face detection: */
            const simulateDetection = Math.random() > 0.3;
            setFaceDetected(simulateDetection);

            /** In production, use: */
            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length > 0) {
                setFaceDetected(true);

                /** Draw detection box on canvas */
                const displaySize = { 
                    width: videoRef.current.videoWidth, 
                    height: videoRef.current.videoHeight 
                };
                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resizedDetections = faceapi.resizeResults(detections, displaySize);

                const context = canvasRef.current.getContext('2d');
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            } else {
                setFaceDetected(false);
            }

            /** Continue detecting */
            if (isCameraActive && capturedImages.length < 5) {
                setTimeout(() => detectFaces(), 100);
            }
        } catch (err) {
            console.error('Error detecting face:', err);
        }
    };

    // Capture photo
    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current && modelsLoaded) {
            setIsProcessing(true);

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/png');

            const detections = await faceapi
                .detectSingleFace(video)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const faceDescriptor = detections.descriptor;

                setCapturedImages([...capturedImages, { 
                    image: imageData, 
                    descriptor: Array.from(faceDescriptor),
                    timestamp: new Date().toISOString()
                }]);
            }

            setIsProcessing(false);

            if (capturedImages.length >= 4) {
                stopCamera();
            }
        }
    };

    const removeImage = (index) => {
        setCapturedImages(capturedImages.filter((_, i) => i !== index));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.prefix.trim()) newErrors.prefix = 'Prefix is required';
        if (!formData.firstname.trim()) newErrors.firstname = 'First name is required';
        if (!formData.lastname.trim()) newErrors.lastname = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.cid.trim()) newErrors.cid = 'CID is required';
        // if (!formData.department.trim()) newErrors.department = 'Department is required';
        if (!formData.position_id.trim()) newErrors.position_id = 'Position is required';
        if (capturedImages.length < 3) {
            newErrors.images = 'Please capture at least 3 photos for accurate recognition';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setRegistrationStatus('processing');

        try {
            /** หาค่าเฉลี่ยของค่า vector แต่ละใบหน้า */
            let avgDescriptor = null;
            if (capturedImages.length > 0) {
                avgDescriptor = capturedImages[0].descriptor.map((val, i) => {
                    let sum = val;
                    for (let j = 1; j < capturedImages.length; j++) {
                        sum += capturedImages[j].descriptor[i];
                    }
                    return sum / capturedImages.length;
                });
            }

            /** POST to api */
            const result = await fetch('/api/employee/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    face_descriptor: Array.from(avgDescriptor)
                }),
            });

            setRegistrationStatus('success');

            setTimeout(() => {
                setFormData({
                    prefix: '',
                    firstname: '',
                    lastname: '',
                    sex: '',
                    birthdate: '',
                    cid: '',
                    email: '',
                    // department: '',
                    position_id: '',
                    position_level: '',
                    face_descriptor: '',
                    profile_image: '',
                });
                setCapturedImages([]);
                setRegistrationStatus(null);
            }, 3000);
        } catch (err) {
            console.error('Registration error:', err);
            setRegistrationStatus('error');
        }
    };

    const handleReset = () => {
        setFormData({
            prefix: '',
            firstname: '',
            lastname: '',
            sex: '',
            birthdate: '',
            cid: '',
            email: '',
            // department: '',
            position_id: '',
            position_level: '',
            face_descriptor: '',
            profile_image: '',
        });
        setCapturedImages([]);
        setErrors({});
        setRegistrationStatus(null);
        stopCamera();
    };

    return (
        <>
            {!modelsLoaded && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <p>Loading facial recognition models...</p>
                    </div>
                </div>
            )}

            {registrationStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium">Employee registered successfully!</p>
                    </div>
                </div>
            )}

            {registrationStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-800">
                        <XCircle className="w-5 h-5" />
                        <p className="font-medium">Registration failed. Please try again.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registration Form */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Employee Information</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า *</label>
                            <select
                                name="prefix"
                                value={formData.prefix}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.prefix ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="นาย">นาย</option>
                                <option value="นาง">นาง</option>
                                <option value="นางสาว">นางสาว</option>
                            </select>
                            {errors.prefix && <p className="text-red-500 text-sm mt-1">{errors.prefix}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
                            <input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.firstname ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="John"
                            />
                            {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
                            <input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.lastname ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Doe"
                            />
                            {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เพศ *</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.sex ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="ชาย">ชาย</option>
                                <option value="หญิง">หญิง</option>
                            </select>
                            {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด *</label>
                            <input
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.birthdate ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เลขบัตร ปชช. *</label>
                            <input
                                type="text"
                                name="cid"
                                value={formData.cid}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.cid ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0-0000-00000-00-0"
                            />
                            {errors.cid && <p className="text-red-500 text-sm mt-1">{errors.cid}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="john.doe@company.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.department ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select Department</option>
                                <option value="Engineering">Engineering</option>
                                <option value="HR">Human Resources</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                                <option value="Operations">Operations</option>
                            </select>
                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                        </div> */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง *</label>
                            <select
                                name="position_id"
                                value={formData.position_id}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.position_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="1">นักวิชาการคอมพิวเตอร์</option>
                            </select>
                            {errors.position_id && <p className="text-red-500 text-sm mt-1">{errors.position_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ระดับ</label>
                            <select
                                name="position_level"
                                value={formData.position_level}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.position_level ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">ไม่ระบุ</option>
                                <option value="ปฏิบัติงาน">ปฏิบัติงาน</option>
                                <option value="ชำนาญงาน">ชำนาญงาน</option>
                                <option value="ปฏิบัติการ">ปฏิบัติการ</option>
                                <option value="ชำนาญการ">ชำนาญการ</option>
                                <option value="ชำนาญการพิเศษ">ชำนาญการพิเศษ</option>
                            </select>
                            {errors.position_level && <p className="text-red-500 text-sm mt-1">{errors.position_level}</p>}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={registrationStatus === 'processing' || !modelsLoaded}
                                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {registrationStatus === 'processing' ? 'Registering...' : 'Register Employee'}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Capturing Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Facial Recognition Setup</h2>
                            <span className="text-sm text-gray-600">{capturedImages.length}/5 photos</span>
                        </div>

                        {/* Camera */}
                        <div className="relative mb-4">
                            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative">
                                {/* {isCameraActive ? ( */}
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                        />

                                        {modelsLoaded && (
                                            <div className="absolute top-4 right-4">
                                                <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                                                    faceDetected ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                                                }`}>
                                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                    <span className="text-sm font-medium">{faceDetected ? 'Face Detected' : 'Detecting...'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {isProcessing && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="bg-white px-6 py-4 rounded-lg">
                                                    <p className="text-gray-800 font-medium">Capturing...</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                {/* ) : (
                                    <div className="text-center p-8">
                                        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-400">Camera not active</p>
                                    </div>
                                )} */}
                            </div>
                        </div>

                        {isCameraActive && capturedImages.length < 5 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <p className="text-blue-800 text-sm text-center">
                                    Capture 3-5 photos from different angles for better accuracy
                                </p>
                            </div>
                        )}

                        {errors.images && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-red-800 text-sm text-center">{errors.images}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {!isCameraActive ? (
                                <button
                                    onClick={startCamera}
                                    disabled={!modelsLoaded || capturedImages.length >= 5}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Camera className="w-5 h-5" />
                                    Start Camera
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={stopCamera}
                                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                    >
                                        Stop Camera
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        disabled={!faceDetected || isProcessing || capturedImages.length >= 5}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                        Capture
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Captured Images List */}
                    {capturedImages.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Captured Photos</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {capturedImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={img.image} 
                                            alt={`Capture ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setShowPreview(img.image)}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Show preview button */}
            {showPreview && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-8"
                    onClick={() => setShowPreview(null)}
                >
                    <div className="relative max-w-3xl max-h-full">
                        <img src={showPreview} alt="Preview" className="max-w-full max-h-full rounded-lg" />
                        <button
                            onClick={() => setShowPreview(null)}
                            className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}