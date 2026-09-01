import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon, FileText, HardDrive, MapPin, Calendar, Settings, ChevronDown, Eye, EyeOff, Trash2, Upload, Radio, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { SatelliteImage } from '../../types/satellite';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatFileSize, formatDate, formatResolution } from '../../utils/formatUtils';
import { motion } from 'framer-motion';

interface ImageCardProps {
  image: SatelliteImage;
  isSelected: boolean;
  isComparison: boolean;
  onSelect: () => void;
  onSetComparison: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
}

function ImageCard({ image, isSelected, isComparison, onSelect, onSetComparison, onRemove, onToggleVisibility }: ImageCardProps) {
  const modalityColors = {
    optical: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    sar: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    multispectral: 'text-green-400 bg-green-500/10 border-green-500/20',
    hyperspectral: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  };

  const modalityIcons = {
    optical: ImageIcon,
    sar: HardDrive,
    multispectral: MapPin,
    hyperspectral: Settings,
  };

  const ModalityIcon = modalityIcons[image.modality];

  return (
    <div className={clsx(
      'card relative overflow-hidden transition-all duration-200',
      isSelected && 'border-cyan-500/50 shadow-glow-cyan',
      isComparison && 'border-teal-500/50'
    )}>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Select as primary" position="top">
          <button onClick={onSelect} className={clsx('p-1.5 rounded bg-space-900/80 text-space-300 hover:text-cyan-400 transition-colors', isSelected && 'text-cyan-400')}>
            {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
          </button>
        </Tooltip>
        <Tooltip content="Set as comparison" position="top">
          <button onClick={onSetComparison} className={clsx('p-1.5 rounded bg-space-900/80 text-space-300 hover:text-teal-400 transition-colors', isComparison && 'text-teal-400')}>
            <Radio className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip content={image.visible ? 'Hide layer' : 'Show layer'} position="top">
          <button onClick={onToggleVisibility} className="p-1.5 rounded bg-space-900/80 text-space-300 hover:text-space-100 transition-colors">
            {image.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </Tooltip>
        <Tooltip content="Remove image" position="top">
          <button onClick={onRemove} className="p-1.5 rounded bg-space-900/80 text-space-300 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      
      <div className="aspect-square relative bg-space-800">
        {image.thumbnailUrl ? (
          <img 
            src={image.thumbnailUrl} 
            alt={image.name || image.filename}
            className="w-full h-full object-cover"
            style={{ opacity: image.visible ? 1 : 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ModalityIcon className="w-12 h-12 text-space-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-space-950/80 via-transparent to-transparent" />
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-space-100 truncate">{image.name || image.filename}</h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" size="sm" className={modalityColors[image.modality]}>
                <ModalityIcon className="w-3 h-3 mr-1" />
                {image.modality}
              </Badge>
              <Badge variant="outline" size="sm" className="text-space-500">
                {formatResolution(image.resolution)}
              </Badge>
              <Badge variant="outline" size="sm" className="text-space-500">
                {formatDate(image.acquisitionDate)}
              </Badge>
            </div>
          </div>
          {isSelected && <span className="text-cyan-400 text-xs font-mono">PRIMARY</span>}
          {isComparison && <span className="text-teal-400 text-xs font-mono">COMPARE</span>}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs text-space-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(image.acquisitionDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{image.location?.bbox ? `${image.location.bbox[0].toFixed(3)}, ${image.location.bbox[1].toFixed(3)}` : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>{formatFileSize(image.fileSize)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImageInputPanel() {
  const { 
    images, 
    selectedImageId, 
    comparisonImageId, 
    addImage, 
    removeImage, 
    selectImage, 
    setComparisonImage,
    setImageVisibility,
    availableDatasets
  } = useWorkspace();

  const [showDatasetBrowser, setShowDatasetBrowser] = useState(false);
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const newImage: SatelliteImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        name: file.name,
        url: URL.createObjectURL(file),
        modality: 'optical',
        sensor: 'Unknown',
        resolution: 10,
        acquisitionDate: new Date(),
        location: { lat: 0, lng: 0, bbox: [0, 0, 1, 1] },
        crs: 'EPSG:4326',
        format: 'GeoTIFF',
        fileSize: file.size,
        width: 0,
        height: 0,
        thumbnailUrl: URL.createObjectURL(file),
        visible: true,
        bounds: [0, 0, 1, 1],
        metadata: {},
      };
      addImage(newImage);
      selectImage(newImage.id);
    });
  }, [addImage, selectImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/tiff': ['.tif', '.tiff'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/octet-stream': ['.geotiff'],
    },
    maxFiles: 5,
    noClick: false,
    noKeyboard: false,
  });

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddFromDataset = (image: SatelliteImage) => {
    addImage({ ...image, id: `dataset-${image.id}`, visible: true });
    selectImage(`dataset-${image.id}`);
    setShowDatasetBrowser(false);
  };

  const handleToggleDataset = (datasetId: string) => {
    setExpandedDataset(expandedDataset === datasetId ? null : datasetId);
  };

  return (
    <div {...getRootProps()} className={clsx('h-full flex flex-col bg-space-900/50 backdrop-blur-sm', isDragActive && 'border-cyan-500/50 shadow-glow-cyan')}>
      <input {...getInputProps()} ref={fileInputRef} type="file" multiple className="hidden" />
      
      <div className="p-3 border-b border-space-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-space-950" />
          </div>
          <div>
            <h2 className="font-semibold text-space-100 text-sm">IMAGE INPUT</h2>
            <p className="text-xs text-space-500">{images.length} image{images.length !== 1 ? 's' : ''} loaded</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowDatasetBrowser(!showDatasetBrowser)}>
            <FileText className="w-4 h-4 mr-1" />
            Datasets
          </Button>
          <Button variant="secondary" size="sm" onClick={handleFileInputClick}>
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {images.length === 0 && !isDragActive && (
          <div className="flex flex-col items-center justify-center h-full text-space-500">
            <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed', isDragActive ? 'border-cyan-500/50' : 'border-space-700')}>
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-space-400 text-center mb-1">Drag & drop satellite images here</p>
            <p className="text-xs text-space-600 text-center">Supports GeoTIFF, PNG, JPEG up to 5 files</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={selectedImageId === image.id}
                isComparison={comparisonImageId === image.id}
                onSelect={() => selectImage(image.id)}
                onSetComparison={() => setComparisonImage(image.id)}
                onRemove={() => removeImage(image.id)}
                onToggleVisibility={() => setImageVisibility(image.id, !image.visible)}
              />
            ))}
          </div>
        )}

        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-500/50 flex items-center justify-center z-10 rounded-lg"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
              <p className="text-cyan-400 font-medium">Drop images here</p>
            </div>
          </motion.div>
        )}
      </div>

      {showDatasetBrowser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-space-950/80 backdrop-blur-sm"
            onClick={() => setShowDatasetBrowser(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[80vh] bg-space-900 border border-space-700 rounded-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-space-700 flex items-center justify-between">
              <h3 className="font-semibold text-space-100">Sample Datasets</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDatasetBrowser(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {availableDatasets.map((dataset: typeof availableDatasets[0]) => (
                <div key={dataset.id} className="card overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-space-800/50"
                    onClick={() => handleToggleDataset(dataset.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-space-100">{dataset.name}</p>
                        <p className="text-xs text-space-500">{dataset.description}</p>
                      </div>
                    </div>
                    <ChevronDown className={clsx('w-4 h-4 text-space-400 transition-transform', expandedDataset === dataset.id && 'rotate-180')} />
                  </div>
                  {expandedDataset === dataset.id && (
                    <div className="p-3 border-t border-space-700 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {dataset.image ? (
                        <>
                          <button
                            key={dataset.image.id}
                            onClick={() => handleAddFromDataset(dataset.image)}
                            className="card-hover p-2 text-center aspect-square relative group overflow-hidden"
                          >
                            <div className="aspect-square bg-space-800 rounded mb-2 flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-space-600" />
                            </div>
                            <p className="text-xs text-space-300 truncate">{dataset.image.name || dataset.image.filename}</p>
                            <p className="text-[10px] text-space-500">{formatResolution(dataset.image.resolution)}</p>
                          </button>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}