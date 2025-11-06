import { useState } from 'react';
import './ImageCarousel.css';

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
    <div className="carousel-container">
      <div className="carousel-main">
        <button className="carousel-button prev" onClick={goToPrevious}>
          &#8249;
        </button>
        <div className="carousel-image-wrapper">
          <img src={images[currentIndex]} alt={`Screenshot ${currentIndex + 1}`} />
        </div>
        <button className="carousel-button next" onClick={goToNext}>
          &#8250;
        </button>
      </div>

      <div className="carousel-thumbnails">
        {images.map((image, index) => (
          <div
            key={index}
            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;
