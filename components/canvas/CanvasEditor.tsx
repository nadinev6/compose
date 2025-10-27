'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { EmailValidator, ValidationResult } from '@/lib/email-validation';
import { Template } from '@/lib/database.types';
import { DeviceTypeSelector, DeviceType, DEVICE_CONFIGS } from './DeviceTypeSelector';
import { OrientationToggle, Orientation } from './OrientationToggle';

interface CanvasEditorProps {
  template: Template;
  onSave: (template: Template) => Promise<void>;
  onContentChange?: (content: string) => void;
}

type TabType = 'visual' | 'code';

export function CanvasEditor({ template, onSave, onContentChange }: CanvasEditorProps) {
  const [content, setContent] = useState(template.html || '');
  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isOrientationChanging, setIsOrientationChanging] = useState(false);
  const [isZoomChanging, setIsZoomChanging] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Window resize handler for dynamic viewport adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Container resize observer for preview area dimensions
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);

    // Set initial dimensions
    const rect = container.getBoundingClientRect();
    setContainerDimensions({ width: rect.width, height: rect.height });

    return () => resizeObserver.disconnect();
  }, []);

  // State persistence and default values
  useEffect(() => {
    // Load persisted device settings from localStorage
    const savedDeviceType = localStorage.getItem('canvas-device-type') as DeviceType;
    const savedOrientation = localStorage.getItem('canvas-orientation') as Orientation;
    
    if (savedDeviceType && DEVICE_CONFIGS[savedDeviceType]) {
      setDeviceType(savedDeviceType);
    }
    
    if (savedOrientation && (savedOrientation === 'portrait' || savedOrientation === 'landscape')) {
      setOrientation(savedOrientation);
    }
  }, []);

  // Persist device type changes
  useEffect(() => {
    localStorage.setItem('canvas-device-type', deviceType);
  }, [deviceType]);

  // Persist orientation changes
  useEffect(() => {
    localStorage.setItem('canvas-orientation', orientation);
  }, [orientation]);

  // Device switching logic with zoom preservation
  const handleDeviceTypeChange = useCallback((newDeviceType: DeviceType) => {
    // Store current zoom level before switching
    const currentZoom = zoomLevel;

    setDeviceType(newDeviceType);

    // Reset to portrait when switching to a device that supports orientation
    // or when switching from a device that doesn't support orientation
    const currentConfig = DEVICE_CONFIGS[deviceType];
    const newConfig = DEVICE_CONFIGS[newDeviceType];

    if (!currentConfig.supportsOrientation || newConfig.supportsOrientation) {
      setOrientation('portrait');
    }

    // Preserve zoom level across device changes
    // Only adjust if the current zoom would make content too large for new device
    const newConfig_dimensions = newConfig.dimensions.portrait;
    const availableWidth = containerDimensions.width;

    if (availableWidth > 0) {
      const scaledWidth = newConfig_dimensions.width * (currentZoom / 100);
      if (scaledWidth > availableWidth) {
        // Auto-adjust zoom to fit, but preserve user preference when possible
        const maxFitZoom = Math.floor((availableWidth / newConfig_dimensions.width) * 100);
        setZoomLevel(Math.max(25, Math.min(currentZoom, maxFitZoom)));
      } else {
        // Keep current zoom level
        setZoomLevel(currentZoom);
      }
    }
  }, [deviceType, zoomLevel, containerDimensions]);

  const handleOrientationChange = useCallback((newOrientation: Orientation) => {
    const currentConfig = DEVICE_CONFIGS[deviceType];

    // Only allow orientation change for devices that support it
    if (!currentConfig.supportsOrientation) {
      return;
    }

    // Trigger orientation change animation
    setIsOrientationChanging(true);
    setTimeout(() => setIsOrientationChanging(false), 400);

    // Store current zoom level before orientation change
    const currentZoom = zoomLevel;

    setOrientation(newOrientation);

    // Preserve zoom level across orientation changes
    // Check if new orientation fits with current zoom
    const newDimensions = currentConfig.dimensions[newOrientation];
    const availableWidth = containerDimensions.width;

    if (availableWidth > 0) {
      const scaledWidth = newDimensions.width * (currentZoom / 100);
      if (scaledWidth > availableWidth) {
        // Auto-adjust zoom to fit new orientation
        const maxFitZoom = Math.floor((availableWidth / newDimensions.width) * 100);
        setZoomLevel(Math.max(25, Math.min(currentZoom, maxFitZoom)));
      } else {
        // Keep current zoom level
        setZoomLevel(currentZoom);
      }
    }
  }, [deviceType, zoomLevel, containerDimensions]);

  // Validate orientation is supported by current device
  const isOrientationValid = useCallback(() => {
    const config = DEVICE_CONFIGS[deviceType];
    return config.supportsOrientation || orientation === 'portrait';
  }, [deviceType, orientation]);

  // Reset orientation if current device doesn't support it
  useEffect(() => {
    if (!isOrientationValid()) {
      setOrientation('portrait');
    }
  }, [deviceType, isOrientationValid]);

  // Validate on content change
  useEffect(() => {
    if (content) {
      const result = EmailValidator.validate(content);
      setValidationResult(result);
    }
  }, [content]);

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleSave = useCallback(async () => {
    if (!validationResult) return;

    // Prevent saving if there are critical errors
    const criticalErrors = validationResult.errors.filter(e => e.type === 'error');
    if (criticalErrors.length > 0) {
      console.warn('Cannot save template with critical errors');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...template,
        html: content,
        validation_score: validationResult.score
      });
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  }, [validationResult, onSave, template, content]);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== template.html && content.trim() !== '') {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, template.html, handleSave]);


  const getPreviewStyles = (
    deviceType: DeviceType,
    orientation: Orientation,
    zoomLevel: number
  ) => {
    const config = DEVICE_CONFIGS[deviceType];
    const dimensions = config.dimensions[orientation];

    const baseStyles = {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      
      maxWidth: '100%',
      maxHeight: '100%',
      
      transform: `scale(${zoomLevel / 100})`,
      transformOrigin: 'center center',
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform, width, height',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      overflow: 'visible' as const,
    };

    return baseStyles;
  };

  // Responsive layout adjustments
  const getResponsiveAdjustments = () => {
    if (containerDimensions.width === 0) return { shouldStack: false, adjustedZoom: zoomLevel };

    const isSmallScreen = containerDimensions.width < 768;
    const isMediumScreen = containerDimensions.width < 1024;

    // Calculate if we should stack validation panel below on small screens
    const shouldStack = isSmallScreen && showValidationPanel;

    // Auto-adjust zoom for better fit on smaller screens
    let adjustedZoom = zoomLevel;
    if (isSmallScreen) {
      const config = DEVICE_CONFIGS[deviceType];
      const dimensions = config.dimensions[orientation];
      
      // Calculate available width based on whether the validation panel is stacked or side-by-side
      const validationPanelWidth = showValidationPanel && !shouldStack ? 320 : 0;
      const availableWidth = containerDimensions.width - validationPanelWidth - 40; 
      
      if (dimensions.width * (zoomLevel / 100) > availableWidth) {
        adjustedZoom = Math.max(25, Math.floor((availableWidth / dimensions.width) * 100));
      }
    }

    return { shouldStack, adjustedZoom, isSmallScreen, isMediumScreen };
  };

  // Current preview styles using new state structure with responsive adjustments
  const getCurrentPreviewStyles = () => {
    const { adjustedZoom } = getResponsiveAdjustments();
    return getPreviewStyles(deviceType, orientation, adjustedZoom);
  };

  const getPreviewContainerClass = () => {
    return 'flex-1 flex justify-center items-center bg-gray-100 min-w-0 min-h-0';
  };

  const getDeviceFrameClass = (deviceType: DeviceType) => {
    const baseClass = 'bg-white shadow-lg mx-auto preview-frame';
    
    switch (deviceType) {
      case 'iphone':
        return `${baseClass} device-frame-iphone`;
      case 'android':
        return `${baseClass} device-frame-android`;
      case 'tablet':
      case 'desktop':
      default:
        return baseClass;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="canvas-editor flex flex-col h-full">
      {/* Header with tabs and validation score */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'code'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'visual'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content Area: Editor/Preview + Validation Panel */}
      <div className={`flex flex-1 overflow-hidden min-h-0 transition-all duration-300 ease-in-out ${getResponsiveAdjustments().shouldStack ? 'flex-col' : 'flex-row'}`}>
        
        {/* Editor/Preview Area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0"> 
          {activeTab === 'code' ? (
            <div className="flex-1">
              <Editor
                height="100%"
                language="html"
                value={content}
                onChange={handleContentChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0 min-h-0"> 
              {/* Preview Controls */}
              <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 flex-wrap gap-2">
                {/* Device Controls Group */}
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Device Type Selector */}
                  <DeviceTypeSelector
                    selectedDevice={deviceType}
                    onDeviceChange={handleDeviceTypeChange}
                  />

                  {/* Orientation Toggle */}
                  <OrientationToggle
                    orientation={orientation}
                    onOrientationChange={handleOrientationChange}
                    disabled={!DEVICE_CONFIGS[deviceType].supportsOrientation}
                  />
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => {
                      setIsZoomChanging(true);
                      setTimeout(() => setIsZoomChanging(false), 300);
                      setZoomLevel(Math.max(25, zoomLevel - 25));
                    }}
                    className="p-1 rounded bg-white text-gray-700 hover:bg-gray-50 border transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Zoom Out"
                    disabled={zoomLevel <= 25}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-xs md:text-sm font-medium text-gray-700 min-w-[2.5rem] md:min-w-[3rem] text-center transition-all duration-200">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => {
                      setIsZoomChanging(true);
                      setTimeout(() => setIsZoomChanging(false), 300);
                      setZoomLevel(Math.min(200, zoomLevel + 25));
                    }}
                    className="p-1 rounded bg-white text-gray-700 hover:bg-gray-50 border transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Zoom In"
                    disabled={zoomLevel >= 200}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsZoomChanging(true);
                      setTimeout(() => setIsZoomChanging(false), 300);
                      setZoomLevel(100);
                    }}
                    className="px-2 py-1 text-xs rounded bg-white text-gray-700 hover:bg-gray-50 border hidden sm:block transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Preview Frame Container */}
              <div 
                ref={previewContainerRef} 
                className={getPreviewContainerClass()} 
              >
                <div
                  className={getDeviceFrameClass(deviceType)}
                  style={getPreviewStyles(deviceType, orientation, getResponsiveAdjustments().adjustedZoom)}
                  data-orientation-changing={isOrientationChanging}
                  data-zoom-changing={isZoomChanging}
                >
                  <iframe
                    srcDoc={content}
                    className="w-full h-full border-0"
                    style={{
                      borderRadius: '8px',
                    }}
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>

              {/* Device Frame Styles */}
              <style jsx>{`
                .device-frame-iphone {
                  border-radius: 25px;
                  border: 3px solid #e5e7eb;
                  padding: 8px 4px;
                  background: #f9fafb;
                  position: relative;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  animation: deviceFrameIn 0.5s ease-out;
                }
                
                .device-frame-iphone::before {
                  content: '';
                  position: absolute;
                  top: 8px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 60px;
                  height: 6px;
                  background: #d1d5db;
                  border-radius: 3px;
                  transition: all 0.3s ease-in-out;
                }
                
                .device-frame-android {
                  border-radius: 20px;
                  border: 2px solid #e5e7eb;
                  padding: 6px 3px;
                  background: #f9fafb;
                  position: relative;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  animation: deviceFrameIn 0.5s ease-out;
                }
                
                .device-frame-android::before {
                  content: '';
                  position: absolute;
                  top: 6px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 8px;
                  height: 8px;
                  background: #d1d5db;
                  border-radius: 50%;
                  transition: all 0.3s ease-in-out;
                }
                
                .preview-frame {
                  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                @keyframes deviceFrameIn {
                  from {
                    opacity: 0;
                    transform: scale(0.95) translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                  }
                }
                
                .preview-frame[data-orientation-changing="true"] {
                  animation: orientationChange 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                @keyframes orientationChange {
                  0% {
                    transform: scale(1);
                  }
                  50% {
                    transform: scale(0.98);
                  }
                  100% {
                    transform: scale(1);
                  }
                }
                
                .preview-frame[data-zoom-changing="true"] {
                  animation: zoomChange 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                @keyframes zoomChange {
                  0% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0.95;
                  }
                  100% {
                    opacity: 1;
                  }
                }
              `}</style>
            </div>
          )}
        </div>

        {/* Validation Panel */}
        {showValidationPanel && validationResult && (
          <div className={`${
            getResponsiveAdjustments().shouldStack 
              ? 'w-full border-t max-h-60' 
              : 'w-80 border-l h-full' 
          } border-gray-200 bg-white overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out`}>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Validation Results</h3>

              {/* Summary */}
              <div className={`p-3 rounded-lg mb-4 ${getScoreBgColor(validationResult.score)}`}>
                <p className="text-sm font-medium">
                  {EmailValidator.getValidationSummary(validationResult)}
                </p>
              </div>

              {/* Errors */}
              {validationResult.errors.filter(e => e.type === 'error').length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                    Errors ({validationResult.errors.filter(e => e.type === 'error').length})
                  </h4>
                  <div className="space-y-2">
                    {validationResult.errors
                      .filter(e => e.type === 'error')
                      .map((error, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 border border-red-200 rounded text-sm"
                        >
                          <p className="font-medium text-red-900 mb-1">{error.message}</p>
                          {error.suggestion && (
                            <p className="text-red-700 text-xs mt-1">
                              💡 {error.suggestion}
                            </p>
                          )}
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                            {error.category}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full"></span>
                    Warnings ({validationResult.warnings.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResult.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm"
                      >
                        <p className="font-medium text-yellow-900 mb-1">{warning.message}</p>
                        {warning.suggestion && (
                          <p className="text-yellow-700 text-xs mt-1">
                            💡 {warning.suggestion}
                          </p>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {warning.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success State */}
              {validationResult.errors.filter(e => e.type === 'error').length === 0 &&
                validationResult.warnings.length === 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-sm font-medium text-green-900">
                      Perfect! Your email template is fully compatible.
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}