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
      <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden group">
        <button 
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm hover:bg-neutral-900 text-gray-100 rounded-full text-3xl opacity-0 group-hover:opacity-100 transition-all"
          onClick={goToPrevious}
        >
          &#8249;
        </button>
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={images[currentIndex]} 
            alt={`Screenshot ${currentIndex + 1}`} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm hover:bg-neutral-900 text-gray-100 rounded-full text-3xl opacity-0 group-hover:opacity-100 transition-all"
          onClick={goToNext}
        >
          &#8250;
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
              index === currentIndex 
                ? 'border-primary shadow-lg shadow-primary/20' 
                : 'border-neutral-600 hover:border-neutral-500 opacity-60 hover:opacity-100'
            }`}
            onClick={() => goToSlide(index)}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;
