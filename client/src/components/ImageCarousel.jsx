import { useState } from 'react';

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative w-full bg-neutral-900 rounded-xl overflow-hidden group" style={{ minHeight: '400px', maxHeight: '600px' }}>
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-white text-neutral-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-white text-neutral-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
              onClick={goToNext}
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '600px' }}>
          <img 
            src={images[currentIndex]} 
            alt={`Screenshot ${currentIndex + 1}`} 
            className="w-full h-full object-cover"
            style={{ maxHeight: '600px' }}
          />
        </div>

        {/* Image Counter Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-md text-white text-sm rounded-full font-medium shadow-lg">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-2 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all snap-start ${
                  index === currentIndex 
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/30' 
                    : 'ring-1 ring-neutral-700 hover:ring-neutral-600 opacity-50 hover:opacity-100'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
